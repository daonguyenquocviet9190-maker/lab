import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

function getOrigin(request: Request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function GET(request: Request) {
  const clientId = process.env.FACEBOOK_CLIENT_ID;

  if (!clientId) {
    return NextResponse.redirect(
      `${getOrigin(request)}/auth/oauth-complete?error=${encodeURIComponent(
        "Thiếu FACEBOOK_CLIENT_ID trong .env.local",
      )}`,
    );
  }

  const origin = getOrigin(request);
  const state = randomUUID();
  const redirectUri = `${origin}/api/auth/oauth/facebook/callback`;
  const url = new URL("https://www.facebook.com/v20.0/dialog/oauth");

  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "email,public_profile");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);

  const response = NextResponse.redirect(url);
  response.cookies.set("oauth_facebook_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
