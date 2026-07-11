import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { Firestore, getFirestore } from "firebase-admin/firestore";
import { getServerConfig } from "./config";

let firestore: Firestore | undefined;

export function getAdminFirestore() {
  if (firestore) return firestore;

  const config = getServerConfig();
  const app =
    getApps()[0] ??
    initializeApp({
      credential: config.isFirestoreEmulated ? undefined : applicationDefault(),
      projectId: config.googleCloudProject,
    });

  firestore = getFirestore(app, config.firestoreDatabaseId);
  firestore.settings({ ignoreUndefinedProperties: true });
  return firestore;
}

export async function checkFirestoreConnection() {
  const database = getAdminFirestore();
  await database.collection("system").doc("health-check").get();
}
