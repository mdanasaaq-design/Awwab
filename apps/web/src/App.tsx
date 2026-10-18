import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import type { User } from "firebase/auth";
import type { DeviceRecord } from "./device";
import { observeAuth, signIn, signOutAwwab } from "./auth";
import { firebaseConfigured } from "./firebase";

const sections = [
  { id: "assistant", label: "Assistant", glyph: "⌘", group: "WORKSPACE" },
  { id: "projects", label: "Projects", glyph: "▤", group: "WORKSPACE" },
  { id: "tasks", label: "Tasks", glyph: "☷", group: "WORKSPACE" },
  { id: "research", label: "Research", glyph: "⌕", group: "WORKSPACE" },
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

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState("checking");
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState("");
  const [deviceError, setDeviceError] = useState("");
  const [deviceBusy, setDeviceBusy] = useState("");
  const [activeSection, setActiveSection] = useState<SectionId>("assistant");
  const [signOutBusy, setSignOutBusy] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [switcherQuery, setSwitcherQuery] = useState("");
  const [switcherIndex, setSwitcherIndex] = useState(0);
  const switcherButtonRef = useRef<HTMLButtonElement | null>(null);
  const switcherInputRef = useRef<HTMLInputElement | null>(null);
  const switcherDialogRef = useRef<HTMLDivElement | null>(null);
  const switcherReturnFocusRef = useRef<HTMLElement | null>(null);
  const switcherWasOpenRef = useRef(false);

  const filteredSections = sections.filter((section) =>
    section.label.toLowerCase().includes(switcherQuery.trim().toLowerCase()),
  );

  function openSwitcher() {
    switcherReturnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : switcherButtonRef.current;
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

  async function refreshDevices() {
    try {
      setDeviceError("");
      const { listDevices } = await import("./device");
      setDevices(await listDevices());
    } catch (error) {
      setDeviceError(error instanceof Error ? error.message : "Could not load devices.");
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
        return;
      }

      void import("./device")
        .then(async ({ registerWebDevice, ensureUserProfile, getAwwabDeviceId }) => {
          setCurrentDeviceId(getAwwabDeviceId());
          return Promise.all([registerWebDevice(), ensureUserProfile()]);
        })
        .then(([result]) => {
          setDeviceStatus(result.status);
          return refreshDevices();
        })
        .catch((error) => {
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
      setAuthError(error instanceof Error ? error.message : "Sign-in failed.");
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
    } catch (error) {
      setDeviceError(error instanceof Error ? error.message : "Could not revoke device.");
    } finally {
      setDeviceBusy("");
    }
  }

  async function handleSignOut() {
    setSignOutBusy(true);
    try {
      await signOutAwwab();
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

      <section className="main-panel" id="main-content" tabIndex={-1} aria-label="Main content">
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
              <kbd>⌘ K</kbd>
            </button>
            <span className="environment-label"><span className="connection-dot good" /> SIGNED IN</span>
            <span className="topbar-avatar" title={user.email ?? user.uid}>{(user.email?.[0] ?? "A").toUpperCase()}</span>
          </div>
        </header>

        {activeSection === "assistant" && (
          <div className="page-content">
            <div className="page-intro">
              <p className="eyebrow">YOUR COMMAND CENTER</p>
              <h1>Good to have you here.</h1>
              <p className="page-description">Think clearly. Keep context. Move work forward.</p>
            </div>

            <section className="assistant-panel" aria-labelledby="assistant-title">
              <div className="panel-kicker">
                <span className="assistant-glyph" aria-hidden="true">⌘</span>
                <span>AWWAB ASSISTANT</span>
                <span className="availability">CORE NOT CONNECTED</span>
              </div>
              <h2 id="assistant-title">What are we working on?</h2>
              <p className="panel-description">
                Conversation and tool execution are not connected yet. This workspace will become the place to plan, research, and act with your approval.
              </p>
              <div className="composer" aria-label="Assistant input unavailable">
                <span className="composer-placeholder">The assistant runtime is not connected yet.</span>
                <button className="composer-submit" type="button" disabled aria-label="Send request unavailable">↑</button>
              </div>
              <div className="composer-note">
                <span>NO REQUESTS WILL BE SENT</span>
                <span>Assistant Core v0 is planned</span>
              </div>
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
                  { id: "research" as const, number: "03", title: "Research", description: "Sources, evidence, and useful conclusions", glyph: "⌕" },
                ].map((item) => (
                  <button className="workspace-row" type="button" key={item.id} onClick={() => setActiveSection(item.id)}>
                    <span className="workspace-row-number">{item.number}</span>
                    <span className="workspace-row-glyph" aria-hidden="true">{item.glyph}</span>
                    <span className="workspace-row-copy">
                      <strong>{item.title}</strong>
                      <small>{item.description}</small>
                    </span>
                    <span className="workspace-row-status">NOT CONNECTED</span>
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

        {activeSection !== "assistant" && activeSection !== "settings" && (
          <div className="page-content secondary-page">
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

        {activeSection === "settings" && (
          <div className="page-content secondary-page">
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
                </div>
                <button className="secondary" type="button" onClick={() => void refreshDevices()}>Refresh list</button>
              </div>
              {deviceError && <p className="error" role="alert">{deviceError}</p>}
              <div className="device-list">
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
                        <button className="secondary" type="button" disabled={deviceBusy === device.deviceId} onClick={() => void handleApprove(device.deviceId)}>
                          {deviceBusy === device.deviceId ? "Working…" : "Approve"}
                        </button>
                      )}
                      {device.status !== "revoked" && (
                        <button className="danger" type="button" disabled={deviceBusy === device.deviceId} onClick={() => void handleRevoke(device.deviceId)}>
                          {deviceBusy === device.deviceId ? "Working…" : "Revoke"}
                        </button>
                      )}
                    </div>
                  </article>
                ))}
                {!devices.length && !deviceError && (
                  <div className="device-empty">
                    <strong>No device records loaded.</strong>
                    <p>Refresh the list to check the devices registered to this account.</p>
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
