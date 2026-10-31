# Awwab Android

Native Kotlin + Jetpack Compose client for Awwab.

## Role

Android is a first-class surface optimized for quick assistant access, voice/text, Today view, notifications, approvals, quick actions and supported Android intents.

## Security boundary

The Android client is untrusted for privileged execution.

- Never embed API keys or service-account credentials.
- A device ID is not an authentication credential.
- Never bypass Android permissions or sandbox rules.
- Sensitive actions require backend authorization and, where required, explicit approval.
- Voice is not sufficient authorization for sensitive operations.
- Use App Check/Play Integrity where appropriate after development validation.

## Lifecycle

1. Firebase/Auth integration.
2. Device registration and trust.
3. Shared assistant request pipeline.
4. Notifications and approval UX.
5. Voice/TTS.
6. Android-specific tools with explicit permission boundaries.

Do not mark a capability complete until it is built and tested appropriately.

Do not commit `google-services.json`, signing credentials or local secrets.


---

> **Planning sync — 2026-10-27:** This document describes a capability, design or acceptance contract; it does not prove the capability is live. See the [Awwab Master Plan and Work Audit](../../project/MASTER_PLAN.md) for current evidence, the Firebase Blaze blocker, source-reconciliation steps and the ordered implementation gates.


## Open-source reuse and Android boundary (2026-10-30)

Awwab may reuse reviewed deterministic source modules across clients, but Android must not inherit a third-party agent runtime or pretrained model. Android remains an Awwab-owned client; device identity, authentication, permissions and sensitive-action authorization remain under Awwab's security contracts. The shared reuse catalogue is [here](../../docs/OPEN_SOURCE_REUSE_CATALOG.md). No Android code or dependency was added by this plan.


## Self-development and independent model boundary — 2026-10-31

Android remains a first-class future client, but the current app is a minimal Compose shell and is not a validated self-development runtime. Do not claim on-device inference until an Awwab-owned random-init checkpoint is trained and real-device RAM, speed, battery and thermal behavior are measured. No third-party pretrained model downloads or external AI APIs. Device authorization must use a reviewed platform key lifecycle; the current callerDeviceId protocol is not device proof. See [Self-Development Master Plan](../../project/SELF_DEVELOPMENT_MASTER_PLAN.md).
