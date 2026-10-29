# Awwab Local-First Intelligence Architecture

**Decision status:** Proposed implementation direction, approved by the project owner on 2026-10-29  
**Primary goal:** Awwab should remain a standalone assistant that prioritizes on-device inference, privacy, and $0 operating cost. It must support both Android/Termux and desktop/laptop use.  
**Hard constraints:** No deployment, paid API use, billing enablement, new cloud resources, or costs without explicit approval.

## Decision

Awwab owns its assistant architecture. A model is a replaceable reasoning component, not Awwab itself. The default path should be a local model running on a device the user controls. External model APIs must be optional, disabled by default, and never used as an automatic fallback.

A local-first target does not mean every existing component is already local. Today, the web app uses Firebase Authentication and Firestore for account/device state and saved memory. Those services remain cloud dependencies until their storage/auth roles are deliberately separated or replaced. Do not describe the whole product as offline or fully local yet.

## Target architecture

The UI and orchestration communicate with a provider-neutral Local Intelligence Gateway contract. The gateway selects only an explicitly configured local runtime. It returns a bounded response/plan to Awwab's own orchestration layer; it does not grant a model authority to execute tools.

### Logical layers

1. **Awwab UI:** shared web interface, responsive on desktop and phone.
2. **Awwab Assistant Core:** request validation, conversation orchestration, context selection, safety policy, plan validation, cancellation, and audit-friendly status. Owned by this project.
3. **Local Intelligence Gateway:** stable interface for model discovery, readiness, inference, cancellation, context/token limits, and health checks. It has no silent network fallback.
4. **Device runtime adapters:**
   - **Desktop first:** support a user-installed local runtime such as Ollama or llama.cpp through a loopback-only endpoint and an explicitly configured model.
   - **Android second:** evaluate a local llama.cpp-based runtime available to the user's Android/Termux setup. Treat model size, available RAM, CPU speed, battery/heat, and native-library setup as device-specific constraints. Do not assume a desktop model will run well on a phone.
   - **Browser-only fallback:** optional later experiment with in-browser WebGPU inference where the browser/device supports it. Do not make this the sole path because support and memory availability vary.
5. **Awwab-owned capabilities:** memory policy, research retrieval, source labeling, permissions, tool contracts, and user confirmation remain outside the model. Retrieved text is untrusted input.
6. **Persistence and sync:** separate local conversation/model state from account authentication and cloud-synced records. Local inference must not silently upload prompts or memories. Cloud sync should be a separate, visible choice.
7. **Optional remote provider adapter:** retained only as a future, explicitly enabled compatibility path. It must be off by default, have no configured credentials by default, and never be used automatically when a local model is unavailable.

## Device and connectivity rules

- The default inference destination is the same device running the model.
- Do not expose a local model server to the public internet or bind it to all network interfaces by default.
- A phone must not silently send prompts to a desktop on the LAN. A future phone-to-computer relay would require explicit pairing, authentication, clear UI disclosure, and a documented threat model.
- A hosted HTTPS web app calling an HTTP localhost endpoint may be blocked by browser mixed-content/CORS rules. Do not work around this by weakening browser security. Test a local companion bridge, a supported local app shell, or a browser-native runtime as separate options.
- If the local runtime is missing, stopped, or too weak, show a clear unavailable/limited state. Never fall back to a paid or remote model without an explicit per-session or per-request user choice.
- Local model files may be large; explain download size and device requirements before asking the user to download anything. Do not initiate downloads, install runtimes, or consume device resources without the user's instruction.

## Privacy and memory implications

- Current saved memories are in Firestore under the authenticated user's path. That is cloud persistence, even when inference is local.
- Introduce a storage interface before claiming local-first memory: local-only, optional encrypted local storage, and optional explicit cloud sync should be distinct modes.
- Do not copy cloud memory into a local prompt automatically. Memory inclusion remains an explicit per-request choice and sensitive records remain excluded from model context.
- For local runtime calls, verify in tests that prompts and memory never leave the device boundary. For cloud sync, disclose exactly which records are synced and retain owner isolation.
- Local model output is not inherently trustworthy. Preserve prompt-injection boundaries, untrusted-source labeling, response schema validation, and human review.

## Proposed implementation sequence

### Stage 0 — Architecture contract and baseline (this document)
- Record the local-first decision, zero-cost boundary, fallback rules, and cloud/local distinction.
- No runtime installation, secret creation, model download, deployment, or billing change.

### Stage 1 — Provider-neutral gateway contract
- Define a Local Intelligence Gateway interface separate from the existing OpenAI-compatible API adapter.
- Add deterministic fake-runtime tests for unavailable runtime, malformed output, cancellation, timeouts, limits, and proof that no remote adapter is called by default.
- Keep current external adapter isolated and explicitly disabled in local-first mode.
- Make the UI report runtime status and selected execution location clearly.

### Stage 2 — Desktop local-runtime proof of concept
- Support an explicitly configured local endpoint, initially Ollama or llama.cpp, without adding a paid dependency.
- Validate endpoint origin, reject arbitrary remote URLs in local-only mode, bound request size/output, and use strict timeouts.
- Provide manual setup instructions; do not install the runtime or download a model automatically.
- Verify the browser-to-local connection approach before wiring it into the hosted UI.

### Stage 3 — Android/Termux feasibility spike
- Document tested Android versions, CPU architecture, memory needs, runtime build steps, model format/quantization, and measured latency.
- Start with a small model that fits the test device, only after the user approves any download.
- Keep the phone's runtime loopback-only. If Termux integration is too fragile, evaluate an Android native companion or browser-native inference rather than weakening security.

### Stage 4 — Local-first persistence
- Add a persistence abstraction and determine what can be stored locally without changing the existing sign-in/device security model unexpectedly.
- Make cloud memory sync explicit and opt-in; do not silently migrate, duplicate, or delete existing Firestore records.
- Define export, deletion, backup, and encryption behavior before storing sensitive records locally.

### Stage 5 — Quality and capability evaluation
- Compare candidate local models using a small, versioned Awwab task suite: instruction following, structured plan quality, source-grounded answers, refusal/safety, prompt-injection resistance, latency, memory footprint, and battery impact.
- Prefer the smallest model that meets agreed quality thresholds on each target device.
- Keep research retrieval and tool execution separate from raw model output; no model receives unrestricted tool authority.

### Stage 6 — Optional remote model, only if explicitly requested
- Keep remote inference off by default.
- Require an explicit user action, visible destination, provider-specific data disclosure, and hard limits before any request can leave the device.
- No automatic fallback, no credentials in source control, and no billing enablement or paid request without explicit approval.

## Acceptance criteria

- Local-first mode makes no inference request to an external model API.
- If no local runtime is available, the request fails clearly rather than switching to a remote provider.
- Tests prove default configuration selects no remote provider and does not transmit prompts or memory.
- The desktop adapter uses a user-configured local runtime and does not expose it publicly.
- Android support is claimed only after a real-device feasibility test; Termux support is not inferred from desktop success.
- Existing Firebase usage is documented as a cloud dependency until local/optional-sync work is complete.
- Memory remains opt-in for inference, sensitive records are excluded, and model output cannot execute tools or side effects.
- CI can test the contracts with a fake runtime and no model downloads, API keys, cloud resources, or costs.
- No production deployment, billing change, paid service, or resource creation is included in these phases.

## Immediate next bounded task

Implement Stage 1 only: add the gateway contract and deterministic tests, wire no real local endpoint yet, keep the remote adapter disabled by default in local-first mode, and update setup documentation. Do not install software, download model weights, configure secrets, or deploy.
