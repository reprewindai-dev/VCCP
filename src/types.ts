export type HarnessProvider = 'ollama' | 'gemini' | 'claude' | 'codex' | 'cursor' | 'opencode' | 'devin' | 'antigravity';

export type SystemMode = 'production' | 'demo';

export type UserRole = 'admin' | 'architect' | 'auditor' | 'operator';

export interface SkillParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: any;
}

export interface SkillSpec {
  id: string;
  name: string;
  version: string;
  description: string;
  category: 'system' | 'code-gen' | 'security' | 'data-pipeline' | 'orchestration' | 'mcp-tool';
  author: string;
  hash: string; // SHA-256
  signature: string;
  provenanceSigner: string;
  permissions: string[];
  parameters: SkillParameter[];
  eucCompatible: boolean;
  eccCompatible?: boolean;
  reputationScore: number; // 0 - 100
  codeSnippet?: string;
  updatedAt: string;
}

export interface CAPIInvocationRequest {
  skillId: string;
  harness: HarnessProvider;
  parameters: Record<string, any>;
  humanRequester: string;
  mode: SystemMode;
  byokKey?: string;
  customModel?: string;
  ollamaEndpoint?: string;
  containsPii?: boolean;
  quebecLaw25Compliance?: boolean;
  x402Token?: string;
}

export interface X402Offer {
  status: 402;
  message: 'Payment Required for Capability Execution';
  skillId: string;
  priceUsdc: number;
  priceMicros: number;
  destinationWallet: string;
  ttlSeconds: number;
  rarScopes: {
    actions: string[];
    resources: string[];
    leaseType: 'EVAPORATING_TIME_LEASE' | 'COUNT_BOUND_LEASE';
    maxInvocations: number;
  };
  bondingCurveMetrics: {
    basePrice: number;
    concurrentAgentsDemand: number;
    resourceLoadPercent: number;
    calculatedPriceUsdc: number;
  };
  revenueSplitUsdc: {
    nodeOperatorAlpha: number; // 70%
    veklomProtocolBeta: number; // 15%
    eccCreatorRoyaltyGamma: number; // 15%
  };
  settlementOptions: {
    solanaPayUrl: string;
    basePayUrl: string;
    httpSignatureSupport: boolean;
  };
  timestamp: string;
}

export interface EvaporatingCapabilityLease {
  leaseId: string;
  skillId: string;
  token: string;
  agentIdentity: string;
  humanOwner: string;
  issuedAt: string;
  expiresAt: string;
  remainingSeconds: number;
  invocationsRemaining: number;
  maxInvocations: number;
  pricePaidUsdc: number;
  rarGrantScope: string;
  status: 'ACTIVE' | 'EXPIRED_EVAPORATED' | 'EVICTED';
}

export interface PGLCertificate {
  certId: string;
  merkleRoot: string;
  blockIndex: number;
  prevBlockHash: string;
  signerPublicKey: string;
  humanRequester: string;
  executionIdentityToken: string;
  nonRepudiableHash: string;
  timestamp: string;
  verifierSignature: string;
}

export interface VNPMetrics {
  latencyMs: number;
  throughputTps: number;
  ttftMs: number;
  cpuUsagePct: number;
  memUsageMb: number;
  costMicros: number;
  region: string;
  vnpNodeId: string;
}

export interface CAPIInvocationResponse {
  executionId: string;
  skillId: string;
  harness: HarnessProvider;
  status: 'SUCCESS' | 'FAILED' | 'SANDBOX_BLOCKED';
  eiToken: string;
  pglCertificate: PGLCertificate;
  vnpMetrics: VNPMetrics;
  rawPromptTranslation: string;
  adapterBridgeLogs: string[];
  semanticDeviationIndex: number; // e.g., 0.04 (4% divergence, well within < 0.15 gate threshold)
  sdiThreshold: number; // e.g., 0.15
  output: any;
  timestamp: string;
  isDemo: boolean;
}

export interface AbideStep {
  stepId: string;
  title: string;
  capabilityRequired: string;
  harnessRecommendation: HarnessProvider;
  dependencies: string[];
  confidenceScore: number;
  subtasks: string[];
}

export interface AbideBlueprint {
  blueprintId: string;
  rawIntent: string;
  compiledSteps: AbideStep[];
  einsteinProbabilityScore: number; // e.g. 0.984 (98.4%)
  ssrnAcademicValidator: {
    paperRef: string;
    doi: string;
    validationStatus: 'VERIFIED_ACADEMIC_PROOF' | 'EMPIRICAL_STRONG';
  };
  x402Settlement: {
    settlementTx: string;
    amountMicroTokens: number;
    currency: string;
    status: 'SETTLED' | 'PENDING';
  };
  timestamp: string;
}

export interface OllamaStatus {
  connected: boolean;
  endpoint: string;
  availableModels: string[];
  activeModel?: string;
  latencyMs: number;
  error?: string;
}

export interface ContainerNodeHealth {
  nodeId: string;
  nodeName: string;
  containerId: string;
  serviceName: string;
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  cpuPercent: number;
  memoryUsedMb: number;
  memoryLimitMb: number;
  uptimeSec: number;
  region: string;
  ipAddress: string;
  lastPing: string;
}

export interface RBACPolicy {
  role: UserRole;
  allowedCapabilities: string[];
  canExecuteDemo: boolean;
  canExecuteProduction: boolean;
  canManageKeys: boolean;
  canApproveBlueprints: boolean;
  maxDailyInvocations: number;
}

export interface SecurityScanResult {
  skillId: string;
  passed: boolean;
  threatLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  astVulnerabilities: string[];
  secretLeaksFound: number;
  sandboxedExecutionOk: boolean;
  repoGateSignature: string;
  timestamp: string;
}
