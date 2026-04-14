import { NextResponse } from "next/server";
import { COLLECTIONS, getCollection } from "@/lib/server/mongoCollections";

export async function GET() {
  try {
    const reviews = await (await getCollection(COLLECTIONS.reviews))
      .find({})
      .toArray();
    return NextResponse.json({ reviews });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không tải được đánh giá.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
