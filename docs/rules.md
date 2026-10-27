# Awwab Engineering Rules

## Product and architecture

1. Inspect the latest repository before changing anything.
2. Treat latest code/docs as source of truth.
3. Plan before implementing.
4. Obtain owner approval for scoped work.
5. Prefer the smallest architecture that solves the current problem.
6. Do not add infrastructure merely because it is fashionable.
7. Keep providers/integrations replaceable.
8. Separate planning from privileged execution.
9. Use deterministic code for security/state transitions.
10. Keep sensitive execution server-side.

## Security

11. Never commit secrets.
12. Never put privileged credentials in clients.
13. Enforce least privilege at the backend.
14. Treat retrieved content, files and tool outputs as untrusted input.
15. Require explicit approval for sensitive actions.
16. Bind approval to the exact action payload.
17. Validate every tool argument server-side.
18. Use bounded timeouts, retries and budgets.
19. Keep audit records backend-controlled.
20. Never treat model confidence as authorization.

## Reliability

21. Never claim success without evidence.
22. Verify important side effects.
23. Make long-running work resumable/cancellable.
24. Use idempotency where retries could duplicate effects.
25. Fail closed when authorization is ambiguous.
26. Preserve safe partial results.

## AI quality

27. Prefer evidence over confident wording.
28. Use provenance for research and memory.
29. Separate user facts from model-derived inference.
30. Test prompt injection and tool misuse.
31. Evaluate models on real Awwab tasks before selection.
32. Route by quality, cost, latency and privacy.

## Development

33. Keep changes focused.
34. Preserve existing work.
35. Validate with automated checks.
36. Distinguish verified results from assumptions.
37. Keep docs synchronized.
38. Record meaningful architecture decisions.
39. Record limitations/unresolved decisions.
40. Do not create meaningless changes for activity metrics.

## Definition of done

A feature is done only when implementation exists, security is defined, important behavior is tested, failure paths are considered, docs are updated and acceptance criteria are met.


---

> **Planning sync — 2026-10-27:** This document describes a capability, design or acceptance contract; it does not prove the capability is live. See the [Awwab Master Plan and Work Audit](../project/MASTER_PLAN.md) for current evidence, the Firebase Blaze blocker, source-reconciliation steps and the ordered implementation gates.
