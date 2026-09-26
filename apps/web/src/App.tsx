import { useEffect, useState, type FormEvent } from "react";
import type { User } from "firebase/auth";
import {
  approveDevice,
  ensureUserProfile,
  getAwwabDeviceId,
  listDevices,
  registerWebDevice,
  revokeDevice,
  type DeviceRecord,
} from "./device";
import { observeAuth, signIn, signOutAwwab } from "./auth";
import { firebaseConfigured } from "./firebase";

const sections = [
  "Assistant",
  "Projects",
  "Tasks",
  "Research",
  "Automations",
  "Activity",
  "Settings",
];

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState("checking");
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [deviceError, setDeviceError] = useState("");
  const [deviceBusy, setDeviceBusy] = useState("");

  async function refreshDevices() {
    try {
      setDeviceError("");
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
        return;
      }

      void Promise.all([registerWebDevice(), ensureUserProfile()])
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
      await revokeDevice(deviceId);
      await refreshDevices();
    } catch (error) {
      setDeviceError(error instanceof Error ? error.message : "Could not revoke device.");
    } finally {
      setDeviceBusy("");
    }
  }

  if (!user) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <div className="logo">A</div>
          <p className="eyebrow">Awwab</p>
          <h1>Personal AI command center</h1>
          <p className="muted">
            Your identity boundary is now connected to the web shell. Sign in when the Firebase
            project is configured.
          </p>

          {!firebaseConfigured && (
            <div className="notice">
              Firebase is not configured for this environment yet. Add the values from{" "}
              <code>apps/web/.env.example</code> to <code>.env.local</code>.
            </div>
          )}

          <form onSubmit={handleSignIn}>
            <label>
              Email
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
            {authError && <p className="error">{authError}</p>}
            <button className="primary" disabled={!firebaseConfigured || loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  const currentDeviceId = getAwwabDeviceId();

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">A</div>
          <div>
            <strong>Awwab</strong>
            <span>Personal AI Assistant</span>
          </div>
        </div>

        <nav aria-label="Primary navigation">
          {sections.map((section, index) => (
            <button className={index === 0 ? "nav-item active" : "nav-item"} key={section}>
              {section}
            </button>
          ))}
        </nav>

        <button className="signout" onClick={() => void signOutAwwab()}>
          Sign out
        </button>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Command center</p>
            <h1>How can I help?</h1>
            <p className="muted">Signed in as {user.email ?? user.uid}</p>
          </div>
          <div className="header-status">
            <span className="status">Authenticated</span>
            <span className="device-status">Device: {deviceStatus}</span>
          </div>
        </header>

        <section className="assistant-card">
          <p className="eyebrow">Awwab</p>
          <h2>Your authenticated workspace is ready for the next connection.</h2>
          <p>
            Trusted devices now form a separate authorization boundary around the Firebase
            identity session.
          </p>
          <button className="primary" disabled>
            Send a request
          </button>
        </section>

        <section className="devices-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Security</p>
              <h2>Trusted devices</h2>
            </div>
            <button className="secondary" onClick={() => void refreshDevices()}>
              Refresh
            </button>
          </div>

          {deviceError && <p className="error">{deviceError}</p>}

          <div className="device-list">
            {devices.map((device) => (
              <article className="device-row" key={device.deviceId}>
                <div>
                  <strong>{device.deviceName}</strong>
                  <span>
                    {device.platform} · {device.deviceId === currentDeviceId ? "This device" : "Other device"}
                  </span>
                </div>
                <div className="device-actions">
                  <span className={`device-badge ${device.status}`}>{device.status}</span>
                  {device.status === "pending" && (
                    <button
                      className="secondary"
                      disabled={deviceBusy === device.deviceId}
                      onClick={() => void handleApprove(device.deviceId)}
                    >
                      Approve
                    </button>
                  )}
                  {device.status !== "revoked" && (
                    <button
                      className="danger"
                      disabled={deviceBusy === device.deviceId}
                      onClick={() => void handleRevoke(device.deviceId)}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </article>
            ))}

            {!devices.length && !deviceError && (
              <p className="muted">No device records are available yet.</p>
            )}
          </div>
        </section>

        <div className="grid">
          <article>
            <span>Projects</span>
            <strong>0 active</strong>
            <p>Project intelligence will appear here.</p>
          </article>
          <article>
            <span>Tasks</span>
            <strong>0 due</strong>
            <p>Your daily work queue will appear here.</p>
          </article>
          <article>
            <span>Automations</span>
            <strong>0 enabled</strong>
            <p>Scheduled and event-driven workflows will appear here.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
