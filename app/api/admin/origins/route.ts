import { NextResponse } from "next/server";
import { COLLECTIONS, getCollection } from "@/lib/server/mongoCollections";

export async function GET() {
  try {
    const collection = await getCollection(COLLECTIONS.origins);
    const items = await collection.find({}).toArray();

    // ✅ FIX TRÙNG NAME
    const seen = new Set();
    for (const item of items) {
      if (seen.has(item.name)) {
        await collection.deleteOne({ _id: item._id });
      } else {
        seen.add(item.name);
      }
    }

    // Nếu chưa có thì thêm dữ liệu mẫu
    if (!items.length) {
      await collection.insertMany([
        { name: "Pháp" },
        { name: "Mỹ" },
        { name: "Nhật Bản" },
        { name: "Hàn Quốc" },
        { name: "Ý" },
      ]);
    }

    const refreshed = await collection.find({}).toArray();

    return NextResponse.json({ origins: refreshed });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không tải được xuất xứ.";
    return NextResponse.json({ message }, { status: 500 });
  }
}