import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import type { User } from "firebase/auth";
import { getAssistantMemoryContext, type AssistantMemoryContext, type DeviceRecord } from "./device";
import { observeAuth, signIn, signOutAwwab } from "./auth";
import { firebaseConfigured } from "./firebase";
import { MemoryPanel } from "./MemoryPanel";
import { ResearchPanel } from "./ResearchPanel";
import { ActivityPanel, ProjectsPanel, TasksPanel } from "./WorkspaceDataPanel";

const sections = [
  { id: "assistant", label: "Assistant", glyph: "⌘", group: "WORKSPACE" },
  { id: "projects", label: "Projects", glyph: "▤", group: "WORKSPACE" },
  { id: "tasks", label: "Tasks", glyph: "☷", group: "WORKSPACE" },
  { id: "research", label: "Research", glyph: "⌕", group: "WORKSPACE" },
  { id: "memories", label: "Memory", glyph: "◉", group: "WORKSPACE" },
  { id: "automations", label: "Automations", glyph: "↻", group: "WORKSPACE" },
  { id: "activity", label: "Activity", glyph: "◷", group: "SYSTEM" },
  { id: "settings", label: "Settings", glyph: "⚙", group: "SYSTEM" },
] as const;

type SectionId = (typeof sections)[number]["id"];

const sectionCopy: Record<Exclude<SectionId, "assistant" | "settings">, { title: string; description: string; eyebrow: string }> = {
  projects: {
    eyebrow: "WORKSPACE / PROJECTS",
    title: "Projects, with the context intact.",
    description: "Your project space will bring repositories, decisions, open work, and recent changes into one place.",
  },
  tasks: {
    eyebrow: "WORKSPACE / TASKS",
    title: "A clear view of what needs doing.",
    description: "Tasks and due dates will live here once the task service is connected. Nothing is being counted until there is real data.",
  },
  research: {
    eyebrow: "WORKSPACE / RESEARCH",
    title: "Research you can trace back to its sources.",
    description: "Research sessions, evidence, and cited findings will appear here when the research workflow is available.",
  },
  memories: {
    eyebrow: "WORKSPACE / MEMORY",
    title: "Keep useful context, on your terms.",
    description: "Review and manage details you explicitly choose to save. Memory is not automatically sent to an assistant runtime.",
  },
  automations: {
    eyebrow: "WORKSPACE / AUTOMATIONS",
    title: "Useful automation, under your control.",
    description: "When automation is available, this space will show triggers, permissions, run history, and recovery options.",
  },
  activity: {
    eyebrow: "SYSTEM / ACTIVITY",
    title: "A record of what Awwab actually did.",
    description: "Activity history will show verified actions and outcomes. This view is not yet connected to an activity feed.",
  },
};

function getSignInErrorMessage(error: unknown): string {
  let code = "";
  if (typeof error === "object" && error !== null && "code" in error) {
    const candidate = error.code;
    if (typeof candidate === "string") code = candidate;
  }

  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Email or password wasn't recognized. Check your details and try again.";
    case "auth/invalid-email":
      return "Enter a valid email address and try again.";
    case "auth/network-request-failed":
      return "Couldn't connect to the sign-in service. Check your connection and try again.";
    case "auth/too-many-requests":
      return "There have been too many attempts. Wait a little while before trying again.";
    case "auth/user-disabled":
      return "This account is currently disabled. Contact the workspace administrator.";
    case "auth/operation-not-allowed":
      return "Email and password sign-in isn't enabled for this workspace. Contact the workspace administrator.";
    default:
      return "Sign-in failed. Check your details and try again.";
  }
}

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState("checking");
  const [memoryContext, setMemoryContext] = useState<AssistantMemoryContext | null>(null);
  const [memoryContextLoading, setMemoryContextLoading] = useState(false);
  const [memoryContextError, setMemoryContextError] = useState("");
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [currentDeviceId, setCurrentDeviceId] = useState("");
  const [deviceError, setDeviceError] = useState("");
  const [deviceBusy, setDeviceBusy] = useState("");
  const [pendingRevokeDeviceId, setPendingRevokeDeviceId] = useState("");
  const revokeButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const revokeConfirmButtonRef = useRef<HTMLButtonElement | null>(null);
  const deviceListRef = useRef<HTMLDivElement | null>(null);
  const previousPendingRevokeRef = useRef("");
  const [activeSection, setActiveSection] = useState<SectionId>("assistant");
  const [signOutBusy, setSignOutBusy] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [switcherQuery, setSwitcherQuery] = useState("");
  const [switcherIndex, setSwitcherIndex] = useState(0);
  const switcherButtonRef = useRef<HTMLButtonElement | null>(null);
  const switcherInputRef = useRef<HTMLInputElement | null>(null);
  const switcherDialogRef = useRef<HTMLDivElement | null>(null);
  const switcherReturnFocusRef = useRef<HTMLElement | null>(null);
  const switcherWasOpenRef = useRef(false);

  useEffect(() => {
    const section = sections.find((item) => item.id === activeSection);
    document.title = user ? `${section?.label ?? "Assistant"} · Awwab` : "Sign in · Awwab";
  }, [user, activeSection]);

  const filteredSections = sections.filter((section) =>
    section.label.toLowerCase().includes(switcherQuery.trim().toLowerCase()),
  );

  function openSwitcher() {
    const activeElement = document.activeElement;
    switcherReturnFocusRef.current =
      activeElement instanceof HTMLElement && activeElement !== document.body
        ? activeElement
        : switcherButtonRef.current;
    setSwitcherQuery("");
    setSwitcherIndex(0);
    setSwitcherOpen(true);
  }

  function closeSwitcher() {
    setSwitcherOpen(false);
  }

  function navigateToSection(sectionId: SectionId) {
    setActiveSection(sectionId);
    closeSwitcher();
  }

  useEffect(() => {
    if (switcherOpen) {
      switcherWasOpenRef.current = true;
      switcherInputRef.current?.focus();
      return;
    }

    if (switcherWasOpenRef.current) {
      switcherWasOpenRef.current = false;
      (switcherReturnFocusRef.current ?? switcherButtonRef.current)?.focus();
    }
  }, [switcherOpen]);

  useEffect(() => {
    if (pendingRevokeDeviceId) {
      previousPendingRevokeRef.current = pendingRevokeDeviceId;
      revokeConfirmButtonRef.current?.focus();
      return;
    }

    const previousDeviceId = previousPendingRevokeRef.current;
    if (!previousDeviceId) return;
    previousPendingRevokeRef.current = "";
    const revokeButton = revokeButtonRefs.current[previousDeviceId];
    if (revokeButton?.isConnected) {
      revokeButton.focus();
    } else {
      deviceListRef.current?.focus();
    }
  }, [pendingRevokeDeviceId]);

  useEffect(() => {
    if (!user) return;

    function handleGlobalKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const isEditable =
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      const isShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

      if (isShortcut) {
        if (isEditable && !switcherOpen) return;
        event.preventDefault();
        if (switcherOpen) {
          closeSwitcher();
        } else {
          openSwitcher();
        }
        return;
      }

      if (!switcherOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeSwitcher();
        return;
      }

      if (event.key === "Tab" && switcherDialogRef.current) {
        const focusable = Array.from(
          switcherDialogRef.current.querySelectorAll<HTMLElement>(
            'input:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [user, switcherOpen]);

  function handleSwitcherInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && filteredSections.length) {
      event.preventDefault();
      setSwitcherIndex((index) => (index + 1) % filteredSections.length);
    } else if (event.key === "ArrowUp" && filteredSections.length) {
      event.preventDefault();
      setSwitcherIndex((index) => (index - 1 + filteredSections.length) % filteredSections.length);
    } else if (event.key === "Enter" && filteredSections[switcherIndex]) {
      event.preventDefault();
      navigateToSection(filteredSections[switcherIndex].id);
    }
  }

  async function loadAssistantMemoryContext() {
    setMemoryContextLoading(true);
    setMemoryContextError("");
    try {
      const result = await getAssistantMemoryContext();
      setMemoryContext(result);
    } catch (error) {
      setMemoryContextError(error instanceof Error ? error.message : "Could not load assistant memory context.");
      setMemoryContext(null);
    } finally {
      setMemoryContextLoading(false);
    }
  }

  async function refreshDevices() {
    setDevicesLoading(true);
    try {
      setDeviceError("");
      const { listDevices } = await import("./device");
      setDevices(await listDevices());
    } catch (error) {
      setDeviceError(error instanceof Error ? error.message : "Could not load devices.");
    } finally {
      setDevicesLoading(false);
    }
  }

  useEffect(() => {
    return observeAuth((nextUser) => {
      setUser(nextUser);
      setDevices([]);
      setDeviceError("");

      if (!nextUser) {
        setDeviceStatus("signed out");
        setActiveSection("assistant");
        setSwitcherOpen(false);
        setDevicesLoading(false);
        setPendingRevokeDeviceId("");
        return;
      }

      setDevicesLoading(true);
      void import("./device")
        .then(async ({ registerWebDevice, ensureUserProfile, getAwwabDeviceId }) => {
          setCurrentDeviceId(getAwwabDeviceId());

          // Keep registration outcome separate from profile setup: a profile
          // failure must not misreport a successful device registration.
          const result = await registerWebDevice();
          setDeviceStatus(result.status);

          try {
            await ensureUserProfile();
          } catch (error) {
            setDeviceError(
              error instanceof Error
                ? `Profile setup failed: ${error.message}`
                : "Profile setup failed.",
            );
            setDevicesLoading(false);
            return;
          }

          await refreshDevices();
        })
        .catch((error) => {
          setDevicesLoading(false);
          setDeviceStatus("registration failed");
          setDeviceError(error instanceof Error ? error.message : "Device setup failed.");
        });
    });
  }, []);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");
    setLoading(true);
    try {
      await signIn(email, password);
      setPassword("");
    } catch (error) {
      setAuthError(getSignInErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(deviceId: string) {
    setDeviceBusy(deviceId);
    setDeviceError("");
    try {
      const { approveDevice } = await import("./device");
      await approveDevice(deviceId);
      await refreshDevices();
    } catch (error) {
      setDeviceError(error instanceof Error ? error.message : "Could not approve device.");
    } finally {
      setDeviceBusy("");
    }
  }

  async function handleRevoke(deviceId: string) {
    setDeviceBusy(deviceId);
    setDeviceError("");
    try {
      const { revokeDevice } = await import("./device");
      await revokeDevice(deviceId);
      await refreshDevices();
      setPendingRevokeDeviceId("");
    } catch (error) {
      setDeviceError(error instanceof Error ? error.message : "Could not revoke device.");
    } finally {
      setDeviceBusy("");
    }
  }

  async function handleSignOut() {
    setSignOutError("");
    setSignOutBusy(true);
    try {
      await signOutAwwab();
    } catch {
      setSignOutError("Could not sign out. Check your connection and try again.");
    } finally {
      setSignOutBusy(false);
    }
  }

  if (!user) {
    return (
      <main className="auth-shell">
        <section className="auth-card" aria-labelledby="sign-in-title">
          <div className="brand-mark" aria-hidden="true">A</div>
          <p className="eyebrow">AWWAB / PRIVATE WORKSPACE</p>
          <h1 id="sign-in-title">Your work, in context.</h1>
          <p className="muted">
            Sign in to access your personal command center. Your account and device trust are handled separately.
          </p>

          {!firebaseConfigured && (
            <div className="notice" role="status">
              Firebase is not configured for this environment. Add the values from{" "}
              <code>apps/web/.env.example</code> to <code>.env.local</code>.
            </div>
          )}

          <form onSubmit={handleSignIn}>
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            {authError && <p className="error" role="alert">{authError}</p>}
            <button className="primary sign-in-button" type="submit" disabled={!firebaseConfigured || loading}>
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <span aria-hidden="true">↗</span>}
            </button>
          </form>
          <p className="auth-footnote">Private by design. You stay in control.</p>
        </section>
      </main>
    );
  }

  const currentSection = sections.find((section) => section.id === activeSection) ?? sections[0];

  return (
    <main className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <aside className="sidebar">
        <a className="brand" href="#assistant" onClick={(event) => { event.preventDefault(); setActiveSection("assistant"); }} aria-label="Awwab home">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span className="brand-copy">
            <strong>Awwab</strong>
            <span>PERSONAL SYSTEM</span>
          </span>
        </a>

        <div className="workspace-switcher">
          <span className="workspace-avatar" aria-hidden="true">{(user.email?.[0] ?? "A").toUpperCase()}</span>
          <span className="workspace-copy">
            <strong>Personal workspace</strong>
            <span>{user.email ?? "Signed-in account"}</span>
          </span>
          <span className="workspace-chevron" aria-hidden="true">⌄</span>
        </div>

        <nav className="primary-nav" aria-label="Primary navigation">
          {(["WORKSPACE", "SYSTEM"] as const).map((group) => (
            <div className="nav-group" key={group}>
              <p className="nav-heading">{group}</p>
              {sections.filter((section) => section.group === group).map((section) => (
                <button
                  className={activeSection === section.id ? "nav-item active" : "nav-item"}
                  key={section.id}
                  type="button"
                  aria-current={activeSection === section.id ? "page" : undefined}
                  onClick={() => setActiveSection(section.id)}
                >
                  <span className="nav-glyph" aria-hidden="true">{section.glyph}</span>
                  <span>{section.label}</span>
                  {section.id === "settings" && deviceStatus === "registration failed" && (
                    <span className="nav-alert" aria-label="Device setup needs attention" />
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          {signOutError && <p className="error signout-error" role="alert">{signOutError}</p>}
          <div className="connection-state">
            <span className={deviceStatus === "trusted" ? "connection-dot good" : "connection-dot"} />
            <span>
              <strong>{deviceStatus === "trusted" ? "Device trusted" : "Device status"}</strong>
              <small>{deviceStatus}</small>
            </span>
          </div>
          <button className="signout" type="button" onClick={() => void handleSignOut()} disabled={signOutBusy}>
            <span aria-hidden="true">↪</span>
            {signOutBusy ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      <section className="main-panel" aria-label="Main content">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Awwab</span>
            <span aria-hidden="true">/</span>
            <strong>{currentSection.label}</strong>
          </div>
          <div className="topbar-right">
            <button
              ref={switcherButtonRef}
              className="quick-switcher-trigger"
              type="button"
              onClick={openSwitcher}
              aria-haspopup="dialog"
              aria-expanded={switcherOpen}
              aria-label="Open quick switcher (Ctrl or Command plus K)"
            >
              <span>Jump to…</span>
              <kbd>Ctrl/⌘ K</kbd>
            </button>
            <span className="environment-label"><span className="connection-dot good" /> SIGNED IN</span>
            <span className="topbar-avatar" title={user.email ?? user.uid}>{(user.email?.[0] ?? "A").toUpperCase()}</span>
          </div>
        </header>

        {activeSection === "assistant" && (
          <div className="page-content" id="main-content" tabIndex={-1}>
            <div className="page-intro">
              <p className="eyebrow">YOUR COMMAND CENTER</p>
              <h1>Good to have you here.</h1>
              <p className="page-description">Think clearly. Keep context. Move work forward.</p>
            </div>

            <section className="assistant-panel" aria-labelledby="assistant-title">
              <div className="panel-kicker">
                <span className="assistant-glyph" aria-hidden="true">⌘</span>
                <span>AWWAB ASSISTANT</span>
                <span className="availability">MODEL NOT TRAINED</span>
              </div>
              <h2 id="assistant-title">Awwab is being built from the ground up.</h2>
              <p className="panel-description">Awwab's own model has not been trained yet. We will not send your requests to another AI model or use one as a fallback.</p>
              <div className="notice" role="status">
                <strong>Independent model · not trained</strong>
                <p className="muted">The Assistant Core interface is being prepared, but generation is disabled until Awwab's own model is trained and tested from random initialization.</p>
                <p className="muted">Your saved memory preview and source research remain available separately. Memory is not being sent to any model.</p>
              </div>
            </section>

            <section className="settings-card memory-context-preview" aria-labelledby="memory-context-preview-title">
              <div className="section-title-row">
                <div>
                  <p className="eyebrow">CONTEXT BOUNDARY</p>
                  <h2 id="memory-context-preview-title">Assistant memory context</h2>
                  <p className="settings-description">Preview the safe, user-confirmed memories the backend would allow into a conversation. This is an explicit test—not automatic assistant retrieval.</p>
                </div>
                <button className="secondary" type="button" onClick={() => void loadAssistantMemoryContext()} disabled={memoryContextLoading || deviceStatus !== "trusted"}>
                  {memoryContextLoading ? "Loading…" : "Preview context"}
                </button>
              </div>
              {deviceStatus !== "trusted" && <p className="muted" role="status">A trusted device is required to retrieve context.</p>}
              {memoryContextError && <p className="error" role="alert">{memoryContextError}</p>}
              {memoryContext && (
                <div className="memory-context-results" role="status" aria-live="polite">
                  <p className="muted">{memoryContext.memories.length} eligible memories · {memoryContext.totalChars}/{memoryContext.maxChars} characters · sensitive records excluded</p>
                  <p className="muted">{memoryContext.untrustedDataNotice}</p>
                  {memoryContext.memories.length ? (
                    <ul className="memory-context-list">
                      {memoryContext.memories.map((memory) => (
                        <li key={memory.id}>
                          <span className="quiet-label">{memory.type.replaceAll("_", " ")}</span>
                          <p>{memory.content}</p>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="muted">No eligible memories are available for conversation context.</p>}
                </div>
              )}
            </section>

            <section className="system-overview" aria-label="Workspace status">
              <article className="overview-card">
                <div className="overview-card-heading">
                  <span className="overview-glyph" aria-hidden="true">⌘</span>
                  <span>ASSISTANT CORE</span>
                </div>
                <strong className="overview-value status-pending">Model not trained</strong>
                <p>Awwab uses no other AI model; generation stays disabled until its own model is trained and evaluated.</p>
              </article>
              <article className="overview-card">
                <div className="overview-card-heading">
                  <span className="overview-glyph" aria-hidden="true">◇</span>
                  <span>DEVICE TRUST</span>
                </div>
                <strong className={`overview-value ${deviceStatus === "trusted" ? "status-good" : deviceStatus === "registration failed" ? "status-attention" : "status-pending"}`}>
                  {deviceStatus === "trusted" ? "Trusted" : deviceStatus === "registration failed" ? "Needs attention" : deviceStatus === "checking" ? "Checking" : deviceStatus}
                </strong>
                <p>{deviceStatus === "trusted" ? "This browser is registered as trusted." : deviceStatus === "registration failed" ? "Device registration needs another look." : "Current device registration state."}</p>
              </article>
              <article className="overview-card">
                <div className="overview-card-heading">
                  <span className="overview-glyph" aria-hidden="true">▤</span>
                  <span>WORKSPACE DATA</span>
                </div>
                <strong className="overview-value status-pending">Partially connected</strong>
                <p>Projects, tasks, memory management, live source lookup, and read-only activity history are available in this development build. Assistant retrieval and automations remain disconnected.</p>
              </article>
            </section>

            <section className="section-block">
              <div className="section-title-row">
                <div>
                  <p className="eyebrow">WORKSPACE</p>
                  <h2>Pick up where work happens</h2>
                </div>
                <span className="quiet-label">IN DEVELOPMENT</span>
              </div>
              <div className="workspace-list">
                {[
                  { id: "projects" as const, number: "01", title: "Projects", description: "Repositories, decisions, and project context", glyph: "▤" },
                  { id: "tasks" as const, number: "02", title: "Tasks", description: "Commitments, priorities, and what comes next", glyph: "☷" },
                  { id: "research" as const, number: "03", title: "Research", description: "Live source lookup and citations", glyph: "⌕" },
                  { id: "memories" as const, number: "04", title: "Memory", description: "Saved context you can inspect and correct", glyph: "◉" },
                ].map((item) => (
                  <button className="workspace-row" type="button" key={item.id} onClick={() => setActiveSection(item.id)}>
                    <span className="workspace-row-number">{item.number}</span>
                    <span className="workspace-row-glyph" aria-hidden="true">{item.glyph}</span>
                    <span className="workspace-row-copy">
                      <strong>{item.title}</strong>
                      <small>{item.description}</small>
                    </span>
                    <span className="workspace-row-status">"AVAILABLE"</span>
                    <span className="workspace-row-arrow" aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="security-strip">
              <div className="security-icon" aria-hidden="true">◇</div>
              <div>
                <strong>Access and device trust</strong>
                <p>Account sign-in and device authorization are separate controls.</p>
              </div>
              <button type="button" className="text-action" onClick={() => setActiveSection("settings")}>Manage devices <span aria-hidden="true">→</span></button>
            </section>
          </div>
        )}

        {activeSection === "projects" && (
          <div className="page-content secondary-page" id="main-content" tabIndex={-1}>
            <div className="page-intro">
              <p className="eyebrow">WORKSPACE / PROJECTS</p>
              <h1>Projects, with the context intact.</h1>
              <p className="page-description">Create and maintain your projects, descriptions, and active/archive state. Data is scoped to your signed-in account.</p>
            </div>
            <ProjectsPanel key={user.uid} uid={user.uid} />
          </div>
        )}

        {activeSection === "tasks" && (
          <div className="page-content secondary-page" id="main-content" tabIndex={-1}>
            <div className="page-intro">
              <p className="eyebrow">WORKSPACE / TASKS</p>
              <h1>A clear view of what needs doing.</h1>
              <p className="page-description">Create tasks, set priorities and due dates, and track progress. Every change is saved to your account workspace.</p>
            </div>
            <TasksPanel key={user.uid} uid={user.uid} />
          </div>
        )}

                {activeSection === "activity" && (
          <div className="page-content secondary-page" id="main-content" tabIndex={-1}>
            <div className="page-intro">
              <p className="eyebrow">SYSTEM / ACTIVITY</p>
              <h1>A record of what Awwab actually did.</h1>
              <p className="page-description">Review recent events recorded by the trusted backend. This history is read-only and shows only recorded outcomes.</p>
            </div>
            <ActivityPanel key={user.uid} uid={user.uid} />
          </div>
        )}

{activeSection !== "assistant" && activeSection !== "settings" && activeSection !== "memories" && activeSection !== "research" && activeSection !== "projects" && activeSection !== "tasks" && activeSection !== "activity" && (
          <div className="page-content secondary-page" id="main-content" tabIndex={-1}>
            <div className="page-intro">
              <p className="eyebrow">{sectionCopy[activeSection].eyebrow}</p>
              <h1>{sectionCopy[activeSection].title}</h1>
              <p className="page-description">{sectionCopy[activeSection].description}</p>
            </div>
            <section className="empty-state">
              <div className="empty-state-mark" aria-hidden="true">{currentSection.glyph}</div>
              <p className="eyebrow">NOT CONNECTED YET</p>
              <h2>This part of Awwab is still being built.</h2>
              <p>There is no live data here yet. We’ll connect this view to a real workflow before presenting it as ready to use.</p>
              <button className="secondary" type="button" onClick={() => setActiveSection("assistant")}>Back to command center</button>
            </section>
          </div>
        )}

        {activeSection === "research" && (
          <div className="page-content secondary-page" id="main-content" tabIndex={-1}>
            <div className="page-intro">
              <p className="eyebrow">WORKSPACE / RESEARCH</p>
              <h1>Research you can trace back to its sources.</h1>
              <p className="page-description">Search live source material, inspect the extracts, and open the original citations before relying on a claim.</p>
            </div>
            <ResearchPanel />
          </div>
        )}

        {activeSection === "memories" && (
          <div className="page-content secondary-page" id="main-content" tabIndex={-1}>
            <div className="page-intro">
              <p className="eyebrow">WORKSPACE / MEMORY</p>
              <h1>Keep useful context, on your terms.</h1>
              <p className="page-description">Review, correct, and delete what you choose to save. Nothing is inferred or sent to an assistant automatically.</p>
            </div>
            <MemoryPanel key={user.uid} uid={user.uid} />
          </div>
        )}

        {activeSection === "settings" && (
          <div className="page-content secondary-page" id="main-content" tabIndex={-1}>
            <div className="page-intro">
              <p className="eyebrow">SYSTEM / SETTINGS</p>
              <h1>Account and access.</h1>
              <p className="page-description">Manage the devices that can access your Awwab workspace.</p>
            </div>
            <section className="settings-card">
              <div className="section-title-row">
                <div>
                  <p className="eyebrow">SECURITY</p>
                  <h2>Trusted devices</h2>
                  <p className="settings-description">Approve new devices or revoke access you no longer trust.</p>
                  <p className="muted" role="note">Important: device records currently verify the signed-in account, not cryptographic possession of this browser. Approval and revocation are not yet a high-assurance device-security boundary.</p>
                </div>
                <button className="secondary" type="button" disabled={devicesLoading} onClick={() => void refreshDevices()}>{devicesLoading ? "Refreshing…" : "Refresh list"}</button>
              </div>
              {deviceError && <p className="error" role="alert">{deviceError}</p>}
              <div className="device-list" ref={deviceListRef} tabIndex={-1} role="region" aria-label="Trusted devices">
                {devicesLoading && !devices.length && !deviceError && (
                  <div className="device-empty" role="status" aria-live="polite">
                    <strong>Loading trusted devices…</strong>
                    <p>Checking the devices registered to this account.</p>
                  </div>
                )}
                {devicesLoading && devices.length > 0 && (
                  <p className="device-loading" role="status" aria-live="polite">Refreshing device list…</p>
                )}
                {devices.map((device) => (
                  <article className="device-row" key={device.deviceId}>
                    <div className="device-identity">
                      <span className="device-platform" aria-hidden="true">{device.platform === "android" ? "▯" : "▣"}</span>
                      <div>
                        <strong>{device.deviceName}</strong>
                        <span>{device.platform} · {device.deviceId === currentDeviceId ? "This device" : "Other device"}</span>
                      </div>
                    </div>
                    <div className="device-actions">
                      <span className={`device-badge ${device.status}`}>{device.status}</span>
                      {device.status === "pending" && (
                        <button className="secondary" type="button" disabled={deviceBusy !== ""} onClick={() => void handleApprove(device.deviceId)}>
                          {deviceBusy === device.deviceId ? "Working…" : "Approve"}
                        </button>
                      )}
                      {device.status !== "revoked" && (
                        pendingRevokeDeviceId === device.deviceId ? (
                          <div className="device-revoke-confirmation" role="group" aria-label={`Confirm revoking ${device.deviceName}`}>
                            <span>Revoke access for this device?</span>
                            <button ref={revokeConfirmButtonRef} className="danger" type="button" disabled={deviceBusy !== ""} onClick={() => void handleRevoke(device.deviceId)}>
                              {deviceBusy === device.deviceId ? "Revoking…" : "Confirm revoke"}
                            </button>
                            <button className="secondary" type="button" disabled={deviceBusy !== ""} onClick={() => setPendingRevokeDeviceId("")}>Cancel</button>
                          </div>
                        ) : (
                          <button ref={(element) => { revokeButtonRefs.current[device.deviceId] = element; }} className="danger" type="button" disabled={deviceBusy !== ""} onClick={() => setPendingRevokeDeviceId(device.deviceId)}>Revoke</button>
                        )
                      )}
                    </div>
                  </article>
                ))}
                {!devicesLoading && !devices.length && !deviceError && (
                  <div className="device-empty" role="status" aria-live="polite">
                    <strong>No devices are registered yet.</strong>
                    <p>When a device is registered to this account, it will appear here.</p>
                  </div>
                )}
              </div>
            </section>
            <section className="account-card">
              <div>
                <p className="eyebrow">ACCOUNT</p>
                <h2>Signed-in identity</h2>
              </div>
              <div className="account-detail">
                <span>Email</span>
                <strong>{user.email ?? "No email supplied"}</strong>
              </div>
              <div className="account-detail">
                <span>Device registration</span>
                <strong>{deviceStatus}</strong>
              </div>
            </section>
          </div>
        )}
      </section>

      {switcherOpen && (
        <div className="quick-switcher-backdrop" onClick={closeSwitcher}>
          <div
            className="quick-switcher"
            ref={switcherDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-switcher-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="quick-switcher-heading">
              <div>
                <p className="eyebrow">NAVIGATION</p>
                <h2 id="quick-switcher-title">Jump to a section</h2>
              </div>
              <button className="quick-switcher-close" type="button" onClick={closeSwitcher} aria-label="Close quick switcher">×</button>
            </div>
            <label className="quick-switcher-search">
              <span aria-hidden="true">⌕</span>
              <input
                ref={switcherInputRef}
                type="text"
                value={switcherQuery}
                onChange={(event) => { setSwitcherQuery(event.target.value); setSwitcherIndex(0); }}
                onKeyDown={handleSwitcherInputKeyDown}
                placeholder="Search sections…"
                role="combobox"
                aria-expanded="true"
                aria-label="Search navigation sections"
                aria-autocomplete="list"
                aria-controls="quick-switcher-options"
                aria-activedescendant={filteredSections[switcherIndex] ? `quick-switcher-option-${filteredSections[switcherIndex].id}` : undefined}
                autoComplete="off"
                spellCheck={false}
              />
              <kbd>ESC</kbd>
            </label>
            <div className="quick-switcher-options" id="quick-switcher-options" role="listbox" aria-label="Navigation sections">
              {filteredSections.map((section, index) => (
                <div
                  className={index === switcherIndex ? "quick-switcher-option active" : "quick-switcher-option"}
                  id={`quick-switcher-option-${section.id}`}
                  key={section.id}
                  role="option"
                  aria-selected={index === switcherIndex}
                  onMouseMove={() => setSwitcherIndex(index)}
                  onClick={() => navigateToSection(section.id)}
                >
                  <span className="quick-switcher-option-glyph" aria-hidden="true">{section.glyph}</span>
                  <span className="quick-switcher-option-label">{section.label}</span>
                  <span className="quick-switcher-option-group">{section.group}</span>
                  {section.id === activeSection && <span className="quick-switcher-current">CURRENT</span>}
                  {index === switcherIndex && <span className="quick-switcher-enter" aria-hidden="true">↵</span>}
                </div>
              ))}
              {!filteredSections.length && (
                <p className="quick-switcher-empty" role="status" aria-live="polite">No sections match “{switcherQuery}”.</p>
              )}
            </div>
            <div className="quick-switcher-footer">
              <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
              <span><kbd>↵</kbd> Open section</span>
              <span><kbd>ESC</kbd> Close</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
