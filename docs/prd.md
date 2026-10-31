# Awwab Product Requirements

## Product definition

Awwab is a personal AI operating assistant whose job is to reduce cognitive and execution burden.

It combines conversation, memory, planning, research, tasks/projects, controlled tool use, automation, notifications, proactive assistance and multimodal interaction.

The goal is not maximum autonomy. It is maximum useful capability within a trustworthy control boundary.

## User outcomes

Awwab should help the user:
- understand information faster
- plan complex work
- remember useful context
- organize commitments
- research and compare options
- operate software projects
- automate repetitive workflows
- stay accountable
- notice deadlines and risks
- reduce repeated manual work

## Product principles

Personal, proactive, accountable, context-aware, secure, modular, extensible, human-controlled, evidence-driven and cost-aware.

## Capability areas

### Assistant
Natural-language interaction, intent understanding, planning and clarification.

### Memory
Durable preferences/facts with provenance, confidence, sensitivity and expiry.

### Research
Web/file research, source comparison, citation, synthesis and uncertainty handling.

### Productivity
Tasks, reminders, goals, routines, Today and follow-up.

### Projects
Repository/project context, documentation, status, development planning and approved workflows.

### Tools
Allowlisted integrations with explicit schemas, scopes, risk levels and verification.

### Automation
Scheduled/event-driven workflows with bounded permissions, retries, approvals and audit.

### Proactivity
Useful suggestions based on explicit commitments, deadlines, preferences and observable state.

### Voice/multimodal
STT, TTS, files, images and eventually richer device interaction.

## Assistant quality contract

For important requests, Awwab should state important assumptions, use tools when they improve correctness, cite external research, distinguish facts from inference, verify important side effects and expose uncertainty.

## Safety contract

Awwab must never invent successful actions, expose secrets, silently broaden permissions, treat untrusted content as system policy, execute sensitive actions solely because a model requested them, use voice as sole sensitive authorization, silently turn inference into a durable sensitive fact, or run unbounded autonomous loops.

## Phases

1. Foundation and validation
2. Assistant core
3. Memory/context
4. Research/knowledge
5. Tasks/projects
6. Tool platform
7. Automation/proactivity
8. Voice/multimodal
9. Advanced agent workflows
10. Optimization/hardening

## Early non-goals

- unrestricted computer control
- autonomous financial transactions
- unrestricted shell access
- self-modifying production code
- autonomous security/account changes
- premature microservices

## Success metrics

Task completion, verified outcome rate, correction rate, unnecessary clarification, factuality/citation quality, proactive suggestion acceptance, automation success, latency, cost per useful task, security-policy violations and user trust.

Never optimize metrics in ways that reward fabricated success or unsafe autonomy.


---

> **Planning sync — 2026-10-27:** This document describes a capability, design or acceptance contract; it does not prove the capability is live. See the [Awwab Master Plan and Work Audit](../project/MASTER_PLAN.md) for current evidence, the Firebase Blaze blocker, source-reconciliation steps and the ordered implementation gates.


## Open-source implementation policy (2026-10-30)

The product may incorporate selected open-source source code for workflow orchestration, browser automation, memory algorithms, research/document parsing, training infrastructure and evaluation. This is a delivery strategy, not a change to Awwab's identity: Awwab owns its user experience, data, contracts, security policy and independent model weights. No third-party pretrained model, hosted agent or external AI API is allowed. See [the source catalogue and integration plan](OPEN_SOURCE_REUSE_CATALOG.md).


## Self-development product direction — 2026-10-31

Awwab's defining long-term capability is a persistent cognitive architecture plus a safe self-development lifecycle. This supplements the existing assistant outcomes and is controlled by [the Self-Development Master Plan](../project/SELF_DEVELOPMENT_MASTER_PLAN.md).

### Cognitive outcomes
- Maintain an owner-controlled identity and stable operating principles across model versions.
- Remember relevant, provenance-backed experiences, facts, procedures and development decisions.
- Track owner goals and subgoals with progress and constraints.
- Explain why context was selected and distinguish verified facts, assumptions and unknowns.
- Reflect on observed outcomes and update memory/procedures only through validated policies.

### Self-development outcomes
- Inspect and explain its own repository from actual files and Git evidence.
- Prepare bounded implementation plans and isolated code changes.
- Run tests, diagnose failures, compare candidate versions and provide rollback instructions.
- Coordinate specialist agent roles only after one developer agent is reliable.
- Continue explicitly assigned work within budgets and cancellation/approval controls.

These are product targets, not current features. The model is untrained; the developer agent, cognitive core, evolution manager and multi-agent runtime are not implemented. No consciousness claim is made. No external model/API, pretrained weights, hosted agent or autonomous production modification is permitted.
