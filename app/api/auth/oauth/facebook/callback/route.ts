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
  const errorReason = url.searchParams.get("error_reason");
  const cookieState = request.headers
    .get("cookie")
    ?.match(/oauth_facebook_state=([^;]+)/)?.[1];

  if (errorReason) {
    return NextResponse.redirect(
      `${origin}/auth/oauth-complete?error=${encodeURIComponent(errorReason)}`,
    );
  }

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(
      `${origin}/auth/oauth-complete?error=${encodeURIComponent(
        "Xác thực Facebook không hợp lệ.",
      )}`,
    );
  }

  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${origin}/auth/oauth-complete?error=${encodeURIComponent(
        "Thiếu FACEBOOK_CLIENT_ID hoặc FACEBOOK_CLIENT_SECRET.",
      )}`,
    );
  }

  try {
    const redirectUri = `${origin}/api/auth/oauth/facebook/callback`;
    const tokenUrl = new URL(
      "https://graph.facebook.com/v20.0/oauth/access_token",
    );
    tokenUrl.searchParams.set("client_id", clientId);
    tokenUrl.searchParams.set("client_secret", clientSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl);
    const tokenData = (await tokenResponse.json()) as {
      access_token?: string;
      error?: { message?: string };
    };

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(
        tokenData.error?.message || "Không lấy được access token Facebook.",
      );
    }

    const profileUrl = new URL("https://graph.facebook.com/me");
    profileUrl.searchParams.set("fields", "id,name,email,picture.type(large)");
    profileUrl.searchParams.set("access_token", tokenData.access_token);

    const profileResponse = await fetch(profileUrl);
    const profileData = (await profileResponse.json()) as {
      id?: string;
      name?: string;
      email?: string;
      picture?: { data?: { url?: string } };
      error?: { message?: string };
    };

    if (!profileResponse.ok || !profileData.id) {
      throw new Error(
        profileData.error?.message || "Không lấy được hồ sơ Facebook.",
      );
    }

    const email =
      profileData.email || `facebook-${profileData.id}@facebook.local`;

    const user = await upsertOAuthUser({
      provider: "facebook",
      providerId: profileData.id,
      fullName: profileData.name || "Facebook User",
      email,
      avatar: profileData.picture?.data?.url,
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
      `${origin}/auth/oauth-complete?provider=facebook&session=${encodeURIComponent(
        session,
      )}`,
    );
    response.cookies.set("oauth_facebook_state", "", {
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
          : "Đăng nhập Facebook thất bại.",
      )}`,
    );
  }
}
