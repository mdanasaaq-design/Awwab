import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, beforeEach, test } from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const PROJECT_ID = "demo-awwab";
let testEnv;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

after(async () => {
  await testEnv.cleanup();
});

function userContext(uid) {
  return testEnv.authenticatedContext(uid);
}

function guestContext() {
  return testEnv.unauthenticatedContext();
}

test("unauthenticated clients cannot read user data", async () => {
  const guest = guestContext();
  await assertFails(getDoc(doc(guest.firestore(), "users/alice")));
});

test("a user can read their own backend-created profile but cannot write it", async () => {
  const alice = userContext("alice");
  const db = alice.firestore();
  const profileRef = doc(db, "users/alice");

  await testEnv.withSecurityRulesDisabled(async (admin) => {
    await setDoc(doc(admin.firestore(), "users/alice"), {
      displayName: "Alice",
      email: "alice@example.com",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      status: "active",
      timezone: "UTC",
      locale: "en",
    });
  });

  const snapshot = await assertSucceeds(getDoc(profileRef));
  assert.equal(snapshot.get("displayName"), "Alice");

  await assertFails(setDoc(profileRef, { displayName: "Client overwrite" }));
  await assertFails(updateDoc(profileRef, { displayName: "Client edit" }));
  await assertFails(updateDoc(profileRef, { email: "forged@example.com" }));
  await assertFails(updateDoc(profileRef, { createdAt: new Date() }));
  await assertFails(updateDoc(profileRef, { status: "admin" }));
  await assertFails(updateDoc(profileRef, { timezone: "Pacific/Auckland" }));
  await assertFails(updateDoc(profileRef, { unexpectedField: true }));
  await assertFails(deleteDoc(profileRef));
});

test("a user cannot read or write another user's profile", async () => {
  const alice = userContext("alice");
  const bob = userContext("bob");

  await testEnv.withSecurityRulesDisabled(async (admin) => {
    await setDoc(doc(admin.firestore(), "users/alice"), { displayName: "Alice" });
  });

  await assertFails(getDoc(doc(alice.firestore(), "users/bob")));
  await assertFails(
    setDoc(doc(alice.firestore(), "users/bob"), {
      displayName: "forbidden",
    }),
  );
  await assertFails(
    updateDoc(doc(bob.firestore(), "users/alice"), {
      displayName: "forbidden",
    }),
  );
});

test("projects and tasks enforce owner schemas and timestamp integrity", async () => {
  const alice = userContext("alice");
  const bob = userContext("bob");
  const aliceDb = alice.firestore();
  const bobDb = bob.firestore();
  const project = doc(aliceDb, "users/alice/projects/project-1");

  await assertSucceeds(setDoc(project, {
    name: "Alice project",
    description: "A project description",
    status: "active",
    tags: ["work", "personal"],
    repositoryReferences: ["https://github.com/example/repo"],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertSucceeds(getDoc(project));
  await assertSucceeds(updateDoc(project, {
    status: "archived",
    updatedAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(project, {
    status: "deleted",
    updatedAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(project, {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(project, {
    unexpectedField: true,
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(aliceDb, "users/alice/projects/project-empty-name"), {
    name: "",
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(aliceDb, "users/alice/projects/project-invalid-tags"), {
    name: "Invalid tags",
    status: "active",
    tags: "not-a-list",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(aliceDb, "users/alice/projects/project-long-name"), {
    name: "x".repeat(161),
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(aliceDb, "users/alice/projects/project-invalid-references"), {
    name: "Invalid references",
    status: "active",
    repositoryReferences: { repository: "https://github.com/example/repo" },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(aliceDb, "users/alice/projects/project-non-string-tag"), {
    name: "Non-string tag",
    status: "active",
    tags: ["valid", { forged: true }],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(aliceDb, "users/alice/projects/project-long-reference"), {
    name: "Long reference",
    status: "active",
    repositoryReferences: ["x".repeat(501)],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(aliceDb, "users/alice/projects/project-too-many-tags"), {
    name: "Too many tags",
    status: "active",
    tags: Array.from({ length: 6 }, (_, index) => `tag-${index}`),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(aliceDb, "users/alice/projects/project-extra-field"), {
    name: "Unexpected field",
    status: "active",
    ownerUid: "bob",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(aliceDb, "users/alice/projects/project-forged-time"), {
    name: "Forged time",
    status: "active",
    createdAt: new Date("2020-01-01T00:00:00.000Z"),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(getDoc(doc(bobDb, "users/alice/projects/project-1")));
  await assertFails(setDoc(doc(bobDb, "users/alice/projects/project-2"), {
    name: "Bob cannot write here",
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));

  await assertSucceeds(setDoc(doc(bobDb, "users/bob/projects/bob-project"), {
    name: "Bob project",
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));

  const task = doc(aliceDb, "users/alice/tasks/task-1");
  await assertSucceeds(setDoc(task, {
    title: "Alice task",
    description: "A valid user-created task",
    status: "todo",
    priority: "medium",
    source: "user",
    projectId: "project-1",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertSucceeds(getDoc(task));
  await assertSucceeds(updateDoc(task, {
    status: "in_progress",
    updatedAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(task, {
    status: "running",
    updatedAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(task, {
    source: "assistant",
    updatedAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(task, {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(aliceDb, "users/alice/tasks/task-invalid-priority"), {
    title: "Invalid priority",
    status: "todo",
    priority: "critical",
    source: "user",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(aliceDb, "users/alice/tasks/task-empty-title"), {
    title: "",
    status: "todo",
    priority: "medium",
    source: "user",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(aliceDb, "users/alice/tasks/task-long-title"), {
    title: "x".repeat(201),
    status: "todo",
    priority: "medium",
    source: "user",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(aliceDb, "users/alice/tasks/task-invalid-due"), {
    title: "Invalid due date",
    status: "todo",
    priority: "medium",
    source: "user",
    dueAt: "tomorrow",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(aliceDb, "users/alice/tasks/task-invalid-project"), {
    title: "Invalid project reference",
    status: "todo",
    priority: "medium",
    source: "user",
    projectId: 42,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(aliceDb, "users/alice/tasks/task-missing-project"), {
    title: "Missing project",
    status: "todo",
    priority: "medium",
    source: "user",
    projectId: "missing-project",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(aliceDb, "users/alice/tasks/task-cross-user-project"), {
    title: "Cross-user project reference",
    status: "todo",
    priority: "medium",
    source: "user",
    projectId: "bob-project",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertSucceeds(setDoc(doc(aliceDb, "users/alice/tasks/task-no-project"), {
    title: "Task without project",
    status: "todo",
    priority: "low",
    source: "user",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(aliceDb, "users/alice/tasks/task-invalid-source"), {
    title: "Forged provenance",
    status: "todo",
    priority: "medium",
    source: "assistant",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(aliceDb, "users/alice/tasks/task-recurrence"), {
    title: "Unsupported recurrence",
    status: "todo",
    priority: "medium",
    source: "user",
    recurrence: { frequency: "daily" },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(aliceDb, "users/alice/tasks/task-forged-time"), {
    title: "Forged timestamp",
    status: "todo",
    priority: "medium",
    source: "user",
    createdAt: new Date("2020-01-01T00:00:00.000Z"),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(getDoc(doc(bobDb, "users/alice/tasks/task-1")));
  await assertFails(setDoc(doc(bobDb, "users/alice/tasks/task-2"), {
    title: "Bob cannot write here",
    status: "todo",
    priority: "medium",
    source: "user",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertSucceeds(deleteDoc(task));
  await assertSucceeds(deleteDoc(doc(aliceDb, "users/alice/tasks/task-no-project")));
  await assertSucceeds(deleteDoc(project));
});

test("client cannot directly mutate devices", async () => {
  const alice = userContext("alice");
  const db = alice.firestore();
  const device = doc(db, "users/alice/devices/device-1234567890123456");

  await assertFails(
    setDoc(device, {
      platform: "web",
      status: "trusted",
    }),
  );
  await assertFails(updateDoc(device, { status: "revoked" }));
  await assertFails(deleteDoc(device));
});

test("client cannot directly mutate approvals or audit activity", async () => {
  const alice = userContext("alice");
  const db = alice.firestore();

  await assertFails(
    setDoc(doc(db, "users/alice/approvals/approval-1"), {
      status: "approved",
    }),
  );
  await assertFails(
    setDoc(doc(db, "users/alice/activity/activity-1"), {
      action: "forged",
    }),
  );
});

test("owner can read approvals and activity but another user cannot", async () => {
  const alice = userContext("alice");
  const bob = userContext("bob");

  await testEnv.withSecurityRulesDisabled(async (admin) => {
    await setDoc(
      doc(admin.firestore(), "users/alice/approvals/approval-1"),
      { status: "pending" },
    );
    await setDoc(
      doc(admin.firestore(), "users/alice/activity/activity-1"),
      { action: "device_registered" },
    );
  });

  await assertSucceeds(
    getDoc(doc(alice.firestore(), "users/alice/approvals/approval-1")),
  );
  await assertSucceeds(
    getDoc(doc(alice.firestore(), "users/alice/activity/activity-1")),
  );
  await assertFails(
    getDoc(doc(bob.firestore(), "users/alice/approvals/approval-1")),
  );
  await assertFails(
    getDoc(doc(bob.firestore(), "users/alice/activity/activity-1")),
  );
});

test("conversations and messages are readable by the owner but backend-written", async () => {
  const alice = userContext("alice");
  const bob = userContext("bob");
  const db = alice.firestore();
  const conversation = doc(db, "users/alice/conversations/conversation-1");
  const message = doc(db, "users/alice/conversations/conversation-1/messages/message-1");

  await testEnv.withSecurityRulesDisabled(async (admin) => {
    await setDoc(doc(admin.firestore(), "users/alice/conversations/conversation-1"), {
      title: "Alice conversation",
    });
    await setDoc(doc(admin.firestore(), "users/alice/conversations/conversation-1/messages/message-1"), {
      role: "assistant",
      content: "Server-authored message",
    });
  });

  await assertSucceeds(getDoc(conversation));
  await assertSucceeds(getDoc(message));
  await assertFails(setDoc(conversation, { title: "forged conversation" }));
  await assertFails(updateDoc(conversation, { title: "tampered" }));
  await assertFails(deleteDoc(conversation));
  await assertFails(setDoc(message, { role: "assistant", content: "forged" }));
  await assertFails(setDoc(message, { role: "user", content: "direct client message" }));
  await assertFails(updateDoc(message, { content: "tampered" }));
  await assertFails(deleteDoc(message));
  await assertFails(getDoc(doc(bob.firestore(), "users/alice/conversations/conversation-1")));
});

test("notifications are readable/updatable by the owner but not client-created", async () => {
  const alice = userContext("alice");
  const db = alice.firestore();
  const notification = doc(db, "users/alice/notifications/notification-1");

  await testEnv.withSecurityRulesDisabled(async (admin) => {
    await setDoc(
      doc(admin.firestore(), "users/alice/notifications/notification-1"),
      {
        title: "Server notification",
        read: false,
      },
    );
  });

  await assertSucceeds(getDoc(notification));
  await assertSucceeds(updateDoc(notification, { read: true }));
  await assertSucceeds(updateDoc(notification, { read: false }));
  await assertFails(updateDoc(notification, { title: "tampered title" }));
  await assertFails(updateDoc(notification, { read: true, title: "tampered title" }));
  await assertFails(updateDoc(notification, { read: "yes" }));
  await assertFails(
    setDoc(doc(db, "users/alice/notifications/notification-2"), {
      title: "forged",
    }),
  );
  await assertFails(deleteDoc(notification));
});

test("memories allow owner read/delete but not client creation or updates", async () => {
  const alice = userContext("alice");
  const bob = userContext("bob");
  const db = alice.firestore();
  const memory = doc(db, "users/alice/memories/memory-1");

  await testEnv.withSecurityRulesDisabled(async (admin) => {
    await setDoc(doc(admin.firestore(), "users/alice/memories/memory-1"), {
      content: "A user-confirmed preference",
      source: "user",
      sensitivity: "low",
    });
  });

  await assertSucceeds(getDoc(memory));
  await assertFails(setDoc(doc(db, "users/alice/memories/memory-2"), { content: "forged" }));
  await assertFails(updateDoc(memory, { source: "assistant", confidence: 1 }));
  await assertFails(getDoc(doc(bob.firestore(), "users/alice/memories/memory-1")));
  await assertSucceeds(deleteDoc(memory));
});

test("automations and preferences are owner-readable but client read-only", async () => {
  const alice = userContext("alice");
  const bob = userContext("bob");
  const db = alice.firestore();
  const automation = doc(db, "users/alice/automations/automation-1");
  const preference = doc(db, "users/alice/preferences/preference-1");

  await testEnv.withSecurityRulesDisabled(async (admin) => {
    await setDoc(doc(admin.firestore(), "users/alice/automations/automation-1"), {
      name: "Server automation",
      enabled: false,
    });
    await setDoc(doc(admin.firestore(), "users/alice/preferences/preference-1"), {
      theme: "dark",
    });
  });

  await assertSucceeds(getDoc(automation));
  await assertSucceeds(getDoc(preference));
  await assertFails(setDoc(doc(db, "users/alice/automations/automation-2"), { name: "forged" }));
  await assertFails(updateDoc(automation, { enabled: true }));
  await assertFails(deleteDoc(automation));
  await assertFails(setDoc(doc(db, "users/alice/preferences/preference-2"), { theme: "light" }));
  await assertFails(updateDoc(preference, { theme: "light" }));
  await assertFails(deleteDoc(preference));
  await assertFails(getDoc(doc(bob.firestore(), "users/alice/automations/automation-1")));
  await assertFails(getDoc(doc(bob.firestore(), "users/alice/preferences/preference-1")));
});

test("jobs, connections, and bootstrap guard are not client-accessible", async () => {
  const alice = userContext("alice");
  const db = alice.firestore();

  await assertFails(getDoc(doc(db, "users/alice/jobs/job-1")));
  await assertFails(setDoc(doc(db, "users/alice/jobs/job-1"), { status: "queued" }));
  await assertFails(getDoc(doc(db, "users/alice/connections/connection-1")));
  await assertFails(setDoc(doc(db, "users/alice/connections/connection-1"), { status: "connected" }));
  await assertFails(getDoc(doc(db, "users/alice/system/firstDeviceBootstrap")));
  await assertFails(setDoc(doc(db, "users/alice/system/firstDeviceBootstrap"), { deviceId: "forged" }));
});
