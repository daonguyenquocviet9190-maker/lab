import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { COLLECTIONS, getCollection } from "@/lib/server/mongoCollections";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const order = body.order as Record<string, unknown> | undefined;

    if (!order || !Array.isArray(order.items) || order.items.length === 0) {
      return NextResponse.json(
        { message: "Giỏ hàng trống hoặc dữ liệu không hợp lệ." },
        { status: 400 },
      );
    }

    const paymentMethod = String(order.paymentMethod ?? "cod");
    const paymentStatus =
      paymentMethod === "bank_transfer" ? "pending" : "unpaid";
    const status =
      paymentMethod === "bank_transfer" ? "Chờ thanh toán" : "Chờ xác nhận";

    const nextOrder = {
      ...order,
      id: order.id ?? crypto.randomUUID(),
      paymentMethod,
      paymentStatus,
      status,
      createdAt: order.createdAt ?? new Date().toISOString(),
    };

    const collection = await getCollection(COLLECTIONS.orders);
    await collection.insertOne(nextOrder);

    return NextResponse.json({ ok: true, order: nextOrder });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không tạo được đơn hàng.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
