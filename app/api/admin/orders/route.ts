import { NextResponse } from "next/server";
import { COLLECTIONS, getCollection } from "@/lib/server/mongoCollections";

export async function GET() {
  try {
    const orders = await (await getCollection(COLLECTIONS.orders))
      .find({})
      .toArray();
    return NextResponse.json({ orders });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không tải được đơn hàng.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
