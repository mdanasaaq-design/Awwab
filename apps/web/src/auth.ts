import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";

export function observeAuth(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => undefined;
  }
  return onAuthStateChanged(auth, callback);
}

export async function signIn(email: string, password: string) {
  if (!auth) {
    throw new Error("Firebase is not configured for this environment.");
  }
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOutAwwab() {
  if (auth) {
    await signOut(auth);
  }
}
