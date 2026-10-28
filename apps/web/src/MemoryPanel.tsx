import { useEffect, useState, type FormEvent } from "react";
import { addDoc, collection, deleteDoc, doc, getFirestore, onSnapshot, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { firebaseApp } from "./firebase";

type MemoryType =
  | "explicit_preference"
  | "stable_profile_fact"
  | "goal_commitment"
  | "project_context"
  | "learned_preference"
  | "temporary_context";
type Sensitivity = "low" | "normal" | "sensitive";
type MemoryRecord = {
  id: string;
  content: string;
  type: MemoryType;
  sourceKind: "user_explicit" | "user_corrected";
  sourceRef: string | null;
  confidence: number;
  sensitivity: Sensitivity;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt: Timestamp | null;
  userVisible: boolean;
  confirmedByUser: boolean;
};
const types: { value: MemoryType; label: string }[] = [
  { value: "explicit_preference", label: "Explicit preference" },
  { value: "stable_profile_fact", label: "Stable fact" },
  { value: "goal_commitment", label: "Goal or commitment" },
  { value: "project_context", label: "Project context" },
  { value: "learned_preference", label: "Learned preference (you confirm)" },
  { value: "temporary_context", label: "Temporary context" },
];
const limit = 2000;

export function MemoryPanel({ uid }: { uid: string }) {
  const [records, setRecords] = useState<MemoryRecord[]>([]);
  const [content, setContent] = useState("");
  const [type, setType] = useState<MemoryType>("explicit_preference");
  const [sensitivity, setSensitivity] = useState<Sensitivity>("normal");
  const [expiry, setExpiry] = useState("never");
  const [confirmed, setConfirmed] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [editContent, setEditContent] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseApp) {
      setError("Firebase is not configured for this environment.");
      setLoading(false);
      return;
    }
    const db = getFirestore(firebaseApp);
    const ref = collection(db, "users", uid, "memories");
    return onSnapshot(ref, (snapshot) => {
      const next = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as MemoryRecord);
      next.sort((a, b) => {
        const aTime = a.updatedAt?.toMillis?.() ?? 0;
        const bTime = b.updatedAt?.toMillis?.() ?? 0;
        return bTime - aTime;
      });
      setRecords(next);
      setLoading(false);
      setError("");
    }, (cause) => {
      setError(cause instanceof Error ? cause.message : "Could not load memory.");
      setLoading(false);
    });
  }, [uid]);

  async function addMemory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > limit) {
      setError(`Memory must contain between 1 and ${limit} characters.`);
      return;
    }
    if (sensitivity === "sensitive" && !confirmed) {
      setError("Confirm that you explicitly want to save this sensitive detail.");
      return;
    }
    if (!firebaseApp) {
      setError("Firebase is not configured for this environment.");
      return;
    }
    setBusy(true);
    try {
      const db = getFirestore(firebaseApp);
      await addDoc(collection(db, "users", uid, "memories"), {
        content: trimmed,
        type,
        sourceKind: "user_explicit",
        sourceRef: "user-interface",
        confidence: 1,
        sensitivity,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expiresAt: expiry === "never" ? null : Timestamp.fromMillis(Date.now() + Number(expiry) * 24 * 60 * 60 * 1000),
        userVisible: true,
        confirmedByUser: sensitivity === "sensitive" ? confirmed : true,
      });
      setContent("");
      setSensitivity("normal");
      setExpiry("never");
      setConfirmed(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save memory.");
    } finally {
      setBusy(false);
    }
  }

  async function saveCorrection(record: MemoryRecord) {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed.length > limit) {
      setError(`Memory must contain between 1 and ${limit} characters.`);
      return;
    }
    if (!firebaseApp) return;
    setBusy(true);
    setError("");
    try {
      await updateDoc(doc(getFirestore(firebaseApp), "users", uid, "memories", record.id), {
        content: trimmed,
        sourceKind: "user_corrected",
        sourceRef: "user-correction",
        confidence: 1,
        confirmedByUser: true,
        updatedAt: serverTimestamp(),
      });
      setEditingId("");
      setEditContent("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not correct memory.");
    } finally {
      setBusy(false);
    }
  }

  async function removeMemory(record: MemoryRecord) {
    if (!window.confirm("Delete this saved memory? This cannot be undone.")) return;
    if (!firebaseApp) return;
    setBusy(true);
    setError("");
    try {
      await deleteDoc(doc(getFirestore(firebaseApp), "users", uid, "memories", record.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete memory.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="memory-workspace" aria-label="Personal memory workspace">
      <div className="memory-policy-note">
        <strong>Personal memory · under your control</strong>
        <p>Only details you enter here are saved. Records are scoped to your signed-in account, stored in Firestore, and can be corrected or deleted. Saved content is untrusted data—not permission to take actions.</p>
      </div>
      <form className="memory-form" onSubmit={(event) => void addMemory(event)}>
        <label>
          Memory content
          <textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={limit} rows={3} placeholder="A preference, goal, or project detail worth remembering…" required />
          <small>{content.length}/{limit} characters</small>
        </label>
        <div className="memory-form-row">
          <label>
            Type
            <select value={type} onChange={(event) => setType(event.target.value as MemoryType)}>
              {types.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label>
            Sensitivity
            <select value={sensitivity} onChange={(event) => { setSensitivity(event.target.value as Sensitivity); setConfirmed(false); }}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="sensitive">Sensitive</option>
            </select>
          </label>
          <label>
            Expiry
            <select value={expiry} onChange={(event) => setExpiry(event.target.value)}>
              <option value="never">No expiry</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
            </select>
          </label>
        </div>
        {sensitivity === "sensitive" && (
          <label className="memory-confirm">
            <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
            I explicitly confirm that I want to save this sensitive detail.
          </label>
        )}
        <div className="memory-submit-row">
          <span>Nothing is inferred or saved automatically.</span>
          <button className="primary" type="submit" disabled={busy || !content.trim() || (sensitivity === "sensitive" && !confirmed)}>{busy ? "Saving…" : "Save memory"}</button>
        </div>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="memory-list-heading">
        <div><p className="eyebrow">SAVED RECORDS</p><h2>Your memory</h2></div>
        <span>{records.length} {records.length === 1 ? "record" : "records"}</span>
      </div>
      {loading && <p className="muted" role="status">Loading your saved memory…</p>}
      {!loading && records.length === 0 && <div className="empty-state"><h2>No memories saved.</h2><p>Add a detail above. It will not be used by the assistant until a future, authorized retrieval workflow is connected.</p></div>}
      <div className="memory-records">
        {records.map((record) => (
          <article className="memory-record" key={record.id}>
            <div className="memory-record-meta">
              <span>{types.find((item) => item.value === record.type)?.label ?? record.type}</span>
              <span>{record.sensitivity} sensitivity</span>
              <span>{record.sourceKind === "user_corrected" ? "User-corrected" : "User-entered"}</span>
              {record.expiresAt && record.expiresAt.toMillis() <= Date.now() && <span>Expired</span>}
            </div>
            {editingId === record.id ? (
              <div className="memory-edit">
                <label>Correct this memory<textarea value={editContent} onChange={(event) => setEditContent(event.target.value)} maxLength={limit} rows={3} autoFocus /></label>
                <div className="memory-actions">
                  <button className="primary" type="button" disabled={busy} onClick={() => void saveCorrection(record)}>Save correction</button>
                  <button className="secondary" type="button" disabled={busy} onClick={() => setEditingId("")}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <p className="memory-record-content">{record.content}</p>
                <div className="memory-actions">
                  <button className="secondary" type="button" disabled={busy || Boolean(record.expiresAt && record.expiresAt.toMillis() <= Date.now())} onClick={() => { setEditingId(record.id); setEditContent(record.content); }}>Correct</button>
                  <button className="danger" type="button" disabled={busy} onClick={() => void removeMemory(record)}>Delete</button>
                </div>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
