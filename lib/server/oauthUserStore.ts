import crypto from "node:crypto";
import { getDb } from "@/lib/mongo";

type OAuthProfile = {
  email?: string | null;
  name?: string | null;
  given_name?: string | null;
  family_name?: string | null;
  picture?: string | null;
  provider?: string;
  providerId?: string;
};

function buildUsername(email?: string | null, name?: string | null) {
  if (email) {
    return email.split("@")[0];
  }

  if (name) {
    return name.replace(/\s+/g, "-").toLowerCase();
  }

  return `user-${crypto.randomUUID().slice(0, 8)}`;
}

export async function upsertOAuthUser(profile: OAuthProfile) {
  const db = await getDb();
  const users = db.collection("users");

  const email = profile.email?.trim().toLowerCase() || null;
  const existing = email ? await users.findOne({ email }) : null;

  if (existing) {
    return existing;
  }

  const fullName =
    (profile.name ??
      [profile.given_name, profile.family_name].filter(Boolean).join(" ")) ||
    "Khách hàng";

  const newUser = {
    id: crypto.randomUUID(),
    fullName,
    username: buildUsername(email, fullName),
    email: email ?? `oauth-${crypto.randomUUID().slice(0, 8)}@kyo.local`,
    phone: "",
    password: "",
    role: "user",
    provider: profile.provider ?? "oauth",
    providerId: profile.providerId ?? "",
    createdAt: new Date().toISOString(),
  };

  await users.insertOne(newUser);
  return newUser;
}
