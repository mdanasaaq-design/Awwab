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

test("a user can create and read their own profile", async () => {
  const alice = userContext("alice");
  const db = alice.firestore();

  await assertSucceeds(
    setDoc(doc(db, "users/alice"), {
      displayName: "Alice",
    }),
  );

  const snapshot = await assertSucceeds(getDoc(doc(db, "users/alice")));
  assert.equal(snapshot.get("displayName"), "Alice");
});

test("a user cannot read or write another user's profile", async () => {
  const alice = userContext("alice");
  const bob = userContext("bob");

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

test("user-owned project data is isolated by uid", async () => {
  const alice = userContext("alice");
  const bob = userContext("bob");

  await assertSucceeds(
    setDoc(doc(alice.firestore(), "users/alice/projects/project-1"), {
      name: "Alice project",
    }),
  );
  await assertSucceeds(
    getDoc(doc(alice.firestore(), "users/alice/projects/project-1")),
  );
  await assertFails(
    getDoc(doc(bob.firestore(), "users/alice/projects/project-1")),
  );
  await assertFails(
    setDoc(doc(bob.firestore(), "users/alice/projects/project-2"), {
      name: "Bob cannot write here",
    }),
  );
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

test("conversation messages are append/read only for the owner", async () => {
  const alice = userContext("alice");
  const db = alice.firestore();
  const message = doc(
    db,
    "users/alice/conversations/conversation-1/messages/message-1",
  );

  await assertSucceeds(
    setDoc(message, {
      role: "user",
      content: "hello",
    }),
  );
  await assertSucceeds(getDoc(message));
  await assertFails(updateDoc(message, { content: "tampered" }));
  await assertFails(deleteDoc(message));
});

test("notifications are readable/updatable by the owner but not client-created", async () => {
  const alice = userContext("alice");
  const db = alice.firestore();
  const notification = doc(db, "users/alice/notifications/notification-1");

  await testEnv.withSecurityRulesDisabled(async (admin) => {
    await setDoc(notification, {
      title: "Server notification",
      read: false,
    });
  });

  await assertSucceeds(getDoc(notification));
  await assertSucceeds(updateDoc(notification, { read: true }));
  await assertFails(
    setDoc(doc(db, "users/alice/notifications/notification-2"), {
      title: "forged",
    }),
  );
  await assertFails(deleteDoc(notification));
});
