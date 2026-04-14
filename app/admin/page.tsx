"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Role = "admin" | "user" | string;
type SessionUser = { id: string; fullName?: string; username?: string; email?: string; role?: Role };
type Stats = { totalProducts: number; totalOrders: number; totalUsers: number; revenue: number };
type Product = {
  id: number | string;
  resource?: string;
  name: string;
  brand?: string;
  price: number;
  oldPrice?: number;
  image?: string;
  categories?: string[];
  origin?: string;
  sectionLabel?: string;
  stockStatus?: string;
  stock?: number;
};
type Category = { name: string; count: number };
type Brand = { name: string; count?: number };
type Origin = { name: string; count?: number };
type Review = {
  id: string;
  productKey?: string;
  productName?: string;
  authorName?: string;
  authorEmail?: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
};
type Order = {
  id: string;
  orderNumber?: string;
  createdAt?: string;
  total?: number;
  status?: string;
  paymentMethod?: string;
  customer?: { fullName?: string; email?: string; phone?: string; address?: string };
  items?: Array<{ name: string; quantity?: number; price?: number; image?: string }>;
};
type User = {
  id: string;
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: Role;
  createdAt?: string;
};
type Settings = {
  storeName: string;
  supportEmail: string;
  hotline: string;
  freeShippingThreshold: number;
  adminNotice: string;
};

const AUTH_KEY = "kyo-auth-user";
const tabs = ["dashboard", "products", "categories", "brands", "origins", "reviews", "orders", "users", "settings"] as const;
type Tab = (typeof tabs)[number];
const orderStatuses = ["all", "Chờ xác nhận", "Đang xử lý", "Đang giao", "Thành công", "Đã hủy"] as const;
const categorySeed = ["Quà tặng", "Xe", "Lego"];
const brandSeed = [ "Không thương hiệu"];
const originSeed = ["không rõ"];
const categoryOptions = ["Quà tặng", "Xe", "Lego",] as const;
const brandOptions = [] as const;
const originOptions = [] as const;

const emptyProduct = {
  resource: "products",
  name: "",
  brand: "",
  price: "",
  oldPrice: "",
  image: "",
  categories: "",
  origin: "",
  sectionLabel: "",
  stockStatus: "in_stock",
  stock: "",
};

type ProductResource = "products" | "lipsticks" | "perfumes";

function toArray<T>(value: unknown, keys: string[] = []) {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    for (const key of keys) {
      const candidate = (value as Record<string, unknown>)[key];
      if (Array.isArray(candidate)) return candidate as T[];
    }
  }
  return [] as T[];
}

function money(value: number) {
  return `${(value || 0).toLocaleString("vi-VN")} đ`;
}

function when(value?: string) {
  if (!value) return "Chưa rõ";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("vi-VN");
}


function getValue(
  event: React.ChangeEvent<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >,
) {
  return event.currentTarget?.value ?? "";
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

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [productResourceFilter, setProductResourceFilter] = useState<"all" | ProductResource>("all");
  const [productSort, setProductSort] = useState<"latest" | "name_asc" | "price_desc" | "price_asc">("latest");
  const [orderStatusFilter, setOrderStatusFilter] = useState<(typeof orderStatuses)[number]>("all");
  const [orderSort, setOrderSort] = useState<"latest" | "total_desc" | "total_asc">("latest");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | Role>("all");
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalOrders: 0, totalUsers: 0, revenue: 0 });
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [origins, setOrigins] = useState<Origin[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [nowText, setNowText] = useState("");
  const [settings, setSettings] = useState<Settings>({
    storeName: "KYO Authentic",
    supportEmail: "kyoauthentic@gmail.com",
    hotline: "0975 436 989",
    freeShippingThreshold: 800000,
    adminNotice: "",
  });
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editingResource, setEditingResource] = useState<ProductResource | null>(null);
  const [editingCategory, setEditingCategory] = useState("");
  const [categoryDraft, setCategoryDraft] = useState("");
  const [editingBrand, setEditingBrand] = useState("");
  const [brandDraft, setBrandDraft] = useState("");
  const [brandNew, setBrandNew] = useState("");
  const [editingOrigin, setEditingOrigin] = useState("");
  const [originDraft, setOriginDraft] = useState("");
  const [originNew, setOriginNew] = useState("");
  const inputStyle = { color: "#0f172a", WebkitTextFillColor: "#0f172a", caretColor: "#0f172a" } as const;

  function updateProductForm<K extends keyof typeof emptyProduct>(
    key: K,
    value: (typeof emptyProduct)[K],
  ) {
    setProductForm((current) => ({ ...current, [key]: value }));
  }

  async function loadAll(showLoader = true) {
    if (showLoader) {
      setLoading(true);
    }
    setError("");
    try {
      const [catalogData, categoryData, brandData, originData, reviewData, orderData, userData, settingsData] = await Promise.all([
        getJson("/api/admin/catalog"),
        getJson("/api/admin/categories"),
        getJson("/api/admin/brands"),
        getJson("/api/admin/origins"),
        getJson("/api/reviews"),
        getJson("/api/admin/orders"),
        getJson("/api/admin/users"),
        getJson("/api/admin/settings"),
      ]);

      // 1. Lấy mảng products từ object catalogData mà API trả về
// catalogData lúc này là { products: [...], lipsticks: [], perfumes: [] }
const catalogItems = toArray<Product & { category?: string }>(catalogData, ["products"]);

// 2. Map dữ liệu và đảm bảo có đủ resource/categories
const nextProducts = catalogItems.map((item) => ({
  ...item,
  // Đảm bảo mỗi item đều có resource để hiển thị/lọc
  resource: item.resource ?? "products",
  // Chuyển đổi category (chuỗi) sang categories (mảng) nếu cần
  categories: Array.isArray(item.categories) 
    ? item.categories 
    : (item as any).category ? [(item as any).category] : [],
}));

// 3. Cập nhật state
setProducts(nextProducts);
      const nextCategories = toArray<Category>(categoryData, ["categories", "items", "data"]);
      const nextBrands = toArray<Brand>(brandData, ["brands", "items", "data"]).map((item) => ({
        name: (item as { name?: string }).name || (item as { label?: string }).label || "",
      })).filter((item) => item.name);
      const nextOrigins = toArray<Origin>(originData, ["origins", "items", "data"]).map((item) => ({
        name: (item as { name?: string }).name || (item as { label?: string }).label || "",
      })).filter((item) => item.name);
      const nextOrders = toArray<Order>(orderData, ["orders", "items", "data"]);
      const nextReviews = toArray<Review>(reviewData, ["reviews", "items", "data"]);
      const nextUsers: User[] = toArray<User>(userData, ["users", "items", "data"]).map((user) => ({
        ...user,
        role: (user.role === "admin" ? "admin" : "user") as Role,
      }));

      setProducts(nextProducts);
      setCategories(nextCategories);
      setBrands(nextBrands);
      setOrigins(nextOrigins);
      setOrders(nextOrders);
      setReviews(nextReviews);
      setUsers(nextUsers);
      
      setStats({
        totalProducts: nextProducts.length,
        totalOrders: nextOrders.length,
        totalUsers: nextUsers.length,
        revenue: nextOrders.reduce((sum, order) => {
          const canceled = (order.status || "").toLowerCase().includes("hủy");
          return canceled ? sum : sum + Number(order.total || 0);
        }, 0),
      });
      const nextSettings = settingsData as Partial<Settings>;
      setSettings((current) => ({
        ...current,
        ...nextSettings,
        freeShippingThreshold:
          typeof nextSettings.freeShippingThreshold === "number"
            ? nextSettings.freeShippingThreshold
            : current.freeShippingThreshold,
      }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không tải được dữ liệu admin.");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
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
      if (user.role === "admin") void loadAll();
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!sessionUser || sessionUser.role !== "admin" || tab !== "dashboard") {
      return;
    }

    const interval = window.setInterval(() => {
      void loadAll(false);
    }, 6000);

    return () => window.clearInterval(interval);
  }, [sessionUser, tab]);

  useEffect(() => {
    if (!success) return;
    const timeout = window.setTimeout(() => setSuccess(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [success]);

  useEffect(() => {
    const updateNow = () => setNowText(when(new Date().toISOString()));
    updateNow();
    const timer = window.setInterval(updateNow, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const visibleProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    let next = products;

    if (productResourceFilter !== "all") {
      next = next.filter((item) => (item.resource || "products") === productResourceFilter);
    }

    if (q) {
      next = next.filter((item) =>
        [item.name, item.brand, item.origin, item.sectionLabel, (item.categories || []).join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    const sorted = [...next];
    if (productSort === "name_asc") {
      sorted.sort((a, b) => (a.name || "").localeCompare(b.name || "", "vi"));
    } else if (productSort === "price_desc") {
      sorted.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (productSort === "price_asc") {
      sorted.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else {
      sorted.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
    }

    return sorted;
  }, [products, productResourceFilter, productSort, query]);

  const visibleOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    let next = orders;

    if (orderStatusFilter !== "all") {
      next = next.filter((order) => (order.status || "") === orderStatusFilter);
    }

    if (q) {
      next = next.filter((order) =>
        [
          order.orderNumber,
          order.status,
          order.customer?.fullName,
          order.customer?.email,
          order.customer?.phone,
          order.customer?.address,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    const sorted = [...next];
    if (orderSort === "total_desc") {
      sorted.sort((a, b) => Number(b.total || 0) - Number(a.total || 0));
    } else if (orderSort === "total_asc") {
      sorted.sort((a, b) => Number(a.total || 0) - Number(b.total || 0));
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime(),
      );
    }

    return sorted;
  }, [orders, orderSort, orderStatusFilter, query]);

  const visibleUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    let next = users;

    if (userRoleFilter !== "all") {
      next = next.filter((user) => (user.role || "user") === userRoleFilter);
    }

    if (q) {
      next = next.filter((user) =>
        [user.fullName, user.username, user.email, user.phone, user.role].join(" ").toLowerCase().includes(q),
      );
    }

    return next;
  }, [users, userRoleFilter, query]);

  const topSellingProducts = useMemo(() => {
    const soldMap = new Map<string, { name: string; quantity: number; revenue: number }>();

    orders.forEach((order) => {
      if ((order.status || "").toLowerCase().includes("hủy")) return;
      order.items?.forEach((item) => {
        const key = item.name || "Sản phẩm";
        const current = soldMap.get(key) || { name: key, quantity: 0, revenue: 0 };
        soldMap.set(key, {
          name: key,
          quantity: current.quantity + Number(item.quantity || 1),
          revenue: current.revenue + Number(item.price || 0) * Number(item.quantity || 1),
        });
      });
    });

    return [...soldMap.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  }, [orders]);

  const monthRevenue = useMemo(() => {
    const now = new Date();
    return orders.reduce((sum, order) => {
      if ((order.status || "").toLowerCase().includes("hủy")) return sum;
      const date = new Date(order.createdAt || "");
      if (Number.isNaN(date.getTime())) return sum;
      if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) return sum;
      return sum + Number(order.total || 0);
    }, 0);
  }, [orders]);

  const categoryOptions = (categories.length ? categories.map((item) => item.name) : categorySeed).filter(Boolean);
  const brandOptions = (brands.length ? brands.map((item) => item.name) : brandSeed).filter(Boolean);
  const originOptions = (origins.length ? origins.map((item) => item.name) : originSeed).filter(Boolean);

  function syncAuthUser(user: User) {
    if (!sessionUser || typeof window === "undefined" || sessionUser.id !== user.id) return;
    const merged = { ...sessionUser, ...user };
    setSessionUser(merged);
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(merged));
    window.dispatchEvent(new Event("auth-updated"));
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: productForm.name.trim(),
        brand: productForm.brand.trim(),
        price: Number(productForm.price),
        oldPrice: productForm.oldPrice ? Number(productForm.oldPrice) : 0,
        image: productForm.image.trim(),
        categories: productForm.categories.split(",").map((item) => item.trim()).filter(Boolean),
        origin: productForm.origin.trim(),
        sectionLabel: productForm.sectionLabel.trim(),
        stockStatus: productForm.stockStatus || "in_stock",
        stock: productForm.stock ? Number(productForm.stock) : undefined,
      };
      if (editingId) {
        await sendJson(
          `/api/admin/catalog/${editingResource || productForm.resource}/${editingId}`,
          "PATCH",
          payload,
        );
        setSuccess("Đã cập nhật sản phẩm.");
      } else {
        await sendJson("/api/admin/catalog", "POST", { ...payload, resource: productForm.resource });
        setSuccess("Đã thêm sản phẩm.");
      }
      setProductForm(emptyProduct);
      setEditingId(null);
      setEditingResource(null);
      await loadAll();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không lưu được sản phẩm.");
    } finally {
      setSaving(false);
    }
  }

  const handleImageFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh hợp lệ.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setProductForm((current) => ({ ...current, image: result }));
    };
    reader.readAsDataURL(file);
  };

  async function saveUser(user: User) {
    setSaving(true);
    setError("");
    try {
      const data = await sendJson(`/api/admin/users/${user.id}`, "PATCH", {
        fullName: user.fullName ?? "",
        username: user.username ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        password: user.password ?? "",
        role: user.role ?? "user",
      });
      syncAuthUser(data.user ?? user);
      setSuccess("Đã cập nhật tài khoản.");
      await loadAll();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không lưu được tài khoản.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(url: string, message: string, confirmText: string, body?: unknown) {
    if (!window.confirm(confirmText)) return;
    setSaving(true);
    setError("");
    try {
      await sendJson(url, "DELETE", body);
      setSuccess(message);
      await loadAll();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Không xóa được dữ liệu.");
    } finally {
      setSaving(false);
    }
  }
  async function saveSettings() {
    setSaving(true);
    setError("");
    try {
      await sendJson("/api/admin/settings", "PATCH", settings);
      setSuccess("Đã lưu cài đặt.");
      await loadAll();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không lưu được cài đặt.");
    } finally {
      setSaving(false);
    }
  }

  if (!loading && (!sessionUser || sessionUser.role !== "admin")) {
    return (
      <div className="min-h-screen bg-[#f3f6fb] px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-[#dbe4f0] bg-white p-10 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2563eb]">Admin Only</p>
          <h1 className="mt-3 text-[2.15rem] font-semibold text-slate-900">Bạn không có quyền vào trang quản trị</h1>
          <p className="mt-4 text-[1.05rem] leading-8 text-slate-600">
            Chỉ tài khoản có role <span className="font-semibold">admin</span> mới vào được dashboard này.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/auth/login" className="rounded-2xl bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white">
              Vào đăng nhập
            </Link>
            <Link href="/account" className="rounded-2xl border border-[#dbe4f0] px-6 py-3 text-sm font-semibold text-slate-700">
              Về account
            </Link>
            <Link href="/" className="rounded-2xl border border-[#dbe4f0] px-6 py-3 text-sm font-semibold text-slate-700">
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-900">
      <style jsx global>{`
        header,
        footer {
          display: none !important;
        }
        input,
        select,
        textarea {
          color: #0f172a !important;
          -webkit-text-fill-color: #0f172a !important;
          caret-color: #0f172a !important;
        }
        input::placeholder,
        textarea::placeholder {
          color: #94a3b8 !important;
          -webkit-text-fill-color: #94a3b8 !important;
        }
      `}</style>
      <div className="grid min-h-screen lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border-r border-[#dbe4f0] bg-white px-5 py-8">
          <p className="px-3 text-[2rem] font-semibold tracking-tight text-[#2563eb]">Fashion Admin</p>
          <nav className="mt-10 space-y-2">
            {tabs.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`block w-full rounded-2xl px-4 py-4 text-left text-[1.06rem] font-medium capitalize transition ${
                  tab === item ? "bg-[#eaf2ff] text-[#2563eb]" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item === "dashboard" ? "Bảng điều khiển" : item === "products" ? "Quản lý sản phẩm" : item === "categories" ? "Danh mục" : item === "brands" ? "Bình luận" : item === "orders" ? "Đơn hàng" : item === "users" ? "Khách hàng" : "Cài đặt"}
              </button>
            ))}
          </nav>
          <div className="mt-10 rounded-[24px] border border-[#e7eef8] bg-[#f7faff] p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2563eb]">Phiên admin</p>
            <p className="mt-3 text-[1.1rem] font-semibold text-slate-900">
              {sessionUser?.fullName || sessionUser?.username || sessionUser?.email}
            </p>
            <p className="mt-1 text-sm text-slate-500">{sessionUser?.email}</p>
            <span className="mt-4 inline-flex rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#15803d]">
              {sessionUser?.role}
            </span>
            <div className="mt-4">
              <Link
                href="/"
                className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#dbe4f0] bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Quay về trang chủ
              </Link>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="flex flex-col gap-4 border-b border-[#dbe4f0] bg-white px-5 py-5 sm:px-8 xl:flex-row xl:items-center xl:justify-between">
            <input
              value={query}
              onChange={(event) => setQuery(getValue(event))}
              placeholder="Tìm kiếm..."
              className="h-14 w-full max-w-[720px] rounded-2xl border border-[#dbe4f0] bg-[#f9fbff] px-5 text-[1.02rem] outline-none transition focus:border-[#2563eb] focus:bg-white"
            />
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white px-4 py-2 text-sm text-slate-500 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                {nowText || "Đang cập nhật..."}
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#f8d7da,#cbd5e1)] text-lg font-bold text-slate-800">
                {(sessionUser?.fullName || sessionUser?.username || "A").slice(0, 1).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="px-5 py-8 sm:px-8">
            {error ? <div className="mb-5 rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-5 py-4 text-sm font-medium text-[#be123c]">{error}</div> : null}
            {success ? <div className="mb-5 rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] px-5 py-4 text-sm font-medium text-[#15803d]">{success}</div> : null}
            {loading ? <div className="rounded-[30px] border border-[#dbe4f0] bg-white px-6 py-16 text-center text-[1.08rem] text-slate-500 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">Đang tải dashboard admin...</div> : null}

            {!loading && tab === "dashboard" ? (
              <section className="space-y-8">
                <div>
                  <h1 className="text-[2.35rem] font-semibold tracking-tight text-slate-900">Bảng điều khiển</h1>
                  <p className="mt-3 text-[1.08rem] leading-8 text-slate-600">Chào mừng trở lại. Đây là tổng quan nhanh về cửa hàng của bạn.</p>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Tổng sản phẩm", value: stats.totalProducts, accent: "bg-[#eef4ff] text-[#2563eb]" },
                    { label: "Đơn hàng mới", value: stats.totalOrders, accent: "bg-[#ecfdf3] text-[#16a34a]" },
                    { label: "Doanh thu", value: money(stats.revenue), accent: "bg-[#faf5ff] text-[#9333ea]" },
                    { label: "Khách hàng", value: stats.totalUsers, accent: "bg-[#fff7ed] text-[#ea580c]" },
                  ].map((card) => (
                    <div key={card.label} className="rounded-[28px] border border-[#dbe4f0] bg-white p-7 shadow-[0_14px_45px_rgba(15,23,42,0.05)]">
                      <div className={`inline-flex rounded-2xl px-4 py-3 text-sm font-semibold ${card.accent}`}>{card.label}</div>
                      <p className="mt-8 text-[2rem] font-semibold tracking-tight text-slate-900">{card.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.95fr]">
                  <div className="rounded-[30px] border border-[#dbe4f0] bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
                    <h2 className="text-[1.5rem] font-semibold text-slate-900">Đơn hàng gần đây</h2>
                    <div className="mt-5 space-y-4">
                      {orders.slice(0, 4).map((order) => (
                        <div key={order.id} className="rounded-[24px] border border-[#e7eef8] bg-[#fbfdff] px-5 py-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-[1.08rem] font-semibold text-slate-900">{order.orderNumber || order.id}</p>
                              <p className="mt-1 text-sm text-slate-500">{order.customer?.fullName || "Khách hàng"} • {when(order.createdAt)}</p>
                            </div>
                            <span className="rounded-full bg-[#e8f5ee] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#15803d]">
                              {order.status || "Thành công"}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                            <span>{order.customer?.email || "Không có email"}</span>
                            <span className="font-semibold text-[#111827]">{money(order.total || 0)}</span>
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 ? <p className="rounded-2xl bg-[#f8fbff] px-5 py-6 text-sm text-slate-500">Chưa có đơn hàng nào.</p> : null}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-[30px] border border-[#dbe4f0] bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
                      <h2 className="text-[1.4rem] font-semibold text-slate-900">Thống kê doanh thu</h2>
                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl bg-[#f8fbff] px-4 py-4">
                          <p className="text-sm text-slate-500">Doanh thu tháng này</p>
                          <p className="mt-2 text-[1.4rem] font-semibold text-[#2563eb]">{money(monthRevenue)}</p>
                        </div>
                        <div className="rounded-2xl bg-[#f8fbff] px-4 py-4">
                          <p className="text-sm text-slate-500">Doanh thu toàn bộ</p>
                          <p className="mt-2 text-[1.4rem] font-semibold text-[#9333ea]">{money(stats.revenue)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[30px] border border-[#dbe4f0] bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
                      <h2 className="text-[1.4rem] font-semibold text-slate-900">Danh mục nổi bật</h2>
                      <div className="mt-5 space-y-3">
                        {categories.slice(0, 5).map((category) => (
                          <div key={category.name} className="flex items-center justify-between rounded-2xl bg-[#f8fbff] px-4 py-4">
                            <span className="font-medium text-slate-800">{category.name}</span>
                            <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#2563eb] shadow-sm">{category.count}</span>
                          </div>
                        ))}
                        {categories.length === 0 ? <p className="rounded-2xl bg-[#f8fbff] px-5 py-6 text-sm text-slate-500">Chưa có dữ liệu danh mục.</p> : null}
                      </div>
                    </div>

                    <div className="rounded-[30px] border border-[#dbe4f0] bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
                      <h2 className="text-[1.4rem] font-semibold text-slate-900">Top bán chạy</h2>
                      <div className="mt-5 space-y-3">
                        {topSellingProducts.map((item, index) => (
                          <div key={item.name} className="flex items-center justify-between rounded-2xl bg-[#f8fbff] px-4 py-4">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {index + 1}. {item.name}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">Đã bán {item.quantity} sản phẩm</p>
                            </div>
                            <span className="text-sm font-semibold text-[#2563eb]">{money(item.revenue)}</span>
                          </div>
                        ))}
                        {topSellingProducts.length === 0 ? <p className="rounded-2xl bg-[#f8fbff] px-5 py-6 text-sm text-slate-500">Chưa có dữ liệu bán hàng.</p> : null}
                      </div>
                    </div>

                   
                  </div>
                </div>
              </section>
            ) : null}

            {!loading && tab === "products" ? (
              <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
                <form onSubmit={saveProduct} className="admin-product-form rounded-[30px] border border-[#dbe4f0] bg-white p-6 text-slate-900 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
                  <h1 className="text-[1.5rem] font-semibold text-slate-900">{editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}</h1>
                  <div className="mt-5 space-y-4">
                    <select value={productForm.resource} disabled={Boolean(editingId)} onChange={(event) => updateProductForm("resource", event.currentTarget.value as typeof emptyProduct.resource)} className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none focus:border-[#2563eb] ${editingId ? "cursor-not-allowed border-[#e5e7eb] bg-[#f8fafc] text-slate-400" : "border-[#dbe4f0]"}`}>
                      <option value="products">Quà tặng</option>
                      <option value="lipsticks">Lego</option>
                      <option value="perfumes">Xe</option>
                    </select>
                    {[
                      ["name", "Tên sản phẩm"],
                      ["price", "Giá bán"],
                      ["oldPrice", "Giá cũ"],
                      // ["sectionLabel", "Nhãn section"],
                      ["stock", "Số lượng tồn kho"],
                    ].map(([key, label]) => (
                      <input
                        key={key}
                        value={productForm[key as keyof typeof productForm]}
                        onChange={(event) => updateProductForm(key as keyof typeof emptyProduct, event.currentTarget.value)}
                        placeholder={label}
                        className="h-12 w-full rounded-2xl border border-[#dbe4f0] px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2563eb]"
                      />
                    ))}
                    <select
                      value={productForm.categories}
                      onChange={(event) => updateProductForm("categories", event.currentTarget.value)}
                      className="h-12 w-full rounded-2xl border border-[#dbe4f0] px-4 text-sm outline-none focus:border-[#2563eb]"
                    >
                      <option value="">Chọn danh mục</option>
                      {categoryOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <select
                      value={productForm.brand}
                      onChange={(event) => updateProductForm("brand", event.currentTarget.value)}
                      className="h-12 w-full rounded-2xl border border-[#dbe4f0] px-4 text-sm outline-none focus:border-[#2563eb]"
                    >
                      {/* <option value="">Chọn thương hiệu</option> */}
                      {/* {brandOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))} */}
                    </select>
                    <select
                      value={productForm.origin}
                      onChange={(event) => updateProductForm("origin", event.currentTarget.value)}
                      className="h-12 w-full rounded-2xl border border-[#dbe4f0] px-4 text-sm outline-none focus:border-[#2563eb]"
                    >
                      {/* <option value="">Chọn xuất xứ</option> */}
                      {/* {originOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))} */}
                    </select>
                    <div className="space-y-3">
                      <input
                        value={productForm.image}
                        onChange={(event) => updateProductForm("image", event.currentTarget.value)}
                        placeholder="Ảnh sản phẩm (URL)"
                        className="h-12 w-full rounded-2xl border border-[#dbe4f0] px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2563eb]"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFile}
                        className="h-12 w-full rounded-2xl border border-[#dbe4f0] bg-white px-4 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-[#eef2ff] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#2563eb]"
                      />
                      {productForm.image ? (
                        <div className="flex items-center gap-3">
                          <div className="h-16 w-16 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white">
                            <img src={productForm.image} alt="preview" className="h-full w-full object-cover" />
                          </div>
                          <button
                            type="button"
                            onClick={() => updateProductForm("image", "")}
                            className="h-10 rounded-2xl border border-[#dbe4f0] px-4 text-sm font-semibold text-slate-700"
                          >
                            Xóa ảnh
                          </button>
                        </div>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => updateProductForm("stockStatus", "in_stock")}
                        className={`h-12 rounded-2xl border text-sm font-semibold transition ${
                          productForm.stockStatus === "in_stock"
                            ? "border-[#16a34a] bg-[#ecfdf3] text-[#15803d]"
                            : "border-[#dbe4f0] bg-white text-slate-700"
                        }`}
                      >
                        Còn hàng
                      </button>
                      <button
                        type="button"
                        onClick={() => updateProductForm("stockStatus", "out_of_stock")}
                        className={`h-12 rounded-2xl border text-sm font-semibold transition ${
                          productForm.stockStatus === "out_of_stock"
                            ? "border-[#dc2626] bg-[#fff1f2] text-[#dc2626]"
                            : "border-[#dbe4f0] bg-white text-slate-700"
                        }`}
                      >
                        Hết hàng
                      </button>
                    </div>
                  </div>
                  <div className="mt-5 flex gap-3">
                    <button type="submit" disabled={saving} className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-[#2563eb] px-5 text-sm font-semibold text-white disabled:opacity-60">
                      {editingId ? "Lưu thay đổi" : "Thêm sản phẩm"}
                    </button>
                    <button type="button" onClick={() => { setProductForm(emptyProduct); setEditingId(null); setEditingResource(null); }} className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#dbe4f0] px-5 text-sm font-semibold text-slate-700">
                      Reset
                    </button>
                  </div>
                </form>

                <div className="rounded-[30px] border border-[#dbe4f0] bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-[1.45rem] font-semibold text-slate-900">Danh sách sản phẩm</h2>
                      <div className="mt-3 flex flex-wrap gap-3">
                        <select value={productResourceFilter} onChange={(event) => setProductResourceFilter(getValue(event) as "all" | ProductResource)} className="h-11 rounded-2xl border border-[#dbe4f0] px-4 text-sm outline-none focus:border-[#2563eb]">
                          <option value="all">Tất cả nguồn</option>
                          <option value="products">Quà tặng</option>
                          <option value="lipsticks">Lego</option>
                          <option value="perfumes">Xe</option>
                        </select>
                        <select value={productSort} onChange={(event) => setProductSort(getValue(event) as "latest" | "name_asc" | "price_desc" | "price_asc")} className="h-11 rounded-2xl border border-[#dbe4f0] px-4 text-sm outline-none focus:border-[#2563eb]">
                          <option value="latest">Mới nhất</option>
                          <option value="name_asc">Tên A-Z</option>
                          <option value="price_desc">Giá giảm dần</option>
                          <option value="price_asc">Giá tăng dần</option>
                        </select>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-sm font-semibold text-[#2563eb]">{visibleProducts.length} SP</span>
                  </div>
                  <div className="space-y-4">
                    {visibleProducts.map((item) => (
                      <div key={`${item.resource}-${item.id}`} className="grid gap-4 rounded-[28px] border border-[#e7eef8] bg-[#fbfdff] p-5 xl:grid-cols-[88px_minmax(0,1fr)_auto]">
                        <div className="h-[88px] w-[88px] overflow-hidden rounded-2xl bg-white">
                          {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400">No img</div>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[1.08rem] font-semibold leading-8 text-slate-900">{item.name}</p>
                          {/* <p className="mt-1 text-sm text-slate-500">{item.brand || "Không thương hiệu"} • {item.origin || "Không rõ xuất xứ"} • {item.resource || "products"}</p> */}
                          <p className="mt-2 text-sm text-slate-500">{(item.categories || []).join(" • ") || "Chưa có danh mục"}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${item.stockStatus === "out_of_stock" || item.stock === 0 ? "bg-[#fff1f2] text-[#dc2626]" : "bg-[#ecfdf3] text-[#15803d]"}`}>
                              {item.stockStatus === "out_of_stock" || item.stock === 0 ? "Hết hàng" : "Còn hàng"}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                              Tồn: {typeof item.stock === "number" ? item.stock : "-"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between gap-3">
                          <p className="text-[1.2rem] font-semibold text-[#2563eb]">{money(item.price)}</p>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => { const resource = (item.resource || "products") as ProductResource; setEditingId(item.id); setEditingResource(resource); setProductForm({ resource, name: item.name || "", brand: item.brand || "", price: item.price ? String(item.price) : "", oldPrice: item.oldPrice ? String(item.oldPrice) : "", image: item.image || "", categories: (item.categories || []).join(", "), origin: item.origin || "", sectionLabel: item.sectionLabel || "", stockStatus: item.stockStatus || "in_stock", stock: typeof item.stock === "number" ? String(item.stock) : "" }); }} className="rounded-2xl border border-[#dbe4f0] px-4 py-2 text-sm font-semibold text-slate-700">
                              Sửa
                            </button>
                            // Tìm đến dòng 647 trong page.tsx và sửa thành:
<button 
  type="button" 
  onClick={() => remove(
    "/api/admin/catalog", // Gửi về đúng route.ts của bạn
    "Đã xóa sản phẩm.", 
    `Xóa sản phẩm "${item.name}"?`, 
    { id: item.id } // Gửi ID vào body để route.ts nhận được
  )} 
  className="rounded-2xl border border-[#fecaca] px-4 py-2 text-sm font-semibold text-[#dc2626]"
>
  Xóa
</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {visibleProducts.length === 0 ? <p className="rounded-2xl bg-[#f8fbff] px-5 py-6 text-sm text-slate-500">Không có sản phẩm nào khớp bộ lọc hiện tại.</p> : null}
                  </div>
                </div>
              </section>
            ) : null}

            {!loading && tab === "categories" ? (
              <section className="rounded-[30px] border border-[#dbe4f0] bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h1 className="text-[2rem] font-semibold text-slate-900">Danh mục</h1>
                    <p className="mt-2 text-slate-600">Đổi tên hoặc xóa category toàn cục.</p>
                  </div>
                  <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-sm font-semibold text-[#2563eb]">{categories.length} danh mục</span>
                </div>
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.name} className="flex flex-col gap-4 rounded-[28px] border border-[#e7eef8] bg-[#fbfdff] p-5 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <p className="text-[1.12rem] font-semibold text-slate-900">{category.name}</p>
                        <p className="mt-1 text-sm text-slate-500">Đang gắn với {category.count} sản phẩm</p>
                      </div>
                      {editingCategory === category.name ? (
                        <div className="flex flex-1 flex-col gap-3 sm:flex-row xl:max-w-[620px]">
                          <input value={categoryDraft} onChange={(event) => setCategoryDraft(getValue(event))} className="h-12 flex-1 rounded-2xl border border-[#dbe4f0] px-4 text-sm outline-none focus:border-[#2563eb]" />
                          <button
                            type="button"
                            onClick={async () => {
                              setSaving(true);
                              setError("");
                              try {
                                await sendJson("/api/admin/categories", "PATCH", { from: editingCategory, to: categoryDraft.trim() });
                                setEditingCategory("");
                                setCategoryDraft("");
                                setSuccess("Đã đổi tên danh mục.");
                                await loadAll();
                              } catch (renameError) {
                                setError(renameError instanceof Error ? renameError.message : "Không đổi được danh mục.");
                              } finally {
                                setSaving(false);
                              }
                            }}
                            className="h-12 rounded-2xl bg-[#2563eb] px-5 text-sm font-semibold text-white"
                          >
                            Lưu
                          </button>
                          <button type="button" onClick={() => { setEditingCategory(""); setCategoryDraft(""); }} className="h-12 rounded-2xl border border-[#dbe4f0] px-5 text-sm font-semibold text-slate-700">
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button type="button" onClick={() => { setEditingCategory(category.name); setCategoryDraft(category.name); }} className="rounded-2xl border border-[#dbe4f0] px-4 py-2 text-sm font-semibold text-slate-700">
                            Đổi tên
                          </button>
                          <button type="button" onClick={() => remove("/api/admin/categories", "Đã xóa danh mục.", `Xóa danh mục "${category.name}" khỏi toàn bộ sản phẩm?`, { name: category.name })} className="rounded-2xl border border-[#fecaca] px-4 py-2 text-sm font-semibold text-[#dc2626]">
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* {!loading && tab === "brands" ? (
              <section className="rounded-[30px] border border-[#dbe4f0] bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h1 className="text-[2rem] font-semibold text-slate-900">Thương hiệu</h1>
                    <p className="mt-2 text-slate-600">Đổi tên hoặc xóa thương hiệu.</p>
                  </div>
                  <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-sm font-semibold text-[#2563eb]">{brands.length} thương hiệu</span>
                </div>
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <input
                    value={brandNew}
                    onChange={(event) => setBrandNew(getValue(event))}
                    placeholder="Thêm thương hiệu mới"
                    className="h-12 min-w-[260px] flex-1 rounded-2xl border border-[#dbe4f0] px-4 text-sm outline-none focus:border-[#2563eb]"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!brandNew.trim()) return;
                      setSaving(true);
                      setError("");
                      try {
                        await sendJson("/api/admin/brands", "POST", { name: brandNew.trim() });
                        setBrandNew("");
                        setSuccess("Đã thêm thương hiệu.");
                        await loadAll();
                      } catch (addError) {
                        setError(addError instanceof Error ? addError.message : "Không thêm được thương hiệu.");
                      } finally {
                        setSaving(false);
                      }
                    }}
                    className="h-12 rounded-2xl bg-[#2563eb] px-5 text-sm font-semibold text-white"
                  >
                    Thêm
                  </button>
                </div>
                <div className="space-y-4">
                  {brandOptions.map((name) => (
                    <div key={name} className="flex flex-col gap-4 rounded-[28px] border border-[#e7eef8] bg-[#fbfdff] p-5 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <p className="text-[1.12rem] font-semibold text-slate-900">{name}</p>
                      </div>
                      {editingBrand === name ? (
                        <div className="flex flex-1 flex-col gap-3 sm:flex-row xl:max-w-[620px]">
                          <input value={brandDraft} onChange={(event) => setBrandDraft(getValue(event))} className="h-12 flex-1 rounded-2xl border border-[#dbe4f0] px-4 text-sm outline-none focus:border-[#2563eb]" />
                          <button
                            type="button"
                            onClick={async () => {
                              setSaving(true);
                              setError("");
                              try {
                                await sendJson("/api/admin/brands", "PATCH", { from: editingBrand, to: brandDraft.trim() });
                                setEditingBrand("");
                                setBrandDraft("");
                                setSuccess("Đã đổi tên thương hiệu.");
                                await loadAll();
                              } catch (renameError) {
                                setError(renameError instanceof Error ? renameError.message : "Không đổi được thương hiệu.");
                              } finally {
                                setSaving(false);
                              }
                            }}
                            className="h-12 rounded-2xl bg-[#2563eb] px-5 text-sm font-semibold text-white"
                          >
                            Lưu
                          </button>
                          <button type="button" onClick={() => { setEditingBrand(""); setBrandDraft(""); }} className="h-12 rounded-2xl border border-[#dbe4f0] px-5 text-sm font-semibold text-slate-700">
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button type="button" onClick={() => { setEditingBrand(name); setBrandDraft(name); }} className="rounded-2xl border border-[#dbe4f0] px-4 py-2 text-sm font-semibold text-slate-700">
                            Đổi tên
                          </button>
                          <button type="button" onClick={() => remove("/api/admin/brands", "Đã xóa thương hiệu.", `Xóa thương hiệu "${name}"?`, { name })} className="rounded-2xl border border-[#fecaca] px-4 py-2 text-sm font-semibold text-[#dc2626]">
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ) : null} */}

            {/* {!loading && tab === "origins" ? (
              <section className="rounded-[30px] border border-[#dbe4f0] bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h1 className="text-[2rem] font-semibold text-slate-900">Xuất xứ</h1>
                    <p className="mt-2 text-slate-600">Đổi tên hoặc xóa xuất xứ.</p>
                  </div>
                  <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-sm font-semibold text-[#2563eb]">{origins.length} xuất xứ</span>
                </div>
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <input
                    value={originNew}
                    onChange={(event) => setOriginNew(getValue(event))}
                    placeholder="Thêm xuất xứ mới"
                    className="h-12 min-w-[260px] flex-1 rounded-2xl border border-[#dbe4f0] px-4 text-sm outline-none focus:border-[#2563eb]"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!originNew.trim()) return;
                      setSaving(true);
                      setError("");
                      try {
                        await sendJson("/api/admin/origins", "POST", { name: originNew.trim() });
                        setOriginNew("");
                        setSuccess("Đã thêm xuất xứ.");
                        await loadAll();
                      } catch (addError) {
                        setError(addError instanceof Error ? addError.message : "Không thêm được xuất xứ.");
                      } finally {
                        setSaving(false);
                      }
                    }}
                    className="h-12 rounded-2xl bg-[#2563eb] px-5 text-sm font-semibold text-white"
                  >
                    Thêm
                  </button>
                </div>
                <div className="space-y-4">
                  {originOptions.map((name) => (
                    <div key={name} className="flex flex-col gap-4 rounded-[28px] border border-[#e7eef8] bg-[#fbfdff] p-5 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <p className="text-[1.12rem] font-semibold text-slate-900">{name}</p>
                      </div>
                      {editingOrigin === name ? (
                        <div className="flex flex-1 flex-col gap-3 sm:flex-row xl:max-w-[620px]">
                          <input value={originDraft} onChange={(event) => setOriginDraft(getValue(event))} className="h-12 flex-1 rounded-2xl border border-[#dbe4f0] px-4 text-sm outline-none focus:border-[#2563eb]" />
                          <button
                            type="button"
                            onClick={async () => {
                              setSaving(true);
                              setError("");
                              try {
                                await sendJson("/api/admin/origins", "PATCH", { from: editingOrigin, to: originDraft.trim() });
                                setEditingOrigin("");
                                setOriginDraft("");
                                setSuccess("Đã đổi tên xuất xứ.");
                                await loadAll();
                              } catch (renameError) {
                                setError(renameError instanceof Error ? renameError.message : "Không đổi được xuất xứ.");
                              } finally {
                                setSaving(false);
                              }
                            }}
                            className="h-12 rounded-2xl bg-[#2563eb] px-5 text-sm font-semibold text-white"
                          >
                            Lưu
                          </button>
                          <button type="button" onClick={() => { setEditingOrigin(""); setOriginDraft(""); }} className="h-12 rounded-2xl border border-[#dbe4f0] px-5 text-sm font-semibold text-slate-700">
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button type="button" onClick={() => { setEditingOrigin(name); setOriginDraft(name); }} className="rounded-2xl border border-[#dbe4f0] px-4 py-2 text-sm font-semibold text-slate-700">
                            Đổi tên
                          </button>
                          <button type="button" onClick={() => remove("/api/admin/origins", "Đã xóa xuất xứ.", `Xóa xuất xứ "${name}"?`, { name })} className="rounded-2xl border border-[#fecaca] px-4 py-2 text-sm font-semibold text-[#dc2626]">
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ) : null} */}

            {!loading && tab === "reviews" ? (
              <section className="rounded-[30px] border border-[#dbe4f0] bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h1 className="text-[2rem] font-semibold text-slate-900">Bình luận</h1>
                    <p className="mt-2 text-slate-600">Theo dõi và xóa bình luận của khách hàng.</p>
                  </div>
                  <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-sm font-semibold text-[#2563eb]">{reviews.length} bình luận</span>
                </div>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-[24px] border border-[#e7eef8] bg-[#fbfdff] p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-[1.08rem] font-semibold text-slate-900">{review.authorName || "Khách hàng"}</p>
                          <p className="mt-1 text-sm text-slate-500">{review.authorEmail || "Không có email"}</p>
                          <p className="mt-1 text-sm text-slate-500">{review.productName || review.productKey || "Sản phẩm"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">{when(review.createdAt)}</p>
                          <p className="mt-2 text-sm font-semibold text-[#2563eb]">{review.rating ? `${review.rating} sao` : "Chưa rõ"}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-slate-700">{review.comment || "Không có nội dung."}</p>
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => remove("/api/reviews", "Đã xóa bình luận.", "Xóa bình luận này?", { id: review.id })}
                          className="rounded-2xl border border-[#fecaca] px-4 py-2 text-sm font-semibold text-[#dc2626]"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                  {reviews.length === 0 ? <p className="rounded-2xl bg-[#f8fbff] px-5 py-6 text-sm text-slate-500">Chưa có bình luận nào.</p> : null}
                </div>
              </section>
            ) : null}

            {!loading && tab === "orders" ? (
              <section className="space-y-5">
                <div>
                  <h1 className="text-[2rem] font-semibold text-slate-900">Đơn hàng</h1>
                  <p className="mt-2 text-slate-600">Theo dõi chi tiết đơn và cập nhật trạng thái.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <select value={orderStatusFilter} onChange={(event) => setOrderStatusFilter(getValue(event) as (typeof orderStatuses)[number])} className="h-11 rounded-2xl border border-[#dbe4f0] bg-white px-4 text-sm outline-none focus:border-[#2563eb]">
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>{status === "all" ? "Tất cả trạng thái" : status}</option>
                    ))}
                  </select>
                  <select value={orderSort} onChange={(event) => setOrderSort(getValue(event) as "latest" | "total_desc" | "total_asc")} className="h-11 rounded-2xl border border-[#dbe4f0] bg-white px-4 text-sm outline-none focus:border-[#2563eb]">
                    <option value="latest">Đơn mới nhất</option>
                    <option value="total_desc">Tổng tiền giảm dần</option>
                    <option value="total_asc">Tổng tiền tăng dần</option>
                  </select>
                </div>
                {visibleOrders.map((order) => (
                  <div key={order.id} className="rounded-[30px] border border-[#dbe4f0] bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-[1.45rem] font-semibold text-slate-900">{order.orderNumber || order.id}</h2>
                        <p className="mt-2 text-sm leading-7 text-slate-500">{order.customer?.fullName || "Khách hàng"} • {order.customer?.email || "Không có email"} • {order.customer?.phone || "Không có SĐT"}</p>
                        <p className="text-sm leading-7 text-slate-500">{order.customer?.address || "Không có địa chỉ"} • {when(order.createdAt)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[1.5rem] font-semibold text-[#2563eb]">{money(order.total || 0)}</span>
                        <button type="button" onClick={() => remove(`/api/admin/orders/${order.id}`, "Đã xóa đơn hàng.", `Xóa đơn "${order.orderNumber || order.id}"?`)} className="rounded-2xl border border-[#fecaca] px-4 py-2 text-sm font-semibold text-[#dc2626]">
                          Xóa đơn
                        </button>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <select
                        value={order.status || "Thành công"}
                        onChange={async (event) => {
                          setSaving(true);
                          setError("");
                          try {
                            await sendJson(`/api/admin/orders/${order.id}`, "PATCH", { status: getValue(event) });
                            setSuccess("Đã cập nhật trạng thái đơn hàng.");
                            await loadAll();
                          } catch (updateError) {
                            setError(updateError instanceof Error ? updateError.message : "Không cập nhật được đơn hàng.");
                          } finally {
                            setSaving(false);
                          }
                        }}
                        className="h-11 rounded-2xl border border-[#dbe4f0] px-4 text-sm outline-none focus:border-[#2563eb]"
                      >
                        {["Chờ xác nhận", "Đang xử lý", "Đang giao", "Thành công", "Đã hủy"].map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <span className="rounded-full bg-[#f8fbff] px-4 py-2 text-sm text-slate-600">Thanh toán: {order.paymentMethod || "COD"}</span>
                    </div>
                    <div className="mt-5 grid gap-4">
                      {order.items?.map((item, index) => (
                        <div key={`${order.id}-${index}`} className="grid gap-4 rounded-[24px] border border-[#e7eef8] bg-[#fbfdff] p-4 md:grid-cols-[72px_minmax(0,1fr)_auto]">
                          <div className="h-[72px] w-[72px] overflow-hidden rounded-2xl bg-white">
                            {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400">KYO</div>}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[1.02rem] font-semibold leading-7 text-slate-900">{item.name}</p>
                            <p className="mt-1 text-sm text-slate-500">Số lượng: {item.quantity ?? 1}</p>
                          </div>
                          <div className="text-right text-[1.02rem] font-semibold text-[#2563eb]">{money(item.price || 0)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {visibleOrders.length === 0 ? <div className="rounded-[30px] border border-[#dbe4f0] bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">Không có đơn hàng nào khớp bộ lọc hiện tại.</div> : null}
              </section>
            ) : null}

            {!loading && tab === "users" ? (
              <section className="rounded-[30px] border border-[#dbe4f0] bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h1 className="text-[2rem] font-semibold text-slate-900">Khách hàng</h1>
                    <p className="mt-2 text-slate-600">Quản lý tài khoản và chuyển quyền user/admin.</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <select value={userRoleFilter} onChange={(event) => setUserRoleFilter(getValue(event) as "all" | Role)} className="h-11 rounded-2xl border border-[#dbe4f0] px-4 text-sm outline-none focus:border-[#2563eb]">
                        <option value="all">Tất cả quyền</option>
                        <option value="admin">admin</option>
                        <option value="user">user</option>
                      </select>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-sm font-semibold text-[#2563eb]">{visibleUsers.length} tài khoản</span>
                </div>

                <div className="space-y-4">
                  {visibleUsers.map((user) => (
                    <div key={user.id} className="rounded-[28px] border border-[#e7eef8] bg-[#fbfdff] p-5">
                      <div className="grid gap-3 xl:grid-cols-[repeat(5,minmax(0,1fr))_160px_auto]">
                        <input value={user.fullName ?? ""} onChange={(event) => setUsers((current) => current.map((item) => item.id === user.id ? { ...item, fullName: getValue(event) } : item))} placeholder="Họ và tên" className="h-11 rounded-2xl border border-[#dbe4f0] px-4 text-sm outline-none focus:border-[#2563eb]" />
                        <input value={user.username ?? ""} onChange={(event) => setUsers((current) => current.map((item) => item.id === user.id ? { ...item, username: getValue(event) } : item))} placeholder="Tài khoản" className="h-11 rounded-2xl border border-[#dbe4f0] px-4 text-sm outline-none focus:border-[#2563eb]" />
                        <input value={user.email ?? ""} onChange={(event) => setUsers((current) => current.map((item) => item.id === user.id ? { ...item, email: getValue(event) } : item))} placeholder="Email" className="h-11 rounded-2xl border border-[#dbe4f0] px-4 text-sm outline-none focus:border-[#2563eb]" />
                        <input value={user.phone ?? ""} onChange={(event) => setUsers((current) => current.map((item) => item.id === user.id ? { ...item, phone: getValue(event) } : item))} placeholder="Số điện thoại" className="h-11 rounded-2xl border border-[#dbe4f0] px-4 text-sm outline-none focus:border-[#2563eb]" />
                        <input value={user.password ?? ""} onChange={(event) => setUsers((current) => current.map((item) => item.id === user.id ? { ...item, password: getValue(event) } : item))} placeholder="Mật khẩu" className="h-11 rounded-2xl border border-[#dbe4f0] px-4 text-sm outline-none focus:border-[#2563eb]" />
                        <select value={user.role ?? "user"} onChange={(event) => setUsers((current) => current.map((item) => item.id === user.id ? { ...item, role: getValue(event) as Role } : item))} className="h-11 rounded-2xl border border-[#dbe4f0] px-4 text-sm font-semibold outline-none focus:border-[#2563eb]">
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => saveUser(user)} className="h-11 rounded-2xl bg-[#2563eb] px-4 text-sm font-semibold text-white">Lưu</button>
                          <button type="button" onClick={async () => {
                            await remove(`/api/admin/users/${user.id}`, "Đã xóa tài khoản.", `Xóa tài khoản "${user.username || user.email}"?`);
                            if (typeof window !== "undefined" && sessionUser?.id === user.id) {
                              window.localStorage.removeItem(AUTH_KEY);
                              window.dispatchEvent(new Event("auth-updated"));
                              setSessionUser(null);
                            }
                          }} className="h-11 rounded-2xl border border-[#fecaca] px-4 text-sm font-semibold text-[#dc2626]">Xóa</button>
                        </div>
                      </div>
                      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">Tạo lúc {when(user.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {!loading && tab === "settings" ? (
              <section className="rounded-[30px] border border-[#dbe4f0] bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
                <div className="max-w-[980px]">
                  <h1 className="text-[2rem] font-semibold text-slate-900">Cài đặt</h1>
                  <p className="mt-2 text-slate-600">Chỉnh thông tin cửa hàng và thông báo nội bộ dashboard.</p>
                </div>

                <div className="mt-6 grid gap-5 xl:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-600">Tên cửa hàng</p>
                    <input value={settings.storeName} onChange={(event) => setSettings((current) => ({ ...current, storeName: getValue(event) }))} className="h-12 w-full rounded-2xl border border-[#dbe4f0] px-4 text-sm outline-none focus:border-[#2563eb]" />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-600">Email hỗ trợ</p>
                    <input value={settings.supportEmail} onChange={(event) => setSettings((current) => ({ ...current, supportEmail: getValue(event) }))} className="h-12 w-full rounded-2xl border border-[#dbe4f0] px-4 text-sm outline-none focus:border-[#2563eb]" />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-600">Hotline</p>
                    <input value={settings.hotline} onChange={(event) => setSettings((current) => ({ ...current, hotline: getValue(event) }))} className="h-12 w-full rounded-2xl border border-[#dbe4f0] px-4 text-sm outline-none focus:border-[#2563eb]" />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-600">Mốc miễn phí vận chuyển</p>
                    <input value={settings.freeShippingThreshold} onChange={(event) => setSettings((current) => ({ ...current, freeShippingThreshold: Number(getValue(event)) || 0 }))} className="h-12 w-full rounded-2xl border border-[#dbe4f0] px-4 text-sm outline-none focus:border-[#2563eb]" />
                  </div>
                </div>

                <div className="mt-5">
                  <p className="mb-2 text-sm font-semibold text-slate-600">Ghi chú admin</p>
                  <textarea value={settings.adminNotice} onChange={(event) => setSettings((current) => ({ ...current, adminNotice: getValue(event) }))} rows={8} className="w-full rounded-3xl border border-[#dbe4f0] px-4 py-4 text-sm outline-none focus:border-[#2563eb]" />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" onClick={saveSettings} disabled={saving} className="inline-flex h-12 min-w-[180px] items-center justify-center rounded-2xl bg-[#2563eb] px-6 text-sm font-semibold text-white disabled:opacity-60">
                    Lưu cài đặt
                  </button>
                  <Link
                    href="/"
                    className="inline-flex h-12 min-w-[180px] items-center justify-center rounded-2xl border border-[#dbe4f0] bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Quay về trang chủ
                  </Link>
                </div>
              </section>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
