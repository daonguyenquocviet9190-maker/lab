"use client";

import * as React from "react";
import { repairVietnameseText } from "@/lib/repairVietnameseText";

function useRepairMojibakeText() {
  React.useEffect(() => {
    function repairPageText() {
      const controls = Array.from(
        document.querySelectorAll("input, textarea"),
      ) as Array<HTMLInputElement | HTMLTextAreaElement>;

      controls.forEach((control) => {
        const nextValue = repairVietnameseText(control.value);
        const nextPlaceholder = repairVietnameseText(control.placeholder);

        control.style.color = "#0f172a";
        control.style.webkitTextFillColor = "#0f172a";
        control.style.opacity = "1";

        if (nextValue !== control.value) {
          control.value = nextValue;
        }

        if (nextPlaceholder !== control.placeholder) {
          control.placeholder = nextPlaceholder;
        }
      });

      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
      );
      const textNodes: Text[] = [];
      let currentNode = walker.nextNode();

      while (currentNode) {
        if (
          currentNode.nodeValue &&
          currentNode.parentElement &&
          !["SCRIPT", "STYLE"].includes(currentNode.parentElement.tagName)
        ) {
          textNodes.push(currentNode as Text);
        }
        currentNode = walker.nextNode();
      }

      textNodes.forEach((node) => {
        const raw = node.nodeValue ?? "";
        const fixed = repairVietnameseText(raw);

        if (fixed !== raw) {
          node.nodeValue = fixed;
        }
      });
    }

    repairPageText();

    const observer = new MutationObserver(() => {
      repairPageText();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    const timer = window.setInterval(() => {
      repairPageText();
    }, 400);

    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, []);
}

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Role = "admin" | "user";
type SessionUser = {
  id: string;
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: Role;
};

type OrderItem = {
  id?: string | number;
  name: string;
  image?: string;
  price?: number;
  quantity?: number;
  priceText?: string;
};

type Order = {
  id: string;
  orderNumber?: string;
  createdAt?: string;
  total?: number;
  status?: string;
  paymentMethod?: string;
  customer?: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items?: OrderItem[];
};

const AUTH_KEY = "kyo-auth-user";
const orderStatuses = ["all", "Chờ xác nhận", "Đang xử lý", "Đang giao", "Thành công", "Đã hủy"] as const;

function money(value?: number) {
  return `${(value || 0).toLocaleString("vi-VN")} đ`;
}

function when(value?: string) {
  if (!value) return "Chưa rõ";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("vi-VN");
}

function statusClasses(status?: string) {
  const normalized = (status || "").toLowerCase();
  if (normalized.includes("hủy")) return "bg-[#fff1f2] text-[#dc2626]";
  if (normalized.includes("giao")) return "bg-[#eff6ff] text-[#2563eb]";
  if (normalized.includes("xử")) return "bg-[#fff7ed] text-[#ea580c]";
  if (normalized.includes("thành")) return "bg-[#ecfdf3] text-[#15803d]";
  return "bg-[#f8fafc] text-slate-600";
}

function progressSteps(status?: string) {
  const normalized = (status || "").toLowerCase();
  if (normalized.includes("hủy")) {
    return [
      { label: "Chờ xác nhận", active: true },
      { label: "Đã hủy", active: true, danger: true },
    ];
  }

  const currentIndex = normalized.includes("thành")
    ? 3
    : normalized.includes("giao")
      ? 2
      : normalized.includes("xử")
        ? 1
        : 0;

  return [
    { label: "Chờ xác nhận", active: currentIndex >= 0 },
    { label: "Đang xử lý", active: currentIndex >= 1 },
    { label: "Đang giao", active: currentIndex >= 2 },
    { label: "Thành công", active: currentIndex >= 3 },
  ];
}

async function getJson(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

async function sendJson(url: string, method: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || `Request failed: ${response.status}`);
  return data;
}

function useAccountFieldPaint() {
  React.useEffect(() => {
    const controls = Array.from(
      document.querySelectorAll("input, textarea"),
    ) as Array<HTMLInputElement | HTMLTextAreaElement>;

    controls.forEach((control) => {
      control.style.color = "#0f172a";
      control.style.webkitTextFillColor = "#0f172a";
      control.style.opacity = "1";
      control.style.fontWeight = "500";
      control.style.caretColor = "#0f172a";
    });

    const style = document.createElement("style");
    style.textContent = `
      input::placeholder,
      textarea::placeholder {
        color: #9ca3af !important;
        -webkit-text-fill-color: #9ca3af !important;
        opacity: 1 !important;
      }

      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      textarea:-webkit-autofill,
      textarea:-webkit-autofill:hover,
      textarea:-webkit-autofill:focus {
        -webkit-text-fill-color: #0f172a !important;
        box-shadow: 0 0 0 1000px #ffffff inset !important;
        transition: background-color 9999s ease-out 0s;
      }
    `;
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);

  return null;
}

export default function AccountPage() {
  useRepairMojibakeText();
  useAccountFieldPaint();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<(typeof orderStatuses)[number]>("all");
  const [profile, setProfile] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  async function loadOrders(user: SessionUser) {
    const orderData = await getJson("/api/admin/orders");
    const allOrders = (Array.isArray(orderData)
      ? orderData
      : Array.isArray(orderData?.orders)
        ? orderData.orders
        : Array.isArray(orderData?.items)
          ? orderData.items
          : []) as Order[];

    const email = (user.email || "").trim().toLowerCase();
    const filtered = allOrders.filter(
      (order) => (order.customer?.email || "").trim().toLowerCase() === email,
    );

    filtered.sort(
      (a, b) =>
        new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime(),
    );

    setOrders(filtered);
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(AUTH_KEY);
    if (!raw) {
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(raw) as SessionUser;
      setSessionUser(user);
      setProfile({
        fullName: user.fullName || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
      });
      void loadOrders(user).finally(() => setLoading(false));
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!success) return;
    const timeout = window.setTimeout(() => setSuccess(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [success]);

  const visibleOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  async function saveProfile() {
    if (!sessionUser) return;

    setSaving(true);
    setError("");

    try {
      const data = await sendJson("/api/account/profile", "PATCH", {
        id: sessionUser.id,
        ...profile,
      });

      const nextUser = {
        ...sessionUser,
        ...data.user,
      };

      setSessionUser(nextUser);
      setProfile((current) => ({ ...current, password: "" }));
      window.localStorage.setItem(AUTH_KEY, JSON.stringify(nextUser));
      window.dispatchEvent(new Event("auth-updated"));
      setSuccess("Đã cập nhật hồ sơ.");
      await loadOrders(nextUser);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không lưu được hồ sơ.");
    } finally {
      setSaving(false);
    }
  }

  async function cancelOrder(order: Order) {
    if (!window.confirm(`Hủy đơn "${order.orderNumber || order.id}"?`)) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await sendJson(`/api/admin/orders/${order.id}`, "PATCH", { status: "Đã hủy" });
      setSuccess("Đã hủy đơn hàng.");
      if (sessionUser) {
        await loadOrders(sessionUser);
      }
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "Không hủy được đơn.");
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(AUTH_KEY);
    window.dispatchEvent(new Event("auth-updated"));
    window.location.href = "/auth/login";
  }

  if (!loading && !sessionUser) {
    return (
      <div className="min-h-screen bg-[#fff7fa] px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-[#f3d6df] bg-white p-10 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ee4d8c]">
            Account
          </p>
          <h1 className="mt-3 text-[2.2rem] font-semibold text-slate-900">
            Bạn chưa đăng nhập
          </h1>
          <p className="mt-4 text-[1.05rem] leading-8 text-slate-600">
            Hãy đăng nhập để xem hồ sơ cá nhân và theo dõi trạng thái đơn hàng.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/auth/login"
              className="rounded-2xl bg-[#ee4d8c] px-6 py-3 text-sm font-semibold text-white"
            >
              Đăng nhập
            </Link>
            <Link
              href="/"
              className="rounded-2xl border border-[#f3d6df] px-6 py-3 text-sm font-semibold text-slate-700"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff7fa] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px] space-y-7">
        {error ? (
          <div className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-5 py-4 text-sm font-medium text-[#be123c]">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] px-5 py-4 text-sm font-medium text-[#15803d]">
            {success}
          </div>
        ) : null}

        <section className="rounded-[32px] border border-[#f0d9e2] bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ee4d8c]">
                Account
              </p>
              <h1 className="mt-3 text-[2.35rem] font-semibold text-slate-900">
                {sessionUser?.fullName || sessionUser?.username}
              </h1>
              <p className="mt-3 text-[1.08rem] leading-8 text-slate-600">
                Quản lý thông tin cá nhân và đơn hàng của bạn.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-2xl border border-[#f0d9e2] px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Về trang chủ
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-2xl bg-[#ee4d8c] px-5 py-3 text-sm font-semibold text-white"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-7 xl:grid-cols-[0.92fr_1.08fr]">
          <section className="rounded-[32px] border border-[#f0d9e2] bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <h2 className="text-[2rem] font-semibold text-slate-900">Thông tin tài khoản</h2>
            <div className="mt-6 space-y-4">
              {[
                { key: "fullName", label: "Họ và tên" },
                { key: "username", label: "Tài khoản" },
                { key: "email", label: "Email" },
                { key: "phone", label: "Số điện thoại" },
              ].map((field) => (
                <div key={field.key}>
                  <p className="mb-2 text-sm font-semibold text-slate-500">{field.label}</p>
                  <input
                    value={profile[field.key as keyof typeof profile]}
                    onChange={(event) =>
                      setProfile((current) => ({
                        ...current,
                        [field.key]: event.target.value,
                      }))
                    }
                    className="h-14 w-full rounded-2xl border border-[#f0d9e2] bg-[#fff9fb] px-5 text-[1rem] outline-none transition focus:border-[#ee4d8c]"
                  />
                </div>
              ))}
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-500">
                  Mật khẩu mới
                </p>
                <input
                  type="password"
                  value={profile.password}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Để trống nếu không muốn đổi"
                  className="h-14 w-full rounded-2xl border border-[#f0d9e2] bg-[#fff9fb] px-5 text-[1rem] outline-none transition placeholder:text-slate-400 focus:border-[#ee4d8c]"
                />
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving}
                  className="inline-flex h-12 min-w-[180px] items-center justify-center rounded-2xl bg-[#ee4d8c] px-6 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Lưu hồ sơ
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-[#f0d9e2] bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-[2rem] font-semibold text-slate-900">Đơn hàng của bạn</h2>
              <span className="rounded-full bg-[#fff2f7] px-4 py-2 text-sm font-semibold text-[#ee4d8c]">
                {orders.length} đơn
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {orderStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    statusFilter === status
                      ? "bg-[#ee4d8c] text-white"
                      : "bg-[#fff7fa] text-slate-600"
                  }`}
                >
                  {status === "all" ? "Tất cả" : status}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-5">
              {visibleOrders.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-[#f2c7d5] bg-[#fff9fb] px-6 py-8 text-sm text-slate-500">
                  Chưa có đơn hàng nào khớp bộ lọc hiện tại.
                </div>
              ) : (
                visibleOrders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-[28px] border border-[#f0d9e2] bg-[#fffdfd] p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-[1.35rem] font-semibold text-slate-900">
                          {order.orderNumber || order.id}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-slate-500">
                          Ngày tạo: {when(order.createdAt)}
                        </p>
                        <p className="text-sm leading-7 text-slate-500">
                          Thanh toán: {order.paymentMethod || "COD"}
                        </p>
                        <p className="text-sm leading-7 text-slate-500">
                          Giao tới: {order.customer?.address || "Chưa có địa chỉ"}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <span
                          className={`rounded-full px-4 py-2 text-sm font-semibold ${statusClasses(order.status)}`}
                        >
                          {order.status || "Chờ xác nhận"}
                        </span>
                        <span className="text-[1.35rem] font-semibold text-[#ee4d8c]">
                          {money(order.total)}
                        </span>
                        {order.status !== "Đã hủy" && order.status !== "Thành công" ? (
                          <button
                            type="button"
                            onClick={() => cancelOrder(order)}
                            className="rounded-2xl border border-[#fecaca] px-4 py-2 text-sm font-semibold text-[#dc2626]"
                          >
                            Hủy đơn
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      {progressSteps(order.status).map((step, index) => (
                        <div key={`${order.id}-${step.label}`} className="flex items-center gap-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                              step.danger
                                ? "bg-[#fff1f2] text-[#dc2626]"
                                : step.active
                                  ? "bg-[#ecfdf3] text-[#15803d]"
                                  : "bg-[#f8fafc] text-slate-400"
                            }`}
                          >
                            {step.label}
                          </span>
                          {index < progressSteps(order.status).length - 1 ? (
                            <span className="h-px w-6 bg-[#e8d5de]" />
                          ) : null}
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 grid gap-4">
                      {order.items?.map((item, index) => (
                        <div
                          key={`${order.id}-${item.id ?? index}`}
                          className="grid gap-4 rounded-[24px] border border-[#f3e3e9] bg-white p-4 md:grid-cols-[80px_minmax(0,1fr)_auto]"
                        >
                          <div className="h-20 w-20 overflow-hidden rounded-2xl bg-[#fff7fa]">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400">
                                My
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-[1.04rem] font-semibold leading-7 text-slate-900">
                              {item.name}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              Số lượng: {item.quantity ?? 1}
                            </p>
                          </div>
                          <div className="text-right text-[1rem] font-semibold text-[#ee4d8c]">
                            {item.price ? money(item.price) : item.priceText || "-"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
