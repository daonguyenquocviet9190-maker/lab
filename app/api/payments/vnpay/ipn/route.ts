import { NextResponse } from "next/server";
import { updateOrderByOrderNumber } from "@/lib/server/orderStore";
import { verifyVnpayQuery } from "@/lib/server/vnpay";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const valid = verifyVnpayQuery(searchParams);

    if (!valid) {
      return NextResponse.json({ RspCode: "97", Message: "Invalid signature" });
    }

    const orderNumber = searchParams.get("vnp_TxnRef") || "";
    const responseCode = searchParams.get("vnp_ResponseCode") || "";
    const transactionNo = searchParams.get("vnp_TransactionNo") || "";

    if (!orderNumber) {
      return NextResponse.json({ RspCode: "01", Message: "Order not found" });
    }

    const updated = await updateOrderByOrderNumber(orderNumber, (order) => ({
      ...order,
      paymentTransactionId: transactionNo,
      paymentPaidAt: new Date().toISOString(),
      paymentStatus: responseCode === "00" ? "paid" : "failed",
      status: responseCode === "00" ? "Chờ xác nhận" : "Thanh toán thất bại",
      updatedAt: new Date().toISOString(),
    }));

    if (!updated) {
      return NextResponse.json({ RspCode: "01", Message: "Order not found" });
    }

    return NextResponse.json({ RspCode: "00", Message: "Confirm Success" });
  } catch {
    return NextResponse.json({ RspCode: "99", Message: "Unknown error" });
  }
}
