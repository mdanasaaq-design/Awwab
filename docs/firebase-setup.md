# Firebase Project Setup

The repository contains the Firebase-side structure, but the Firebase project itself must be created in the owner's Firebase/Google Cloud account.

## Development project

Create a dedicated development Firebase project.

1. Register a Web app.
2. Register the Android app with package name `com.awwab.app`.
3. Enable the authentication providers chosen for the first release.
4. Create Cloud Firestore.
5. Deploy/test `firestore.rules`.
6. Register Web App Check.
7. Register Android App Check.
8. Enable Firebase Cloud Messaging.
9. Configure Functions for Node.js 22.
10. Set the Firebase CLI development project alias locally.

Do not commit service-account keys, signing keys, or local environment files.

## Web

Copy the Web Firebase configuration values into `apps/web/.env.local` using `apps/web/.env.example`.

The client configuration is not an authorization boundary. Authentication and Firestore Rules remain authoritative.

## Android

Download the development project's `google-services.json` for `com.awwab.app` and place it at `apps/android/app/google-services.json`.

The current repository ignores local Google-services configuration so an environment-specific file is not accidentally committed.

## App Check

For new web integrations, use reCAPTCHA Enterprise. Initially monitor App Check metrics before enabling enforcement.

## Environment separation

Use separate development and production Firebase projects. Never point local development at production data unintentionally.

## Current limitation

There is no Firebase project-management connector available in this environment, so project creation, app registration, billing configuration, and console-side enforcement cannot be performed or claimed here.
