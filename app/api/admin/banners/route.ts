import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { COLLECTIONS, getCollection } from "@/lib/server/mongoCollections";

export async function GET() {
  try {
    const banners = await (await getCollection(COLLECTIONS.banners))
      .find({})
      .toArray();
    return NextResponse.json({ banners });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không tải được banner.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const collection = await getCollection(COLLECTIONS.banners);
    const banner = {
      ...payload,
      id: payload.id ?? crypto.randomUUID(),
    };

    await collection.insertOne(banner);
    return NextResponse.json({ ok: true, banner });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thêm được banner.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
