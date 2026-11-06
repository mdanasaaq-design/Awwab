# Awwab Roadmap

**Current roadmap:** [Awwab Self-Development Master Plan](../project/SELF_DEVELOPMENT_MASTER_PLAN.md).  
**Open work:** [Pending Work Audit](../project/PENDING_WORK_AUDIT.md).

## Strategic objective

Build an independent Awwab cognitive architecture and Awwab-owned model, then give Awwab a safe ability to develop, test and prepare future versions under owner control. Build working capabilities in substantial phases; do not spend long periods on speculative infrastructure.

## Ordered phases

| Phase | Focus | Completion outcome |
|---|---|---|
| 0 | Source/evidence/docs baseline | One accurate status, backlog, risk register and handoff |
| 1 | Cognitive Core v0 | Identity, typed memory, goals, context selection and experience records |
| 2 | Model Lab viability | Actual random-init checkpoint and measured held-out capability |
| 3 | Reasoning and plan-only assistant | Awwab model connected to validated structured planning; no side effects |
| 4 | Perception and development tools | Read-only repository understanding and safe local runner design |
| 5 | Awwab Developer | Isolated code edits, tests, debugging and reviewable patches |
| 6 | Version/evolution manager | Candidate comparison, reproducibility, rollback and owner-approved promotion |
| 7 | Multi-agent orchestration | Specialized role profiles with isolated contexts and measurable collaboration |
| 8 | Controlled autonomy | Durable, bounded, cancellable owner-assigned work |
| 9 | Android, multimodal and release | Validated mobile capabilities and separate release approval |

## Delivery rules

- First make one agent work; only then create multiple specialized roles.
- Awwab's mind persists independently of model checkpoints.
- Awwab uses only its own randomly initialized/trained model; no external AI APIs or third-party pretrained weights.
- Reuse small deterministic open-source modules after exact-file licence/security review.
- Prefer local owner-controlled development execution before hosted tools because Firebase Functions are not deployed on Spark and no alternate backend is approved.
- Keep the stable branch untouched by experiments. All edits happen in isolated workspaces with tests and a diff.
- No agent self-approves, merges, deploys, changes billing, alters live Rules, or accesses secrets.
- $0, no downloads, no cloud resources and no deployment remain hard constraints without separate approval.

## Release gate

A phase is done only with code, appropriate automated/manual tests, security/failure review, documentation, commit-linked evidence and explicit limitations. A successful build or a diagram alone is not completion.
