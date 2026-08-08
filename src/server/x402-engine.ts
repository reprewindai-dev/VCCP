import crypto from 'node:crypto';

const DEFAULT_X402_BASE_URL = process.env.VEKLOM_X402_BASE_URL || 'https://api.veklom.com';

export interface CanonicalX402Challenge {
  status: 402;
  capabilityId: string;
  route: string;
  method: 'POST';
  x402Version: number;
  challengeId?: string;
  nonce?: string;
  amountUsdc?: string;
  network?: string;
  chainId?: number;
  asset?: string;
  payTo?: string;
  proofHeaderName: string;
  expiresAt?: string;
  paymentRequiredBase64?: string;
  raw: unknown;
}

export interface CanonicalPaidExecution {
  capabilityId: string;
  route: string;
  status: number;
  output: unknown;
  receiptId: string;
  requestId: string;
  evidenceHash: string;
  receiptUrl?: string;
  costUsdc?: string;
  policyResult?: string;
  paymentVerified?: string;
  proofHash: string;
  idempotencyKey: string;
}

export interface CanonicalEvidenceVerification {
  valid: boolean;
  receipt_id: string;
  verification_status: string;
  evidence_hash_match: boolean;
  proof_hash_match: boolean;
  signature_valid: boolean;
  reason?: string | null;
}

function baseUrl(): string {
  return DEFAULT_X402_BASE_URL.replace(/\/$/, '');
}

function capabilityRoute(skillId: string): string {
  if (!skillId || !/^[A-Za-z0-9._:-]+$/.test(skillId)) {
    throw new Error('Invalid capability/skill identifier.');
  }
  return `/api/v1/agents/skills/${encodeURIComponent(skillId)}/invoke`;
}

async function readJson(response: Response): Promise<any> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

/**
 * Obtain the payment challenge from the canonical Veklom x402 middleware by
 * calling the real protected capability without a payment proof.
 *
 * VCCP does not generate pricing, wallet addresses, settlement state, or
 * capability leases locally.
 */
export async function generateX402Offer(
  skillId: string,
  parameters: Record<string, unknown> = {}
): Promise<CanonicalX402Challenge> {
  const route = capabilityRoute(skillId);
  const response = await fetch(`${baseUrl()}${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parameters)
  });

  const body = await readJson(response);
  if (response.status !== 402) {
    throw new Error(`Expected canonical x402 challenge from ${route}; received HTTP ${response.status}.`);
  }

  return {
    status: 402,
    capabilityId: skillId,
    route,
    method: 'POST',
    x402Version: Number(body?.x402_version ?? body?.x402Version ?? 2),
    challengeId: body?.challenge_id,
    nonce: body?.nonce,
    amountUsdc: body?.amount_usdc ?? body?.amount,
    network: body?.network,
    chainId: body?.chain_id,
    asset: body?.payment_requirements?.asset_contract ?? response.headers.get('X-Payment-Asset') ?? undefined,
    payTo: body?.pay_to ?? body?.payment_requirements?.destination ?? response.headers.get('X-Payment-Address') ?? undefined,
    proofHeaderName: body?.proof_header_name ?? 'X-PAYMENT',
    expiresAt: body?.expires_at,
    paymentRequiredBase64: body?.payment_required_base64 ?? response.headers.get('payment-required') ?? undefined,
    raw: body
  };
}

/**
 * Execute a capability through the canonical paid endpoint.
 * The canonical backend verifies/settles the payment proof, executes the
 * capability, persists the receipt/evidence record, and rejects replay.
 */
export async function executePaidCapability(input: {
  skillId: string;
  paymentProof: string;
  parameters?: Record<string, unknown>;
  idempotencyKey?: string;
  challengeId?: string;
}): Promise<CanonicalPaidExecution> {
  if (!input.paymentProof?.trim()) {
    throw new Error('paymentProof is required.');
  }

  const route = capabilityRoute(input.skillId);
  const idempotencyKey = input.idempotencyKey || crypto.randomUUID();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-PAYMENT': input.paymentProof.trim(),
    'Idempotency-Key': idempotencyKey
  };
  if (input.challengeId) {
    headers['X-Payment-Challenge-ID'] = input.challengeId;
  }

  const response = await fetch(`${baseUrl()}${route}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(input.parameters || {})
  });

  const output = await readJson(response);
  if (!response.ok) {
    const detail = output?.detail || output?.error || `HTTP ${response.status}`;
    throw new Error(`Paid capability execution failed: ${detail}`);
  }

  const receiptId = response.headers.get('X-Veklom-Receipt-ID') || '';
  const requestId = response.headers.get('X-Veklom-Request-ID') || '';
  const evidenceHash = response.headers.get('X-Veklom-Evidence-ID') || '';
  if (!receiptId || !requestId || !evidenceHash) {
    throw new Error('Canonical backend returned success without required receipt/evidence headers.');
  }

  return {
    capabilityId: input.skillId,
    route,
    status: response.status,
    output,
    receiptId,
    requestId,
    evidenceHash,
    receiptUrl: response.headers.get('X-Veklom-Receipt-URL') || undefined,
    costUsdc: response.headers.get('X-Veklom-Cost-USDC') || undefined,
    policyResult: response.headers.get('X-Veklom-Policy-Result') || undefined,
    paymentVerified: response.headers.get('X-Payment-Verified') || undefined,
    proofHash: crypto.createHash('sha256').update(input.paymentProof.trim()).digest('hex'),
    idempotencyKey
  };
}

/** Verify the persisted receipt/evidence binding at the canonical backend. */
export async function verifyPaidExecution(input: {
  receiptId: string;
  proofHash: string;
  evidenceHash: string;
}): Promise<CanonicalEvidenceVerification> {
  if (!input.receiptId || !input.proofHash || !input.evidenceHash) {
    throw new Error('receiptId, proofHash, and evidenceHash are required.');
  }

  const response = await fetch(`${baseUrl()}/api/v1/x402/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      receipt_id: input.receiptId,
      proof_hash: input.proofHash,
      evidence_hash: input.evidenceHash
    })
  });

  const body = await readJson(response);
  if (!response.ok) {
    throw new Error(`Evidence verification request failed with HTTP ${response.status}.`);
  }
  return body as CanonicalEvidenceVerification;
}

/**
 * Legacy compatibility guard for older server code that still presents an
 * `x402Token`. Local VCCP lease tokens are no longer an authority primitive.
 * This function intentionally never grants authority; callers must use the
 * canonical paid-execution flow above.
 */
export function verifyLeaseToken(_token: string): {
  valid: false;
  error: string;
} {
  return {
    valid: false,
    error: 'Legacy VCCP lease tokens are retired. Use canonical x402 paid execution and receipt/evidence verification.'
  };
}
