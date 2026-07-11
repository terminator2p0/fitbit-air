import { NextResponse } from "next/server";
import { getMissingOAuthVariables, getServerConfig } from "@/server/config";
import { checkFirestoreConnection } from "@/server/firestore";
import { getGoogleHealthConnectionStatus } from "@/server/google-health";

export const runtime = "nodejs";

export async function GET() {
  const config = getServerConfig();
  const missing = getMissingOAuthVariables();
  let firestore: "ready" | "unavailable" = "unavailable";
  let connection: Awaited<ReturnType<typeof getGoogleHealthConnectionStatus>> = { connected: false };

  if (config.firestoreEnabled) {
    try {
      await checkFirestoreConnection();
      firestore = "ready";
      connection = await getGoogleHealthConnectionStatus();
    } catch {
      // Status stays non-sensitive and explains only whether the backend is reachable.
    }
  }

  return NextResponse.json({
    configured: missing.length === 0,
    firestore,
    firestoreMode: config.isFirestoreEmulated ? "emulator" : "cloud",
    projectId: config.googleCloudProject,
    missing,
    googleHealth: connection,
  });
}
