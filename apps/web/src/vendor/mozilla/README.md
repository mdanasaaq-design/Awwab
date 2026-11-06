# Mozilla Readability — vendored source

- Upstream: https://github.com/mozilla/readability
- Upstream commit: `ab4027a8b37669745016869a37a504727992b2ba`
- Upstream file: `Readability.js`
- Upstream version at this commit: `@mozilla/readability 0.6.0`
- Licence: Apache-2.0; see [LICENSE.md](LICENSE.md).
- Local modification: added an ES module `export default Readability` for Awwab's Vite/TypeScript build. The original copyright and licence header is retained.

Awwab calls this as a pure parser over HTML that has already been fetched by a separately governed source adapter. This module does not fetch URLs, call an AI model, send telemetry or authorize actions. Awwab's wrapper returns plain text only; it does not render upstream HTML into the application.

Before updating this file, repeat the exact-file licence/security review and update `THIRD_PARTY_NOTICES.md`.
