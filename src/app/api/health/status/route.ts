import { NextResponse } from "next/server";
import { getMissingOAuthVariables, getServerConfig } from "@/server/config";
import { checkBigQueryConnection } from "@/server/google-cloud";
import { getGoogleHealthConnectionStatus } from "@/server/google-health";

export const runtime = "nodejs";

export async function GET() {
  const config = getServerConfig();
  const missing = getMissingOAuthVariables();
  let bigQuery: "ready" | "unavailable" = "unavailable";
  let connection: Awaited<ReturnType<typeof getGoogleHealthConnectionStatus>> = { connected: false };

  if (config.googleCloudProject) {
    try {
      if (await checkBigQueryConnection()) bigQuery = "ready";
      connection = await getGoogleHealthConnectionStatus();
    } catch {
      // Status stays non-sensitive and explains only whether the backend is reachable.
    }
  }

  return NextResponse.json({
    configured: missing.length === 0,
    bigQuery,
    dataset: config.bigQueryDataset,
    projectId: config.googleCloudProject,
    missing,
    googleHealth: connection,
  });
}
