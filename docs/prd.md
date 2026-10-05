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
