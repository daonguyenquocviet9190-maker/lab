import { NextResponse } from "next/server";
import { COLLECTIONS, getCollection } from "@/lib/server/mongoCollections";

type RouteParams = Promise<{ id: string }>;

export async function PATCH(
  _request: Request,
  { params }: { params: RouteParams },
) {
  try {
    const { id } = await params;
    const collection = await getCollection(COLLECTIONS.orders);

    const result = await collection.findOneAndUpdate(
      { id: String(id) },
      {
        $set: {
          paymentStatus: "paid",
          status: "Chờ xác nhận",
          paymentPaidAt: new Date().toISOString(),
        },
      },
      { returnDocument: "after" },
    );

    if (!result.value) {
      return NextResponse.json(
        { message: "Không tìm thấy đơn hàng." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, order: result.value });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không cập nhật được đơn hàng.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
