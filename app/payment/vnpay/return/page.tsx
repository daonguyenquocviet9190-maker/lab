import Link from "next/link";
import { updateOrderByOrderNumber } from "@/lib/server/orderStore";
import { verifyVnpayQuery } from "@/lib/server/vnpay";

export default async function VnpayReturnPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
      return;
    }

    if (typeof value === "string") {
      params.set(key, value);
    }
  });

  const orderNumber = params.get("vnp_TxnRef") || "";
  const responseCode = params.get("vnp_ResponseCode") || "";
  const transactionNo = params.get("vnp_TransactionNo") || "";

  let success = false;
  let message = "Không xác thực được thanh toán VNPAY.";

  try {
    const valid = verifyVnpayQuery(params);

    if (!valid) {
      message = "Sai chữ ký xác thực VNPAY.";
    } else if (!orderNumber) {
      message = "Không tìm thấy mã đơn hàng VNPAY.";
    } else if (responseCode === "00") {
      success = true;
      message = "Thanh toán VNPAY thành công. Đơn hàng đã được ghi nhận.";
    } else {
      message = `Thanh toán VNPAY chưa thành công. Mã phản hồi: ${responseCode}.`;
    }

    if (orderNumber) {
      await updateOrderByOrderNumber(orderNumber, (order) => ({
        ...order,
        paymentTransactionId: transactionNo,
        paymentPaidAt: success ? new Date().toISOString() : order.paymentPaidAt,
        paymentStatus: success ? "paid" : "failed",
        status: success ? "Chờ xác nhận" : "Thanh toán thất bại",
        updatedAt: new Date().toISOString(),
      }));
    }
  } catch (error) {
    message =
      error instanceof Error ? error.message : "Có lỗi khi xử lý thanh toán VNPAY.";
  }

  return (
    <div className="mx-auto max-w-[960px] px-4 py-14">
      <div className="rounded-[28px] border border-[#f1d8de] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
        <p
          className={`text-sm font-semibold uppercase tracking-[0.22em] ${
            success ? "text-[#1f9d55]" : "text-[#ee4d8c]"
          }`}
        >
          VNPAY
        </p>
        <h1 className="mt-4 text-[2.2rem] font-semibold text-slate-900">
          {success ? "Thanh toán thành công" : "Thanh toán chưa hoàn tất"}
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">{message}</p>

        {orderNumber ? (
          <div className="mt-6 rounded-2xl bg-[#fff8fb] px-5 py-4 text-slate-700">
            <p>
              <strong>Mã đơn:</strong> {orderNumber}
            </p>
            {transactionNo ? (
              <p className="mt-2">
                <strong>Mã giao dịch:</strong> {transactionNo}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/account"
            className="rounded-full bg-[#ee4d8c] px-6 py-3 text-sm font-semibold text-white"
          >
            Xem đơn hàng
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[#f1d8de] bg-white px-6 py-3 text-sm font-semibold text-slate-700"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
