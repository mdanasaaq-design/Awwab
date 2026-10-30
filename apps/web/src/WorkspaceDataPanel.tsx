import { useEffect, useState, type FormEvent } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { firebaseApp } from "./firebase";

type ProjectStatus = "active" | "archived";
type TaskStatus = "todo" | "in_progress" | "done" | "blocked" | "cancelled";
type TaskPriority = "low" | "medium" | "high" | "urgent";

type ProjectRecord = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

type TaskRecord = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: Timestamp | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

const taskStatuses: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
];

const priorities: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

function timestampOrNull(value: unknown): Timestamp | null {
  return value instanceof Timestamp ? value : null;
}

function formatDate(value: Timestamp | null): string {
  if (!value) return "Date unavailable";
  return value.toDate().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function firestoreError(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string") {
      if (code === "permission-denied") return "Firestore rules rejected this change. Check that the current rules are deployed and your account is allowed to edit this workspace.";
      if (code === "unavailable" || code === "deadline-exceeded") return "The data service is temporarily unavailable. Check your connection and try again.";
      if (code === "unauthenticated") return "Your session has expired. Sign in again to continue.";
    }
  }
  return fallback;
}

export function ProjectsPanel({ uid }: { uid: string }) {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!firebaseApp) {
      setError("Firebase is not configured for this environment.");
      setLoading(false);
      return;
    }
    const reference = collection(getFirestore(firebaseApp), "users", uid, "projects");
    return onSnapshot(reference, (snapshot) => {
      const next = snapshot.docs.map((item) => {
        const data = item.data();
        return {
          id: item.id,
          name: typeof data.name === "string" ? data.name : "Untitled project",
          description: typeof data.description === "string" ? data.description : "",
          status: data.status === "archived" ? "archived" as const : "active" as const,
          createdAt: timestampOrNull(data.createdAt),
          updatedAt: timestampOrNull(data.updatedAt),
        };
      });
      next.sort((a, b) => (b.updatedAt?.toMillis() ?? 0) - (a.updatedAt?.toMillis() ?? 0));
      setProjects(next);
      setLoading(false);
      setError("");
    }, (cause) => {
      setError(firestoreError(cause, "Could not load projects. Try refreshing the page."));
      setLoading(false);
    });
  }, [uid]);

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanDescription = description.trim();
    if (!cleanName || cleanName.length > 160 || cleanDescription.length > 4000) {
      setError("Project names must be 1–160 characters and descriptions no longer than 4,000 characters.");
      return;
    }
    if (!firebaseApp) {
      setError("Firebase is not configured for this environment.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await addDoc(collection(getFirestore(firebaseApp), "users", uid, "projects"), {
        name: cleanName,
        description: cleanDescription,
        status: "active",
        tags: [],
        repositoryReferences: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setName("");
      setDescription("");
    } catch (cause) {
      setError(firestoreError(cause, "Could not create the project."));
    } finally {
      setBusy(false);
    }
  }

  function beginEdit(project: ProjectRecord) {
    setEditingId(project.id);
    setEditName(project.name);
    setEditDescription(project.description);
    setError("");
  }

  async function saveProject(project: ProjectRecord) {
    const cleanName = editName.trim();
    const cleanDescription = editDescription.trim();
    if (!cleanName || cleanName.length > 160 || cleanDescription.length > 4000) {
      setError("Project names must be 1–160 characters and descriptions no longer than 4,000 characters.");
      return;
    }
    if (!firebaseApp) return;
    setBusy(true);
    setError("");
    try {
      await updateDoc(doc(getFirestore(firebaseApp), "users", uid, "projects", project.id), {
        name: cleanName,
        description: cleanDescription,
        updatedAt: serverTimestamp(),
      });
      setEditingId("");
    } catch (cause) {
      setError(firestoreError(cause, "Could not update the project."));
    } finally {
      setBusy(false);
    }
  }

  async function changeProjectStatus(project: ProjectRecord) {
    if (!firebaseApp) return;
    setBusy(true);
    setError("");
    try {
      await updateDoc(doc(getFirestore(firebaseApp), "users", uid, "projects", project.id), {
        status: project.status === "active" ? "archived" : "active",
        updatedAt: serverTimestamp(),
      });
    } catch (cause) {
      setError(firestoreError(cause, "Could not update the project status."));
    } finally {
      setBusy(false);
    }
  }

  async function removeProject(project: ProjectRecord) {
    if (!window.confirm(`Delete “${project.name}”? This does not delete any tasks.`)) return;
    if (!firebaseApp) return;
    setBusy(true);
    setError("");
    try {
      await deleteDoc(doc(getFirestore(firebaseApp), "users", uid, "projects", project.id));
    } catch (cause) {
      setError(firestoreError(cause, "Could not delete the project."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="workspace-data" aria-label="Project workspace">
      <div className="memory-policy-note">
        <strong>Projects · account-scoped workspace data</strong>
        <p>Projects are stored under your signed-in account in Firestore. You can create, edit, archive, restore, or delete them. Deleting a project does not delete tasks.</p>
      </div>
      <form className="memory-form" onSubmit={(event) => void createProject(event)}>
        <label>
          Project name
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={160} placeholder="e.g. Awwab v1.0" required />
        </label>
        <label>
          Description
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={4000} rows={3} placeholder="What is this project trying to achieve?" />
        </label>
        <div className="memory-submit-row">
          <small>{name.trim().length}/160 name characters · {description.length}/4000 description characters</small>
          <button className="primary" type="submit" disabled={busy || !name.trim()}>{busy ? "Saving…" : "Create project"}</button>
        </div>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="memory-list-heading">
        <div><p className="eyebrow">PROJECT REGISTER</p><h2>Your projects</h2></div>
        <span>{projects.length} {projects.length === 1 ? "project" : "projects"}</span>
      </div>
      {loading && <p className="muted" role="status">Loading projects…</p>}
      {!loading && projects.length === 0 && !error && (
        <div className="empty-state"><h2>No projects yet.</h2><p>Create your first project above. It will appear here as soon as Firestore confirms the save.</p></div>
      )}
      <div className="workspace-record-list">
        {projects.map((project) => (
          <article className="memory-record workspace-record" key={project.id}>
            {editingId === project.id ? (
              <div className="memory-edit">
                <label>Project name<input value={editName} onChange={(event) => setEditName(event.target.value)} maxLength={160} /></label>
                <label>Description<textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} maxLength={4000} rows={3} /></label>
                <div className="memory-actions">
                  <button className="primary" type="button" disabled={busy} onClick={() => void saveProject(project)}>Save changes</button>
                  <button className="secondary" type="button" disabled={busy} onClick={() => setEditingId("")}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="memory-record-heading">
                  <div><strong>{project.name}</strong><span className="quiet-label">{project.status.toUpperCase()} · UPDATED {formatDate(project.updatedAt)}</span></div>
                  <span className={project.status === "active" ? "device-badge trusted" : "device-badge"}>{project.status}</span>
                </div>
                <p>{project.description || "No description added."}</p>
                <div className="memory-actions">
                  <button className="secondary" type="button" disabled={busy} onClick={() => beginEdit(project)}>Edit</button>
                  <button className="secondary" type="button" disabled={busy} onClick={() => void changeProjectStatus(project)}>{project.status === "active" ? "Archive" : "Restore"}</button>
                  <button className="danger" type="button" disabled={busy} onClick={() => void removeProject(project)}>Delete</button>
                </div>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export function TasksPanel({ uid }: { uid: string }) {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!firebaseApp) {
      setError("Firebase is not configured for this environment.");
      setLoading(false);
      return;
    }
    const reference = collection(getFirestore(firebaseApp), "users", uid, "tasks");
    return onSnapshot(reference, (snapshot) => {
      const next = snapshot.docs.map((item) => {
        const data = item.data();
        return {
          id: item.id,
          title: typeof data.title === "string" ? data.title : "Untitled task",
          description: typeof data.description === "string" ? data.description : "",
          status: taskStatuses.some((item) => item.value === data.status) ? data.status as TaskStatus : "todo",
          priority: priorities.some((item) => item.value === data.priority) ? data.priority as TaskPriority : "medium",
          dueAt: timestampOrNull(data.dueAt),
          createdAt: timestampOrNull(data.createdAt),
          updatedAt: timestampOrNull(data.updatedAt),
        };
      });
      next.sort((a, b) => {
        const aDue = a.dueAt?.toMillis() ?? Number.MAX_SAFE_INTEGER;
        const bDue = b.dueAt?.toMillis() ?? Number.MAX_SAFE_INTEGER;
        return aDue - bDue || (b.updatedAt?.toMillis() ?? 0) - (a.updatedAt?.toMillis() ?? 0);
      });
      setTasks(next);
      setLoading(false);
      setError("");
    }, (cause) => {
      setError(firestoreError(cause, "Could not load tasks. Try refreshing the page."));
      setLoading(false);
    });
  }, [uid]);

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    if (!cleanTitle || cleanTitle.length > 200 || cleanDescription.length > 4000) {
      setError("Task titles must be 1–200 characters and descriptions no longer than 4,000 characters.");
      return;
    }
    if (!firebaseApp) {
      setError("Firebase is not configured for this environment.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const dueAt = dueDate ? Timestamp.fromDate(new Date(`${dueDate}T23:59:59`)) : null;
      await addDoc(collection(getFirestore(firebaseApp), "users", uid, "tasks"), {
        title: cleanTitle,
        description: cleanDescription,
        status: "todo",
        priority,
        dueAt,
        projectId: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        completedAt: null,
        source: "user",
      });
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
    } catch (cause) {
      setError(firestoreError(cause, "Could not create the task."));
    } finally {
      setBusy(false);
    }
  }

  async function updateTaskStatus(task: TaskRecord, status: TaskStatus) {
    if (!firebaseApp || status === task.status) return;
    setBusy(true);
    setError("");
    try {
      await updateDoc(doc(getFirestore(firebaseApp), "users", uid, "tasks", task.id), {
        status,
        completedAt: status === "done" ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
      });
    } catch (cause) {
      setError(firestoreError(cause, "Could not update the task."));
    } finally {
      setBusy(false);
    }
  }

  async function removeTask(task: TaskRecord) {
    if (!window.confirm(`Delete task “${task.title}”?`)) return;
    if (!firebaseApp) return;
    setBusy(true);
    setError("");
    try {
      await deleteDoc(doc(getFirestore(firebaseApp), "users", uid, "tasks", task.id));
    } catch (cause) {
      setError(firestoreError(cause, "Could not delete the task."));
    } finally {
      setBusy(false);
    }
  }

  const visibleTasks = filter === "all" ? tasks : tasks.filter((task) => task.status === filter);

  return (
    <section className="workspace-data" aria-label="Task workspace">
      <div className="memory-policy-note">
        <strong>Tasks · account-scoped workspace data</strong>
        <p>Tasks are stored under your signed-in account. You can track status, priority, and due dates. Project linking is intentionally not enabled until same-user project-reference validation is complete.</p>
      </div>
      <form className="memory-form" onSubmit={(event) => void createTask(event)}>
        <label>
          Task title
          <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} placeholder="What needs to get done?" required />
        </label>
        <label>
          Description
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={4000} rows={3} placeholder="Optional details or acceptance criteria…" />
        </label>
        <div className="memory-form-row">
          <label>Priority<select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>{priorities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label>Due date<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label>
        </div>
        <div className="memory-submit-row">
          <small>{title.trim().length}/200 title characters · {description.length}/4000 description characters</small>
          <button className="primary" type="submit" disabled={busy || !title.trim()}>{busy ? "Saving…" : "Create task"}</button>
        </div>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="memory-list-heading">
        <div><p className="eyebrow">TASK REGISTER</p><h2>Your tasks</h2></div>
        <span>{visibleTasks.length} of {tasks.length}</span>
      </div>
      <div className="task-filter" role="group" aria-label="Filter tasks by status">
        <button className={filter === "all" ? "task-filter-active" : ""} type="button" onClick={() => setFilter("all")}>All</button>
        {taskStatuses.map((item) => <button key={item.value} className={filter === item.value ? "task-filter-active" : ""} type="button" onClick={() => setFilter(item.value)}>{item.label}</button>)}
      </div>
      {loading && <p className="muted" role="status">Loading tasks…</p>}
      {!loading && visibleTasks.length === 0 && !error && (
        <div className="empty-state"><h2>{tasks.length ? "No tasks in this view." : "No tasks yet."}</h2><p>{tasks.length ? "Choose another status filter to see more tasks." : "Create your first task above. It will appear here as soon as Firestore confirms the save."}</p></div>
      )}
      <div className="workspace-record-list">
        {visibleTasks.map((task) => (
          <article className="memory-record workspace-record" key={task.id}>
            <div className="memory-record-heading">
              <div><strong>{task.title}</strong><span className="quiet-label">{task.priority.toUpperCase()} PRIORITY · {task.dueAt ? `DUE ${formatDate(task.dueAt)}` : "NO DUE DATE"}</span></div>
              <span className="device-badge">{task.status.replaceAll("_", " ")}</span>
            </div>
            <p>{task.description || "No additional details."}</p>
            <div className="memory-actions task-actions">
              <label className="task-status-control">Status
                <select value={task.status} disabled={busy} onChange={(event) => void updateTaskStatus(task, event.target.value as TaskStatus)}>
                  {taskStatuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
              <button className="danger" type="button" disabled={busy} onClick={() => void removeTask(task)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
