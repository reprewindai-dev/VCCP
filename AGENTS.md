# AGENTS.md — READ FIRST

Before any work, read [`00_VEKLOM_BIBLE.md`](./00_VEKLOM_BIBLE.md).

VCCP is the capability-control/orchestration domain. Keep capability authority scoped and ephemeral; do not reintroduce seeded authority/payment truth or local x402 stand-ins as production behavior.

Repo-local source and tests govern implementation details only when they do not conflict with current runtime evidence or the Bible. Use Coolify UI/API/MCP for Coolify management; SSH is for direct host/container verification or operations. Never allocate host ports from memory; host `8000` is currently Coolify-owned.
