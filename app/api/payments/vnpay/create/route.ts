import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { addOrder } from "@/lib/server/orderStore";
import { createVnpayPaymentUrl } from "@/lib/server/vnpay";

type IncomingOrder = {
  orderNumber?: string;
  customer?: {
    fullName?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  items?: Array<{
    id?: string;
    name?: string;
    image?: string;
    price?: number;
    quantity?: number;
  }>;
  subtotal?: number;
  shippingFee?: number;
  total?: number;
  note?: string;
  createdAt?: string;
};

function getClientIp(request: Request) {
  const forwardedFor =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "";

  return forwardedFor.split(",")[0]?.trim() || "127.0.0.1";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      order?: IncomingOrder;
      bankCode?: string;
    };

    const order = body.order;

    if (!order) {
      return NextResponse.json(
        { error: "Thiếu dữ liệu đơn hàng." },
        { status: 400 },
      );
    }

    if (!Array.isArray(order.items) || order.items.length === 0) {
      return NextResponse.json(
        { error: "Giỏ hàng đang trống." },
        { status: 400 },
      );
    }

    if (!order.orderNumber) {
      return NextResponse.json(
        { error: "Thiếu mã đơn hàng." },
        { status: 400 },
      );
    }

    const amount = Number(order.total || 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Tổng tiền không hợp lệ." },
        { status: 400 },
      );
    }

    const paymentUrl = createVnpayPaymentUrl({
      amount,
      orderNumber: order.orderNumber,
      orderInfo: `Thanh toan don hang ${order.orderNumber}`,
      bankCode: body.bankCode,
      ipAddr: getClientIp(request),
      returnUrl: process.env.VNPAY_RETURN_URL || "http://localhost:3000/payment/vnpay/return",
    });

    const orderRecord = {
      id: crypto.randomUUID(),
      orderNumber: order.orderNumber,
      customer: order.customer || {},
      items: order.items,
      subtotal: Number(order.subtotal || 0),
      shippingFee: Number(order.shippingFee || 0),
      total: amount,
      note: order.note || "",
      paymentMethod: "vnpay",
      paymentProvider: "vnpay",
      paymentStatus: "pending",
      status: "Chờ thanh toán",
      paymentUrl,
      createdAt: order.createdAt || new Date().toISOString(),
    };

    await addOrder(orderRecord);

    return NextResponse.json({
      ok: true,
      paymentUrl,
      orderId: orderRecord.id,
      orderNumber: orderRecord.orderNumber,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Không tạo được liên kết VNPAY.",
      },
      { status: 500 },
    );
  }
}
