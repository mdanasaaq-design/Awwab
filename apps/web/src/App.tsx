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
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Command center</p>
            <h1>How can I help?</h1>
          </div>
          <span className="status">Foundation shell</span>
        </header>

        <section className="assistant-card">
          <p className="eyebrow">Awwab</p>
          <h2>Your assistant is ready for the next connection.</h2>
          <p>
            Authentication, Firestore, approvals, tools and AI orchestration will connect
            here through the secure backend boundary.
          </p>
          <button className="primary" disabled>
            Send a request
          </button>
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
