import { useEffect, useState, type FormEvent } from "react";
import type { User } from "firebase/auth";
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

  useEffect(() => observeAuth(setUser), []);

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
              Firebase is not configured for this environment yet. Add the values from
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
          <span className="status">Authenticated</span>
        </header>

        <section className="assistant-card">
          <p className="eyebrow">Awwab</p>
          <h2>Your authenticated workspace is ready for the next connection.</h2>
          <p>
            The next layer will attach device trust, Firestore data, approvals, tools and AI
            orchestration behind the authenticated session.
          </p>
          <button className="primary" disabled>
            Send a request
          </button>
        </section>

        <div className="grid">
          <article><span>Projects</span><strong>0 active</strong><p>Project intelligence will appear here.</p></article>
          <article><span>Tasks</span><strong>0 due</strong><p>Your daily work queue will appear here.</p></article>
          <article><span>Automations</span><strong>0 enabled</strong><p>Scheduled and event-driven workflows will appear here.</p></article>
        </div>
      </section>
    </main>
  );
}
