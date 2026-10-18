# Phase 2A — Lock Down User Profile Writes

**Status:** Acceptance criteria recorded before implementation  
**Phase:** 2 — Foundation security and environment validation  
**Branch:** `fix/phase-2-profile-write-boundary`  
**Risk:** AWW-001 (P0), AWW-006 (P1)

## Evidence and decision

The current Rules allow the authenticated owner to create and update the root `/users/{uid}` document with any fields. The reviewed web client initializes the profile through the `ensureUserProfile` callable; no reviewed client path needs direct writes to the root profile document. The backend uses the Admin SDK and is not constrained by Firestore Rules.

**Decision for this bounded change:** clients may read their own root profile, but may not create, update, or delete it directly. Until an explicit profile-edit workflow and ownership contract exists, the backend owns all root profile fields, including `displayName`, `email`, `photoUrl`, timestamps, `status`, `timezone`, and `locale`. Future user-editable profile changes must use a validated backend callable or a narrowly allowlisted Rules contract with tests.

## Intended change

- Change `/users/{uid}` Rules to owner-read only; deny client create/update/delete.
- Update Rules tests to prove own-profile reads succeed when backend-seeded, while owner client writes fail.
- Retain cross-user isolation, default deny, and all existing subcollection policies.
- Document the root profile ownership contract in the data model and current risk register.

## Acceptance criteria

- [ ] An authenticated owner can read an existing root profile.
- [ ] An authenticated owner cannot create their own root profile from the client.
- [ ] An authenticated owner cannot update profile fields, including `displayName`, `email`, `createdAt`, `status`, `timezone`, and `locale`.
- [ ] An authenticated owner cannot delete their root profile.
- [ ] A different user cannot read or mutate the profile.
- [ ] Trusted backend/Admin SDK profile initialization remains possible; callable behavior is not changed in this slice.
- [ ] All existing subcollection Rules tests continue to pass.
- [ ] Firestore Rules CI passes; Functions/shared and web build regression checks pass.
- [ ] Risk register and current status cite the change and observed CI evidence.
- [ ] No deployment is performed.

## Test plan

Use the existing Firestore Rules emulator test suite. Seed a profile with Rules disabled to test owner reads and forbidden writes against an existing document. Assert that all client write attempts fail. Keep the test fixture's backend seed separate from authenticated client operations.

## Non-goals

No new profile-edit UI, callable, field mutation API, schema migration, auth policy change, or production deployment.
