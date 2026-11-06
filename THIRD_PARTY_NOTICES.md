# Third-Party Source Notices

This file records source code copied or adapted into Awwab. It is intentionally empty of imported projects as of 2026-10-30: the current open-source reuse work is research/planning only, and no upstream source files have yet been transplanted.

## Mozilla Readability\n\n- Upstream: https://github.com/mozilla/readability\n- Commit: `ab4027a8b37669745016869a37a504727992b2ba`\n- Copied file: `Readability.js` -> `apps/web/src/vendor/mozilla/Readability.js`\n- Licence: Apache-2.0; full upstream `LICENSE.md` copied to `apps/web/src/vendor/mozilla/LICENSE.md`.\n- Upstream version: `@mozilla/readability` 0.6.0.\n- Modification: appended an ES module default export; retained upstream copyright/licence header.\n- Purpose: pure article extraction from a caller-supplied DOM; no network fetching or AI inference.\n- Tests: Awwab wrapper input/URL/size/normalization tests; full browser parser acceptance still required.\n\nBefore adding another entry, record:
- upstream repository and immutable commit SHA;
- exact copied file paths;
- original copyright and SPDX licence;
- required LICENSE/NOTICE text location;
- modifications made by Awwab;
- transitive dependencies and their licences;
- reviewer/date and Awwab module that contains the code.

Do not infer file-level rights from repository visibility. Review exact source files, generated assets, submodules, model/data weights and dependency licences. Preserve all required notices. GPL/AGPL and unresolved-licence code require a separate owner licensing decision.

See [the Open-Source Reuse Catalogue](docs/OPEN_SOURCE_REUSE_CATALOG.md) for candidate decisions and the source-copying checklist.
