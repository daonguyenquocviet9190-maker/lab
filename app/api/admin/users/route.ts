import { NextResponse } from "next/server";
import { COLLECTIONS, getCollection } from "@/lib/server/mongoCollections";

export async function GET() {
  try {
    const users = await (await getCollection(COLLECTIONS.users))
      .find({})
      .toArray();
    return NextResponse.json({ users });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không tải được tài khoản.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
