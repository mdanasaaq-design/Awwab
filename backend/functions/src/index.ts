import { onCall } from "firebase-functions/v2/https";

export const health = onCall(() => ({
  ok: true,
  service: "awwab-functions",
  version: "0.1.0",
}));
