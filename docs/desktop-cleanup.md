# Clean Windows desktop checkout

Use this after repository changes have been committed to `main`. It keeps the GitHub checkout as the source of truth without deleting local Firebase settings.

## 1. Update the tracked project

Open PowerShell and run:

```powershell
Set-Location "$HOME\Downloads\Awwab"
git status --short --branch
git pull --ff-only origin main
npm run web:build
```

If `git pull` stops because of local changes, do not reset or force-pull. Review `git status` first.

## 2. Remove only the known nested duplicate

First confirm the current directory and the exact target:

```powershell
Get-Location
Test-Path ".\Awwab-fixed"
Get-ChildItem ".\Awwab-fixed" -Force | Select-Object Name, Mode
```

Only if `Awwab-fixed` is the unwanted nested duplicate and you have checked that it contains no unique work you need, remove that exact directory:

```powershell
Remove-Item -LiteralPath ".\Awwab-fixed" -Recurse -Force
```

If Windows reports access denied or a file-in-use error, stop and identify the locking process. Do not repeatedly force-delete it or delete the whole Awwab folder.

## 3. Verify the final checkout

```powershell
git status --short --branch
git rev-parse --show-toplevel
git remote -v
npm run web:build
```

The repository root should be `Downloads\Awwab`, and the origin should be `https://github.com/mdanasaaq-design/Awwab.git`.

## Local-only configuration

- Keep `apps/web/.env.local` on your computer. It is intentionally not committed.
- Keep `.firebaserc` local if it contains your project-specific Firebase alias; it is intentionally ignored.
- Do not commit credentials, `.env.local`, `node_modules`, or build output.
- `git pull` updates tracked files but does not remove untracked or ignored folders. The nested duplicate must be removed separately.
- Keep any backup until the clean checkout builds and the app is verified.


---

> **Planning sync — 2026-10-27:** This document describes a capability, design or acceptance contract; it does not prove the capability is live. See the [Awwab Master Plan and Work Audit](../project/MASTER_PLAN.md) for current evidence, the Firebase Blaze blocker, source-reconciliation steps and the ordered implementation gates.
