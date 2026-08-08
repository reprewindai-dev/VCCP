# VCCP

Veklom Capability Control Plane.

## x402 status

The previous local `src/server/x402-engine.ts` demo lease engine has been removed. It used seeded/in-memory leases and did not verify the supplied payment proof before issuing authority-like tokens, so it must not be treated as a production settlement or capability-authority implementation.

VCCP should consume the canonical Veklom x402 settlement/verification and capability-authority contracts through an adapter once ownership is finalized in cAPI issue #32. Do not reintroduce local payment verification, hard-coded settlement destinations, seeded production leases, or independent pricing truth here.

Any future VCCP paid-capability UI must display authoritative runtime data and clearly distinguish demo fixtures from verified execution evidence.
