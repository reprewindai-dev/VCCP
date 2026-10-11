> **Prototype notice (2026-10-11).** VCCP is an early interface and provider-router prototype. It is **not** Veklom's
> production system and is not deployed. Several values it displays are **simulated, not measured**:
> `reputationScore` (random 90–99, `seed_skills.js`), CPU and memory usage and the VNP node id (random,
> `src/server/gnomledger-pgl.ts`), the divergence index (random, `src/server/capi-engine.ts`), the "Einstein" score
> (`src/server/abide-planner.ts`), run duration (padded with random milliseconds) and a fixed `latencyMs: 12.8`
> (`server.ts`). Do not cite any number from this repository as evidence. Production evidence for Veklom lives at
> https://veklom.com (receipts verifiable in the ledger).

> [!IMPORTANT]
> **VEKLOM BIBLE — READ FIRST:** [`00_VEKLOM_BIBLE.md`](./00_VEKLOM_BIBLE.md)
> It supersedes older cross-repo architecture/deployment/alignment claims wherever they conflict.

# VCCP

Veklom Capability Control Plane.

## x402 status

The previous local `src/server/x402-engine.ts` demo lease engine has been removed. It used seeded/in-memory leases and did not verify the supplied payment proof before issuing authority-like tokens, so it must not be treated as a production settlement or capability-authority implementation.

VCCP should consume the canonical Veklom x402 settlement/verification and capability-authority contracts through an adapter once ownership is finalized in cAPI issue #32. Do not reintroduce local payment verification, hard-coded settlement destinations, seeded production leases, or independent pricing truth here.

Any future VCCP paid-capability UI must display authoritative runtime data and clearly distinguish demo fixtures from verified execution evidence.
