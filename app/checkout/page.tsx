"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";

import { type CartItem, clearCart, readCart } from "@/lib/cart";

type PaymentMethod = "cod" | "bank_transfer" | "vnpay";

type CheckoutFormState = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  createAccount: boolean;
  shipToOtherAddress: boolean;
  acceptedTerms: boolean;
};

type StoredAuthUser = {
  fullName?: string;
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  address?: string;
};

type OrderSnapshot = {
  orderNumber: string;
  customer: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
  };
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  status: string;
  items: Array<{
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  shippingFee: number;
  total: number;
  note: string;
  createdAt?: string;
};

const SHIPPING_THRESHOLD = 800_000;
const SHIPPING_FEE = 30_000;

const bankTransferInfo = {
  bankName: "VCB Digibank",
  accountNumber: "1037450947",
  accountHolder: "Mykingdom",
};

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")} đ`;
}

function createOrderNumber() {
  return `KYO-${Date.now()}`;
}

function readStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem("kyo-auth-user");

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as StoredAuthUser;
  } catch {
    return null;
  }
}

function BankTransferQr({
  orderNumber,
  amount,
}: {
  orderNumber: string;
  amount: number;
}) {
  const transferNote = orderNumber.replace(/\s+/g, "");
  const lines = [
    "1110011001",
    "0011110010",
    "1110011001",
    "0011110010",
    "1100110110",
    "0011001111",
    "1100110110",
    "0011001111",
  ];

  return (
    <div className="flex flex-col items-center gap-3 rounded-[24px] border border-[#efd8df] bg-white p-4 text-center">
      <svg viewBox="0 0 140 140" className="h-36 w-36 rounded-2xl bg-white p-2 shadow-sm">
        <rect x="0" y="0" width="140" height="140" rx="18" fill="#ffffff" />
        {lines.map((line, rowIndex) =>
          line.split("").map((cell, cellIndex) =>
            cell === "1" ? (
              <rect
                key={`${rowIndex}-${cellIndex}`}
                x={12 + cellIndex * 14}
                y={12 + rowIndex * 14}
                width="10"
                height="10"
                rx="2"
                fill="#1f1729"
              />
            ) : null,
          ),
        )}
        <rect x="12" y="12" width="32" height="32" rx="6" fill="none" stroke="#ee4d8c" strokeWidth="4" />
        <rect x="96" y="12" width="32" height="32" rx="6" fill="none" stroke="#ee4d8c" strokeWidth="4" />
        <rect x="12" y="96" width="32" height="32" rx="6" fill="none" stroke="#ee4d8c" strokeWidth="4" />
      </svg>
      <div className="space-y-1 text-sm text-[#5b4f57]">
        <p className="font-semibold text-[#1f1729]">QR chuyển khoản mẫu</p>
        <p>Nội dung: {transferNote}</p>
        <p>Số tiền: {formatPrice(amount)}</p>
      </div>
    </div>
  );
}

function EmptyCartState() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[32px] border border-[#f0d7df] bg-white px-8 py-16 text-center shadow-[0_18px_48px_rgba(232,77,140,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ee4d8c]">
          Giỏ hàng
        </p>
        <h1 className="mt-4 text-[2.3rem] font-semibold text-[#16111d]">
          Giỏ hàng của bạn đang trống
        </h1>
        <p className="mt-4 text-[1.05rem] leading-8 text-[#5e5360]">
          Hãy quay về cửa hàng và thêm sản phẩm trước khi thanh toán.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#ee2f78] px-8 text-[1rem] font-semibold text-white transition hover:bg-[#d92468]"
        >
          Đi đến cửa hàng
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [form, setForm] = useState<CheckoutFormState>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    note: "",
    createAccount: false,
    shipToOtherAddress: false,
    acceptedTerms: false,
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [errorMessage, setErrorMessage] = useState("");
  const [successOrder, setSuccessOrder] = useState<OrderSnapshot | null>(null);
  const [orderSeed, setOrderSeed] = useState(() => createOrderNumber());
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const syncCart = () => {
      setCartItems(readCart());
    };

    const storedUser = readStoredUser();

    if (storedUser) {
      setForm((current) => ({
        ...current,
        fullName: storedUser.fullName || storedUser.name || current.fullName,
        phone: storedUser.phone || current.phone,
        email: storedUser.email || current.email,
        address: storedUser.address || current.address,
      }));
    }

    syncCart();
    setHydrated(true);
    window.addEventListener("cart-updated", syncCart as EventListener);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener("cart-updated", syncCart as EventListener);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      return total + (Number(item.price) || 0) * Math.max(1, Number(item.quantity) || 1);
    }, 0);
  }, [cartItems]);

  const shippingFee = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;

  const paymentMethodLabel = useMemo(() => {
    switch (paymentMethod) {
      case "bank_transfer":
        return "Chuyển khoản ngân hàng";
      case "vnpay":
        return "VNPAY";
      default:
        return "Nhận hàng - trả tiền (COD)";
    }
  }, [paymentMethod]);

  const transferNote = `${orderSeed}`.replace(/\s+/g, "");

  function updateField<K extends keyof CheckoutFormState>(key: K, value: CheckoutFormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function validateForm() {
    if (cartItems.length === 0) {
      return "Giỏ hàng đang trống.";
    }

    if (!form.fullName.trim()) {
      return "Vui lòng nhập họ và tên.";
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      return "Số điện thoại phải đúng 10 số.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return "Email không hợp lệ.";
    }

    if (!form.address.trim()) {
      return "Vui lòng nhập địa chỉ.";
    }

    if (!form.acceptedTerms) {
      return "Bạn cần đồng ý điều khoản trước khi đặt hàng.";
    }

    return "";
  }

  function buildOrderPayload(): OrderSnapshot {
    return {
      orderNumber: orderSeed,
      customer: {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
      },
      paymentMethod,
      paymentStatus: paymentMethod === "bank_transfer" ? "pending" : paymentMethod === "vnpay" ? "pending" : "unpaid",
      status: paymentMethod === "bank_transfer" || paymentMethod === "vnpay" ? "Chờ thanh toán" : "Chờ xác nhận",
      items: cartItems.map((item) => ({
        id: String(item.id || item.slug || item.name || item.title || crypto.randomUUID()),
        name: String(item.name || item.title || "Sản phẩm"),
        image: String(item.image || ""),
        price: Number(item.price) || 0,
        quantity: Math.max(1, Number(item.quantity) || 1),
      })),
      subtotal,
      shippingFee,
      total,
      note: form.note.trim(),
      createdAt: new Date().toISOString(),
    };
  }

  async function handlePlaceOrder() {
    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage("");

    startTransition(async () => {
      try {
        const order = buildOrderPayload();

        if (paymentMethod === "vnpay") {
          const response = await fetch("/api/payments/vnpay/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ order }),
          });

          const result = await response.json().catch(() => ({}));

          if (!response.ok || !result.paymentUrl) {
            throw new Error(result.error || "Không tạo được liên kết VNPAY.");
          }

          window.location.assign(result.paymentUrl);
          return;
        }

        const response = await fetch("/api/checkout/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ order }),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result.error || "Không lưu được đơn hàng.");
        }

        clearCart();
        setCartItems([]);
        setSuccessOrder(result.order as OrderSnapshot);
        setOrderSeed(createOrderNumber());
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Không thể xử lý thanh toán lúc này.",
        );
      }
    });
  }

  if (!successOrder && cartItems.length === 0) {
    if (!hydrated) {
      return null;
    }

    return <EmptyCartState />;
  }

  if (successOrder) {
    return (
      <div className="bg-[#fff7fa]">
        <section className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-[#f0d7df] bg-white p-8 shadow-[0_18px_48px_rgba(232,77,140,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ee4d8c]">
              Thanh toán thành công
            </p>
            <h1 className="mt-4 text-[2.2rem] font-semibold text-[#16111d]">
              Đơn hàng {successOrder.orderNumber} đã được tạo
            </h1>
            <p className="mt-4 max-w-[780px] text-[1.02rem] leading-8 text-[#5e5360]">
              Phương thức thanh toán: {successOrder.paymentMethod === "bank_transfer"
                ? "Chuyển khoản ngân hàng"
                : "Nhận hàng - trả tiền (COD)"}.
              {successOrder.paymentMethod === "bank_transfer"
                ? " Vui lòng chuyển khoản đúng nội dung để admin xác nhận nhanh hơn."
                : " Đơn hàng sẽ được xác nhận trong thời gian sớm nhất."}
            </p>

            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="rounded-[28px] border border-[#f1d8de] bg-[#fffafc] p-6">
                <h2 className="text-[1.5rem] font-semibold text-[#16111d]">
                  Thông tin đơn hàng
                </h2>
                <div className="mt-5 space-y-3 text-[1rem] leading-8 text-[#342a35]">
                  <p><span className="font-semibold">Khách hàng:</span> {successOrder.customer.fullName}</p>
                  <p><span className="font-semibold">Số điện thoại:</span> {successOrder.customer.phone}</p>
                  <p><span className="font-semibold">Email:</span> {successOrder.customer.email}</p>
                  <p><span className="font-semibold">Địa chỉ:</span> {successOrder.customer.address}</p>
                  <p><span className="font-semibold">Tổng tiền:</span> {formatPrice(successOrder.total)}</p>
                </div>

                <div className="mt-6 space-y-4">
                  {successOrder.items.map((item) => (
                    <div
                      key={`${item.id}-${item.name}`}
                      className="flex items-center gap-4 rounded-[22px] border border-[#f1d8de] bg-white p-4"
                    >
                      <div className="h-20 w-20 overflow-hidden rounded-2xl bg-[#fff3f7]">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[1rem] font-semibold leading-7 text-[#16111d]">
                          {item.name}
                        </p>
                        <p className="text-[0.95rem] text-[#5e5360]">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <p className="text-[1.05rem] font-bold text-[#ee2f78]">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {successOrder.paymentMethod === "bank_transfer" ? (
                <div className="rounded-[28px] border border-[#f1d8de] bg-[#fffafc] p-6">
                  <h2 className="text-[1.35rem] font-semibold text-[#16111d]">
                    Thông tin chuyển khoản
                  </h2>
                  <div className="mt-5 space-y-2 text-[0.98rem] leading-8 text-[#342a35]">
                    <p><span className="font-semibold">Ngân hàng:</span> {bankTransferInfo.bankName}</p>
                    <p><span className="font-semibold">Số tài khoản:</span> {bankTransferInfo.accountNumber}</p>
                    <p><span className="font-semibold">Chủ tài khoản:</span> {bankTransferInfo.accountHolder}</p>
                    <p><span className="font-semibold">Nội dung:</span> {successOrder.orderNumber}</p>
                  </div>
                  <div className="mt-5">
                    <BankTransferQr orderNumber={successOrder.orderNumber} amount={successOrder.total} />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/account"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#ee2f78] px-8 text-[1rem] font-semibold text-white transition hover:bg-[#d92468]"
              >
                Xem đơn hàng
              </Link>
              <Link
                href="/shop"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#f0ced8] bg-white px-8 text-[1rem] font-semibold text-[#16111d] transition hover:bg-[#fff3f7]"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-[#fff7fa]">
      <section className="mx-auto grid max-w-[1320px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_580px] lg:px-8">
        <div className="rounded-[30px] border border-[#f0d7df] bg-white p-8 shadow-[0_18px_48px_rgba(232,77,140,0.08)]">
          <h1 className="text-[2rem] font-semibold text-[#16111d]">Thông tin thanh toán</h1>
          <p className="mt-3 text-[0.98rem] leading-8 text-[#5e5360]">
            Thông tin đã được tự điền từ tài khoản đang đăng nhập. Bạn vẫn có thể sửa lại trước khi đặt hàng.
          </p>

          <div className="mt-8 grid gap-6">
            <label className="space-y-3">
              <span className="text-[1rem] font-semibold text-[#16111d]">Họ và tên *</span>
              <input
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                className="h-14 w-full rounded-[20px] border border-[#f0ced8] bg-[#fffafc] px-5 text-[1rem] text-[#16111d] outline-none transition focus:border-[#ee4d8c]"
              />
            </label>

            <label className="space-y-3">
              <span className="text-[1rem] font-semibold text-[#16111d]">Số điện thoại *</span>
              <input
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value.replace(/\D+/g, "").slice(0, 10))}
                className="h-14 w-full rounded-[20px] border border-[#f0ced8] bg-[#fffafc] px-5 text-[1rem] text-[#16111d] outline-none transition focus:border-[#ee4d8c]"
              />
            </label>

            <label className="space-y-3">
              <span className="text-[1rem] font-semibold text-[#16111d]">Địa chỉ email *</span>
              <input
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="h-14 w-full rounded-[20px] border border-[#f0ced8] bg-[#fffafc] px-5 text-[1rem] text-[#16111d] outline-none transition focus:border-[#ee4d8c]"
              />
            </label>

            <label className="space-y-3">
              <span className="text-[1rem] font-semibold text-[#16111d]">Địa chỉ *</span>
              <input
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
                placeholder="Địa chỉ"
                className="h-14 w-full rounded-[20px] border border-[#f0ced8] bg-[#fffafc] px-5 text-[1rem] text-[#16111d] outline-none transition placeholder:text-[#9d8f97] focus:border-[#ee4d8c]"
              />
            </label>

            <label className="space-y-3">
              <span className="text-[1rem] font-semibold text-[#16111d]">Ghi chú đơn hàng (tùy chọn)</span>
              <textarea
                value={form.note}
                onChange={(event) => updateField("note", event.target.value)}
                placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                className="min-h-[160px] w-full rounded-[24px] border border-[#f0ced8] bg-[#fffafc] px-5 py-4 text-[1rem] text-[#16111d] outline-none transition placeholder:text-[#9d8f97] focus:border-[#ee4d8c]"
              />
            </label>

            <label className="flex items-center gap-3 text-[1rem] text-[#342a35]">
              <input
                type="checkbox"
                checked={form.createAccount}
                onChange={(event) => updateField("createAccount", event.target.checked)}
                className="h-5 w-5 rounded border-[#d8b9c6] accent-[#ee4d8c]"
              />
              <span>Tạo tài khoản mới?</span>
            </label>

            <label className="flex items-center gap-3 text-[1rem] text-[#342a35]">
              <input
                type="checkbox"
                checked={form.shipToOtherAddress}
                onChange={(event) => updateField("shipToOtherAddress", event.target.checked)}
                className="h-5 w-5 rounded border-[#d8b9c6] accent-[#ee4d8c]"
              />
              <span>Giao hàng tới địa chỉ khác?</span>
            </label>
          </div>
        </div>

        <aside className="rounded-[30px] border border-[#f0d7df] bg-white p-8 shadow-[0_18px_48px_rgba(232,77,140,0.08)]">
          <h2 className="text-[1.9rem] font-semibold text-[#16111d]">Đơn hàng của bạn</h2>

          <div className="mt-6 space-y-4">
            {cartItems.map((item) => (
              <div key={String(item.id || item.slug || item.name || item.title)} className="flex gap-4 border-b border-[#f2e5ea] pb-4">
                <div className="h-24 w-24 overflow-hidden rounded-[18px] bg-[#fff5f8]">
                  {item.image ? (
                    <img src={String(item.image)} alt={String(item.name || item.title || "Sản phẩm")} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[1rem] font-semibold leading-8 text-[#16111d]">
                    {String(item.name || item.title || "Sản phẩm")}
                  </p>
                  <p className="text-[0.98rem] text-[#5e5360]">
                    x {Math.max(1, Number(item.quantity) || 1)}
                  </p>
                </div>
                <p className="text-[1.05rem] font-semibold text-[#16111d]">
                  {formatPrice((Number(item.price) || 0) * Math.max(1, Number(item.quantity) || 1))}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4 border-t border-[#f2e5ea] pt-6 text-[1rem]">
            <div className="flex items-center justify-between text-[#342a35]">
              <span>Tạm tính</span>
              <span className="font-semibold text-[#16111d]">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-[#342a35]">
              <span>Giao hàng</span>
              <span className="font-semibold text-[#16111d]">
                {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-[#f2e5ea] pt-4">
              <span className="text-[1.2rem] font-semibold text-[#16111d]">Tổng</span>
              <span className="text-[2rem] font-bold text-[#ee2f78]">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <label className="flex cursor-pointer items-start gap-4 rounded-[20px] border border-[#f0ced8] bg-[#fffafc] p-4">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
                className="mt-1 h-6 w-6 accent-[#ee4d8c]"
              />
              <span className="space-y-1">
                <span className="block text-[1.08rem] font-semibold text-[#16111d]">
                  Nhận hàng - trả tiền (COD)
                </span>
                <span className="block text-[0.98rem] leading-7 text-[#5e5360]">
                  Bạn sẽ thanh toán cho nhân viên giao hàng khi nhận hàng.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-4 rounded-[20px] border border-[#f0ced8] bg-[#fffafc] p-4">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "bank_transfer"}
                onChange={() => setPaymentMethod("bank_transfer")}
                className="mt-1 h-6 w-6 accent-[#ee4d8c]"
              />
              <span className="space-y-1">
                <span className="block text-[1.08rem] font-semibold text-[#16111d]">
                  Chuyển khoản ngân hàng
                </span>
                <span className="block text-[0.98rem] leading-7 text-[#5e5360]">
                  Đơn sẽ ở trạng thái chờ thanh toán cho tới khi admin xác nhận đã nhận tiền.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-4 rounded-[20px] border border-[#f0ced8] bg-[#fffafc] p-4">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "vnpay"}
                onChange={() => setPaymentMethod("vnpay")}
                className="mt-1 h-6 w-6 accent-[#ee4d8c]"
              />
              <span className="space-y-1">
                <span className="block text-[1.08rem] font-semibold text-[#16111d]">
                  VNPAY
                </span>
                <span className="block text-[0.98rem] leading-7 text-[#5e5360]">
                  Bạn sẽ được chuyển sang cổng thanh toán VNPAY để hoàn tất giao dịch.
                </span>
              </span>
            </label>
          </div>

          {paymentMethod === "bank_transfer" ? (
            <div className="mt-6 rounded-[26px] border border-[#f0ced8] bg-[#fff8fb] p-5">
              <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_180px] md:items-center">
                <div className="space-y-2 text-[0.98rem] leading-8 text-[#342a35]">
                  <p><span className="font-semibold">Ngân hàng:</span> {bankTransferInfo.bankName}</p>
                  <p><span className="font-semibold">Số tài khoản:</span> {bankTransferInfo.accountNumber}</p>
                  <p><span className="font-semibold">Chủ tài khoản:</span> {bankTransferInfo.accountHolder}</p>
                  <p><span className="font-semibold">Nội dung chuyển khoản:</span> {transferNote}</p>
                  <p><span className="font-semibold">Số tiền:</span> {formatPrice(total)}</p>
                </div>
              <img src="/images/z7674388369413_4934dacce748c1cc0fc9211e05c70cdb.jpg" alt="QR chuyển khoản" />

              </div>
            </div>
          ) : null}

          {paymentMethod === "vnpay" ? (
            <div className="mt-6 rounded-[22px] border border-[#dce7ff] bg-[#f6f9ff] p-5 text-[0.98rem] leading-8 text-[#29467a]">
              Sau khi bấm <span className="font-semibold">Thanh toán với VNPAY</span>, hệ thống sẽ tạo đơn hàng ở trạng thái chờ thanh toán và chuyển bạn sang cổng VNPAY.
            </div>
          ) : null}

          <label className="mt-6 flex items-start gap-3 text-[0.98rem] leading-7 text-[#342a35]">
            <input
              type="checkbox"
              checked={form.acceptedTerms}
              onChange={(event) => updateField("acceptedTerms", event.target.checked)}
              className="mt-1 h-5 w-5 rounded border-[#d8b9c6] accent-[#ee4d8c]"
            />
            <span>Tôi đã đọc và đồng ý với điều khoản và điều kiện của website.</span>
          </label>

          {errorMessage ? (
            <div className="mt-5 rounded-[18px] border border-[#f4b7c9] bg-[#fff3f7] px-4 py-3 text-[0.95rem] font-medium text-[#cb2f6d]">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isPending}
            className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-full bg-[#ee2f78] px-8 text-[1.05rem] font-semibold text-white transition hover:bg-[#d92468] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending
              ? "Đang xử lý..."
              : paymentMethod === "vnpay"
                ? "Thanh toán với VNPAY"
                : paymentMethod === "bank_transfer"
                  ? "Tạo đơn chờ chuyển khoản"
                  : `Đặt hàng bằng ${paymentMethodLabel}`}
          </button>
        </aside>
      </section>
    </div>
  );
}
