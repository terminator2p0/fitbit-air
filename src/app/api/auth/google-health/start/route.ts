import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { buildGoogleHealthAuthorizationUrl } from "@/server/google-health";

export const runtime = "nodejs";

export async function GET() {
  try {
    const state = randomBytes(32).toString("base64url");
    const response = NextResponse.redirect(buildGoogleHealthAuthorizationUrl(state));
    response.cookies.set("google_health_oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60,
      path: "/api/auth/google-health/callback",
    });
    return response;
  } catch {
    return NextResponse.redirect(new URL("/?health=configuration-required", process.env.APP_URL ?? "http://localhost:3000"));
  }
}
