import { NextResponse } from "next/server";
import { COLLECTIONS, getCollection } from "@/lib/server/mongoCollections";

// ================= GET =================
export async function GET() {
  try {
    const collection = await getCollection(COLLECTIONS.brands);

    // ✅ DỌN TRÙNG (CHẠY TẠM 1 LẦN)
    const items = await collection.find().toArray();
    const seen = new Set();

    for (const item of items) {
      if (seen.has(item.name)) {
        await collection.deleteOne({ _id: item._id });
      } else {
        seen.add(item.name);
      }
    }

    // ❗ TẠM THỜI CHƯA BẬT INDEX
    await collection.createIndex({ name: 1 }, { unique: true });

    const refreshed = await collection.find({}).toArray();

    return NextResponse.json({ brands: refreshed });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

// ================= PATCH =================
export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { from?: string; to?: string };
    const from = body.from?.trim();
    const to = body.to?.trim();

    if (!from || !to) {
      return NextResponse.json(
        { message: "Thiếu thông tin đổi tên." },
        { status: 400 }
      );
    }

    const collection = await getCollection(COLLECTIONS.brands);

    // ✅ Check trùng
    const existing = await collection.findOne({ name: to });
    if (existing) {
      return NextResponse.json(
        { message: "Thương hiệu đã tồn tại." },
        { status: 409 }
      );
    }

    const result = await collection.updateOne(
      { name: from },
      { $set: { name: to } }
    );

    if (!result.matchedCount) {
      return NextResponse.json(
        { message: "Không tìm thấy thương hiệu." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Không cập nhật được thương hiệu.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

// ================= POST =================
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string };
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json(
        { message: "Thiếu tên thương hiệu." },
        { status: 400 }
      );
    }

    const collection = await getCollection(COLLECTIONS.brands);

    // ✅ Check trùng
    const existing = await collection.findOne({ name });
    if (existing) {
      return NextResponse.json(
        { message: "Thương hiệu đã tồn tại." },
        { status: 409 }
      );
    }

    await collection.insertOne({ name });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Không thêm được thương hiệu.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

// ================= DELETE =================
export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { name?: string };
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json(
        { message: "Thiếu tên thương hiệu." },
        { status: 400 }
      );
    }

    const collection = await getCollection(COLLECTIONS.brands);

    const result = await collection.deleteOne({ name });

    if (!result.deletedCount) {
      return NextResponse.json(
        { message: "Không tìm thấy thương hiệu." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Không xóa được thương hiệu.";
    return NextResponse.json({ message }, { status: 500 });
  }
}