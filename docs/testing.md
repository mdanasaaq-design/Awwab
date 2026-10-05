# Awwab Testing and Evaluation Strategy

A personal agent can pass normal software tests while still being unsafe or useless. Awwab therefore uses four validation layers.

## 1. Software correctness

- TypeScript typechecks
- production builds
- unit tests
- Firestore Rules tests
- backend callable tests
- Android tests
- integration tests

Never claim a check passed without observed output.

## 2. Security validation

Test unauthenticated access, cross-user isolation, device trust, approval bypass, expired approvals, payload substitution, revoked devices, scope violations, prompt injection, indirect prompt injection, memory poisoning, malicious tool outputs, secret leakage, runaway automation and rate/budget exhaustion.

## 3. Agent evaluation

Maintain a versioned benchmark covering:
- direct Q&A
- research
- planning
- memory
- tasks
- projects
- tool selection/arguments
- multi-step execution
- failure recovery
- proactive suggestions
- safety/refusal
- approval behavior
- multimodal tasks

Each case defines input, context, tools, expected behavior, unacceptable behavior, evidence and risk.

## 4. Production quality

Track success rate, verified completion, correction rate, tool errors, unnecessary clarification, factuality, citation quality, latency, cost, automation failure, policy violations and trust.

## Evaluation harness

Future runner should support deterministic fixtures, mock tools, adversarial prompts, rubrics, model comparison, regression detection, cost measurement and trace inspection.

## Local validation

Before Firebase deployment:
1. install dependencies
2. web typecheck
3. web build
4. Functions typecheck/build
5. shared typecheck
6. Firestore Rules tests

Current rules command:

```bash
npm run firebase:rules:test
```

## Development Firebase

After emulator validation, validate authentication, device lifecycle, profile access, App Check and backend authorization against the dedicated development project.

## Android

Validate build, Auth, device registration, approvals, notifications, App Check, voice, lifecycle and permission handling.

## CI

CI should run typechecks, builds and automated tests. Production deployment remains a separately authorized workflow.
