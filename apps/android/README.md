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
