import { NextResponse } from "next/server";
import { upsertOAuthUser } from "@/lib/server/oauthUserStore";

function getOrigin(request: Request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function GET(request: Request) {
  const origin = getOrigin(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const cookieState = request.headers
    .get("cookie")
    ?.match(/oauth_google_state=([^;]+)/)?.[1];

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/oauth-complete?error=${encodeURIComponent(error)}`,
    );
  }

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(
      `${origin}/auth/oauth-complete?error=${encodeURIComponent(
        "Xác thực Google không hợp lệ.",
      )}`,
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${origin}/auth/oauth-complete?error=${encodeURIComponent(
        "Thiếu GOOGLE_CLIENT_ID hoặc GOOGLE_CLIENT_SECRET.",
      )}`,
    );
  }

  try {
    const redirectUri = `${origin}/api/auth/oauth/google/callback`;
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = (await tokenResponse.json()) as {
      access_token?: string;
      error?: string;
    };

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(tokenData.error || "Không lấy được access token Google.");
    }

    const profileResponse = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );

    const profileData = (await profileResponse.json()) as {
      sub?: string;
      name?: string;
      email?: string;
      picture?: string;
    };

    if (!profileResponse.ok || !profileData.sub || !profileData.email) {
      throw new Error("Không lấy được hồ sơ Google.");
    }

    const user = await upsertOAuthUser({
      provider: "google",
      providerId: profileData.sub,
      fullName: profileData.name || "Google User",
      email: profileData.email,
      avatar: profileData.picture,
    });

    const session = Buffer.from(
      JSON.stringify({
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      }),
    ).toString("base64url");

    const response = NextResponse.redirect(
      `${origin}/auth/oauth-complete?provider=google&session=${encodeURIComponent(
        session,
      )}`,
    );
    response.cookies.set("oauth_google_state", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (oauthError) {
    return NextResponse.redirect(
      `${origin}/auth/oauth-complete?error=${encodeURIComponent(
        oauthError instanceof Error
          ? oauthError.message
          : "Đăng nhập Google thất bại.",
      )}`,
    );
  }
}
