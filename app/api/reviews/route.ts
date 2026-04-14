import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { COLLECTIONS, getCollection } from "@/lib/server/mongoCollections";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productKey = searchParams.get("productKey");
    const query = productKey ? { productKey } : {};

    const reviews = await (await getCollection(COLLECTIONS.reviews))
      .find(query)
      .toArray();

    return NextResponse.json({ reviews });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không tải được đánh giá.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const review = {
      id: payload.id ?? crypto.randomUUID(),
      productKey: payload.productKey,
      productName: payload.productName,
      authorName: payload.authorName,
      authorEmail: payload.authorEmail,
      rating: payload.rating,
      comment: payload.comment,
      createdAt: payload.createdAt ?? new Date().toISOString(),
    };

    const collection = await getCollection(COLLECTIONS.reviews);
    await collection.insertOne(review);

    return NextResponse.json({ ok: true, review });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không lưu được đánh giá.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { id?: string };
    const id = body.id?.trim();
    if (!id) {
      return NextResponse.json({ message: "Thiếu id đánh giá." }, { status: 400 });
    }

    const collection = await getCollection(COLLECTIONS.reviews);
    const result = await collection.deleteOne({ id });
    if (!result.deletedCount) {
      return NextResponse.json({ message: "Không tìm thấy đánh giá." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không xóa được đánh giá.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
