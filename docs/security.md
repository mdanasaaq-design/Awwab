# Awwab Security Model

## Principles
- Least privilege
- Defense in depth
- Explicit authorization
- Secure secret storage
- Auditable actions
- Fail closed for privileged operations

## Identity
Firebase Authentication is the planned identity foundation. A trusted-device model may add device-level assurance but must not replace account authentication.

## Sensitive actions
Require explicit confirmation before sending messages, placing calls, deleting data, changing authentication/security settings, changing database rules, financial/account actions, production deployment, destructive commands, sharing private information, or installing unknown software.

## Voice
Voice input is an interaction method, not sufficient proof of identity for sensitive actions.

## Secrets
Never commit API keys, service-account credentials, private keys, environment secret files or third-party access tokens. Privileged credentials belong in an appropriate server-side secret mechanism.

## Auditability
Important privileged actions should record what was requested, whether approval was obtained, what tool executed, and whether execution succeeded or failed.

## Android
Use Android-supported permission and intent mechanisms. Do not bypass platform or application security.

## Validation
Security rules and authorization behavior must be tested before production use. No deployment should be described as successful without actual verification.
