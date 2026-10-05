# Awwab Tasks

## P0 — Foundation and security

### Repository and validation
- [x] Create repository foundation documentation
- [x] Define technology baseline
- [x] Define initial security boundary
- [x] Define Firestore data model
- [x] Define authentication/session model
- [x] Define trusted-device model
- [x] Define approval workflow
- [x] Define audit model
- [x] Define environment strategy
- [x] Define CI/testing strategy
- [x] Add web shell
- [x] Add Android shell
- [x] Add emulator/rules test harness
- [ ] Execute local typecheck/build validation
- [ ] Execute Firestore Rules test suite
- [ ] Execute backend callable emulator tests
- [ ] Establish development Firebase
- [ ] Validate real authentication/device lifecycle
- [ ] Review Firestore profile-field restrictions
- [ ] Review first-device bootstrap concurrency
- [ ] Align shared contracts with backend DTOs

## P1 — Assistant Core v0
- [ ] Define assistant request/response contracts
- [ ] Implement authenticated assistant endpoint
- [ ] Implement model-provider interface
- [ ] Implement model router
- [ ] Implement context selector
- [ ] Implement conversation persistence
- [ ] Implement structured plan representation
- [ ] Implement tool registry
- [ ] Implement policy engine
- [ ] Implement approval gate
- [ ] Implement execution boundary
- [ ] Implement result verification
- [ ] Implement activity trace/correlation IDs
- [ ] Connect web Assistant UI
- [ ] Add assistant core tests

## P1 — Memory and context
- [ ] Define memory write policy
- [ ] Add memory provenance
- [ ] Add confidence/sensitivity/expiry
- [ ] Add retrieval ranking
- [ ] Add user-visible memory controls
- [ ] Add memory poisoning tests
- [ ] Add context budget controls

## P1 — Research
- [ ] Define research tool contract
- [ ] Web retrieval adapter
- [ ] Source extraction
- [ ] Citation model
- [ ] Source quality ranking
- [ ] Claim/evidence association
- [ ] Research evaluation set
- [ ] Prompt-injection isolation for retrieved content

## P1 — Productivity
- [ ] Tasks API
- [ ] Today view
- [ ] Reminders
- [ ] Goals
- [ ] Follow-up engine
- [ ] Calendar integration design
- [ ] User-controlled proactive suggestions

## P1 — Project intelligence
- [ ] GitHub integration
- [ ] Repository indexing strategy
- [ ] Issue/PR context
- [ ] Project memory
- [ ] Code/document research
- [ ] Approved implementation workflow
- [ ] Verification before claiming changes succeeded

## P2 — Tool platform
- [ ] Versioned tool registry
- [ ] Tool scopes
- [ ] Tool risk classification
- [ ] Tool input/output schemas
- [ ] Timeouts/retries/idempotency
- [ ] Per-tool budgets
- [ ] Tool health monitoring
- [ ] MCP interoperability assessment

## P2 — Automation
- [ ] Job model
- [ ] Scheduler
- [ ] Event triggers
- [ ] Kill switch
- [ ] Retry/backoff
- [ ] Approval policies
- [ ] Execution history
- [ ] Failure notifications
- [ ] Cost limits

## P2 — Proactivity
- [ ] Opportunity/risk detectors
- [ ] Relevance scoring
- [ ] Notification budget
- [ ] Quiet hours/preferences
- [ ] Explainable suggestions
- [ ] Dismiss/snooze/feedback

## P2 — Voice and multimodal
- [ ] STT
- [ ] TTS
- [ ] Voice conversation
- [ ] File ingestion
- [ ] Image understanding
- [ ] Attachment provenance
- [ ] Android voice UX

## P3 — Advanced assistant
- [ ] Long-running research jobs
- [ ] Multi-agent experiments only where justified
- [ ] Agent-to-agent interoperability assessment
- [ ] Computer-use research in a sandbox
- [ ] Advanced workflow planning
- [ ] Personal knowledge graph only if retrieval needs justify it

## Rule

Do not begin P2/P3 autonomous features while P0 security/validation blockers remain unresolved.
