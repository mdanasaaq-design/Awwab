# Awwab Capability and Permission Model

## Capability catalog

| Capability | Value | Initial risk |
|---|---|---|
| Conversation | Natural interaction | Low |
| Research | Current information and synthesis | Low/Medium |
| File analysis | Understand documents | Medium |
| Memory | Personal continuity | Medium/High |
| Tasks | Commitments/planning | Medium |
| Projects | Work context | Medium |
| GitHub | Software workflow | Medium/High |
| Notifications | Proactive assistance | Medium |
| Calendar | Schedule management | Medium/High |
| External communication | Messages/email | High |
| Account/security changes | Identity control | Critical |
| Financial actions | Money movement | Critical |
| Computer control | Broad system actions | High/Critical |
| Automation | Repeated autonomous actions | High |

## Permission dimensions

Evaluate user, device, capability, provider/account, target, action, data classification, risk, time and budget.

## Narrow scopes

Prefer scopes such as:
- `github.read`
- `github.issue.write`
- `calendar.read`
- `calendar.event.create`
- `notifications.send`

Avoid broad scopes such as `admin` or `execute.anything`.

## Data classification

Public, internal/personal, sensitive, highly sensitive, secret/credential.

Tool access must respect classification.

## Risk policy

- **Low:** automatic if permission exists.
- **Medium:** automatic only when reversible, expected and explicitly enabled.
- **High:** explicit approval immediately before execution.
- **Critical:** approval plus fresh authentication and potentially an additional confirmation mechanism.

## Approval UX

Show what Awwab will do, target/account, scope, material consequences, expiry and reversibility.

## Tool registry

Every tool declares ID/version, description, schema, permissions, risk, data classes, timeout, retry policy, idempotency, audit event, verification and trust source.

## Revocation

Users can disconnect integrations, revoke devices, disable automations, revoke scopes, disable proactivity and stop running jobs where possible.

## Principle

The model never grants itself permission.


---

> **Planning sync — 2026-10-27:** This document describes a capability, design or acceptance contract; it does not prove the capability is live. See the [Awwab Master Plan and Work Audit](../project/MASTER_PLAN.md) for current evidence, the Firebase Blaze blocker, source-reconciliation steps and the ordered implementation gates.
