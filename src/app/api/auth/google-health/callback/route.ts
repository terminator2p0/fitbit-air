import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  exchangeAuthorizationCode,
  fetchGoogleHealthIdentity,
  storeGoogleHealthConnection,
} from "@/server/google-health";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("google_health_oauth_state")?.value;

  if (error) return NextResponse.redirect(new URL(`/?health=${encodeURIComponent(error)}`, appUrl));
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/?health=invalid-state", appUrl));
  }

  try {
    const tokens = await exchangeAuthorizationCode(code);
    const identity = await fetchGoogleHealthIdentity(tokens.access_token);
    await storeGoogleHealthConnection(tokens, identity);
    const response = NextResponse.redirect(new URL("/?health=connected", appUrl));
    response.cookies.delete("google_health_oauth_state");
    return response;
  } catch (cause) {
    console.error("Google Health OAuth callback failed", cause instanceof Error ? cause.message : "unknown error");
    return NextResponse.redirect(new URL("/?health=connection-failed", appUrl));
  }
}
