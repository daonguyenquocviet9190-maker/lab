"use client";

import Link from "next/link";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";

type SessionUser = {
  id: string;
  fullName?: string;
  username?: string;
  email?: string;
  role?: string;
};

type BannerItem = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  href: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type BannerForm = {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  href: string;
  active: boolean;
  sortOrder: string;
};

const emptyForm: BannerForm = {
  title: "",
  subtitle: "",
  description: "",
  image: "",
  buttonText: "Mua ngay",
  href: "/shop",
  active: true,
  sortOrder: "0",
};

function gradientStyle(index: number) {
  const gradients = [
    "linear-gradient(135deg, #fff2d8 0%, #ffc4da 48%, #f57cab 100%)",
    "linear-gradient(135deg, #edf5ff 0%, #dbe8ff 46%, #b6cdfd 100%)",
    "linear-gradient(135deg, #f8f0ff 0%, #f4d7ff 44%, #d6b8ff 100%)",
  ];

  return gradients[index % gradients.length];
}

export default function AdminBannersPage() {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [form, setForm] = useState<BannerForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewBanner, setPreviewBanner] = useState<BannerItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? window.localStorage.getItem("kyo-auth-user")
        : null;

    if (!raw) {
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(raw) as SessionUser;
      setSessionUser(user);
    } catch {
      setSessionUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  async function loadBanners() {
    const response = await fetch("/api/admin/banners", { cache: "no-store" });
    const data = (await response.json()) as { items?: BannerItem[] };
    const nextBanners = Array.isArray(data.items) ? data.items : [];
    setBanners(nextBanners);
    if (!editingId && nextBanners.length > 0) {
      const ordered = [...nextBanners].sort((a, b) => a.sortOrder - b.sortOrder);
      setPreviewBanner(ordered[0]);
    }
  }

  useEffect(() => {
    if (!sessionUser || sessionUser.role !== "admin") {
      return;
    }

    loadBanners().catch(() => {
      setError("Không tải được danh sách banner.");
    });
  }, [sessionUser]);

  const previewData = useMemo(() => {
    if (editingId) {
      return {
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
        image: form.image,
        buttonText: form.buttonText,
      };
    }

    if (previewBanner) {
      return {
        title: previewBanner.title,
        subtitle: previewBanner.subtitle,
        description: previewBanner.description,
        image: previewBanner.image,
        buttonText: previewBanner.buttonText,
      };
    }

    return {
      title: form.title,
      subtitle: form.subtitle,
      description: form.description,
      image: form.image,
      buttonText: form.buttonText,
    };
  }, [editingId, form, previewBanner]);

  const previewStyle = useMemo(
    () =>
      previewData.image
        ? `linear-gradient(135deg, rgba(8,15,40,0.38), rgba(8,15,40,0.2)), url(${previewData.image}) center/cover no-repeat`
        : "linear-gradient(135deg, #fff2d8 0%, #ffc4da 48%, #f57cab 100%)",
    [previewData.image],
  );

  function updateForm<K extends keyof BannerForm>(key: K, value: BannerForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError(null);
    setMessage(null);
    if (banners.length > 0) {
      const ordered = [...banners].sort((a, b) => a.sortOrder - b.sortOrder);
      setPreviewBanner(ordered[0]);
    } else {
      setPreviewBanner(null);
    }
  }

  function startEditing(banner: BannerItem) {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      description: banner.description,
      image: banner.image,
      buttonText: banner.buttonText,
      href: banner.href,
      active: banner.active,
      sortOrder: String(banner.sortOrder),
    });
    setMessage(null);
    setError(null);
    setPreviewBanner(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onPickFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateForm("image", reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function saveBanner() {
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        ...form,
        sortOrder: Number(form.sortOrder || 0),
      };

      const response = await fetch(
        editingId ? `/api/admin/banners/${editingId}` : "/api/admin/banners",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message || "Không lưu được banner.");
      }

      await loadBanners();
      setMessage(editingId ? "Đã cập nhật banner." : "Đã thêm banner mới.");
      resetForm();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Không lưu được banner.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function removeBanner(id: string) {
    const shouldDelete = window.confirm("Bạn có chắc muốn xóa banner này?");

    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message || "Không xóa được banner.");
      }

      if (editingId === id) {
        resetForm();
      }

      await loadBanners();
      setMessage("Đã xóa banner.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Không xóa được banner.",
      );
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef4ff] text-lg font-semibold text-slate-700">
        Đang tải phiên admin...
      </div>
    );
  }

  if (!sessionUser || sessionUser.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef4ff] px-6">
        <div className="w-full max-w-xl rounded-[32px] border border-[#dbe6fb] bg-white p-8 shadow-[0_24px_60px_rgba(59,91,183,0.12)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#315fe0]">
            Banner Admin
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900">
            Bạn không có quyền truy cập
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Chỉ tài khoản có role admin mới quản lý được banner trang chủ.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/auth/login"
              className="rounded-full bg-[#315fe0] px-6 py-3 text-sm font-semibold text-white"
            >
              Đăng nhập admin
            </Link>
            <Link
              href="/"
              className="rounded-full border border-[#c8d8ff] bg-white px-6 py-3 text-sm font-semibold text-[#315fe0]"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef4ff] px-5 py-8 md:px-8 xl:px-10">
      <div className="mx-auto max-w-[1580px] space-y-6">
        <section className="rounded-[34px] border border-[#dbe6fb] bg-white px-8 py-7 shadow-[0_24px_60px_rgba(59,91,183,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#315fe0]">
                Banner Management
              </p>
              <h1 className="mt-3 text-[2.4rem] font-semibold tracking-[-0.03em] text-slate-900">
                Quản lý banner trang chủ
              </h1>
              <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
                Upload ảnh banner, đổi nội dung, bật tắt hiển thị và sắp xếp thứ
                tự slide cho Hero Carousel ở trang chủ.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin"
                className="rounded-full border border-[#cfe0ff] bg-white px-5 py-3 text-sm font-semibold text-[#315fe0] shadow-[0_10px_24px_rgba(49,95,224,0.08)]"
              >
                Về dashboard
              </Link>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full bg-[#315fe0] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(49,95,224,0.2)]"
              >
                Tạo banner mới
              </button>
            </div>
          </div>
        </section>

        {message ? (
          <div className="rounded-2xl border border-[#cdebd4] bg-[#f0fff4] px-5 py-4 text-sm font-semibold text-[#17803d]">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-[#ffd4d4] bg-[#fff4f4] px-5 py-4 text-sm font-semibold text-[#de3c3c]">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[480px_minmax(0,1fr)]">
          <section className="rounded-[34px] border border-[#dbe6fb] bg-white p-7 shadow-[0_24px_60px_rgba(59,91,183,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-[1.9rem] font-semibold text-slate-900">
                {editingId ? "Cập nhật banner" : "Thêm banner"}
              </h2>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-[#d2ddfa] bg-white px-4 py-2 text-sm font-semibold text-slate-600"
                >
                  Hủy sửa
                </button>
              ) : null}
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Tiêu đề
                </span>
                <input
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#d6e2fb] px-4 text-[1rem] outline-none transition focus:border-[#315fe0]"
                  placeholder="Ví dụ: KYO AUTHENTIC"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Dòng phụ
                </span>
                <input
                  value={form.subtitle}
                  onChange={(event) => updateForm("subtitle", event.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#d6e2fb] px-4 text-[1rem] outline-none transition focus:border-[#315fe0]"
                  placeholder="Ví dụ: Cosmetics"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Mô tả
                </span>
                <textarea
                  value={form.description}
                  onChange={(event) => updateForm("description", event.target.value)}
                  className="min-h-[120px] w-full rounded-2xl border border-[#d6e2fb] px-4 py-3 text-[1rem] outline-none transition focus:border-[#315fe0]"
                  placeholder="Mô tả ngắn cho banner"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Nút CTA
                  </span>
                  <input
                    value={form.buttonText}
                    onChange={(event) =>
                      updateForm("buttonText", event.target.value)
                    }
                    className="h-14 w-full rounded-2xl border border-[#d6e2fb] px-4 text-[1rem] outline-none transition focus:border-[#315fe0]"
                    placeholder="Mua ngay"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Link chuyển hướng
                  </span>
                  <input
                    value={form.href}
                    onChange={(event) => updateForm("href", event.target.value)}
                    className="h-14 w-full rounded-2xl border border-[#d6e2fb] px-4 text-[1rem] outline-none transition focus:border-[#315fe0]"
                    placeholder="/shop"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Thứ tự hiển thị
                  </span>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(event) =>
                      updateForm("sortOrder", event.target.value)
                    }
                    className="h-14 w-full rounded-2xl border border-[#d6e2fb] px-4 text-[1rem] outline-none transition focus:border-[#315fe0]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Trạng thái
                  </span>
                  <select
                    value={form.active ? "active" : "inactive"}
                    onChange={(event) =>
                      updateForm("active", event.target.value === "active")
                    }
                    className="h-14 w-full rounded-2xl border border-[#d6e2fb] px-4 text-[1rem] outline-none transition focus:border-[#315fe0]"
                  >
                    <option value="active">Đang hiển thị</option>
                    <option value="inactive">Tạm ẩn</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  URL ảnh hoặc data URL
                </span>
                <input
                  value={form.image}
                  onChange={(event) => updateForm("image", event.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#d6e2fb] px-4 text-[1rem] outline-none transition focus:border-[#315fe0]"
                  placeholder="/images/banner-home.jpg"
                />
              </label>

              <label className="block rounded-2xl border border-dashed border-[#c4d7ff] bg-[#f7faff] px-4 py-4">
                <span className="block text-sm font-semibold text-slate-700">
                  Upload ảnh banner
                </span>
                <span className="mt-1 block text-sm leading-6 text-slate-500">
                  Có thể chọn file ảnh trực tiếp, hệ thống sẽ lưu vào JSON dưới
                  dạng data URL.
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPickFile}
                  className="mt-4 block w-full text-sm text-slate-600"
                />
              </label>

              <button
                type="button"
                onClick={saveBanner}
                disabled={submitting}
                className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#315fe0] px-6 text-[1rem] font-semibold text-white shadow-[0_16px_36px_rgba(49,95,224,0.18)] transition hover:bg-[#274fbe] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting
                  ? "Đang lưu..."
                  : editingId
                    ? "Lưu thay đổi"
                    : "Thêm banner"}
              </button>
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-[34px] border border-[#dbe6fb] bg-white p-7 shadow-[0_24px_60px_rgba(59,91,183,0.08)]">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-[1.9rem] font-semibold text-slate-900">
                  Xem trước banner
                </h2>
                <span className="rounded-full bg-[#edf3ff] px-4 py-2 text-sm font-semibold text-[#315fe0]">
                  {editingId
                    ? "Đang sửa"
                    : previewBanner
                      ? "Đang xem"
                      : "Banner mới"}
                </span>
              </div>

              <div
                className="mt-6 overflow-hidden rounded-[30px] border border-[#dce6fb]"
                style={{ background: previewStyle }}
              >
                <div className="bg-[linear-gradient(90deg,rgba(15,23,42,0.68),rgba(15,23,42,0.22),rgba(15,23,42,0.08))] px-8 py-10 text-white sm:px-10 sm:py-14">
                  <p className="text-[1rem] font-semibold uppercase tracking-[0.28em] text-white/80">
                    {previewData.subtitle || "Banner trang chủ"}
                  </p>
                  <h3 className="mt-4 max-w-2xl text-[2.6rem] font-semibold leading-[1.05] sm:text-[3.4rem]">
                    {previewData.title || "Nội dung banner sẽ hiện ở đây"}
                  </h3>
                  <p className="mt-5 max-w-2xl text-[1.05rem] leading-8 text-white/90">
                    {previewData.description ||
                      "Upload ảnh mới hoặc nhập nội dung để xem thử ngay trên khu hero của trang chủ."}
                  </p>
                  <div className="mt-8">
                    <span className="inline-flex h-12 items-center rounded-full bg-white px-6 text-sm font-semibold uppercase tracking-[0.12em] text-slate-900">
                      {previewData.buttonText || "Mua ngay"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[34px] border border-[#dbe6fb] bg-white p-7 shadow-[0_24px_60px_rgba(59,91,183,0.08)]">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-[1.9rem] font-semibold text-slate-900">
                  Danh sách banner
                </h2>
                <span className="rounded-full bg-[#edf3ff] px-4 py-2 text-sm font-semibold text-[#315fe0]">
                  {banners.length} banner
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {banners.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#d7e4ff] bg-[#f8fbff] px-6 py-10 text-center text-slate-500">
                    Chưa có banner nào. Hãy thêm banner đầu tiên cho trang chủ.
                  </div>
                ) : (
                  banners.map((banner, index) => (
                    <div
                      key={banner.id}
                      className="rounded-[28px] border border-[#dbe6fb] bg-[#fbfdff] p-4 shadow-[0_10px_24px_rgba(49,95,224,0.04)]"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row">
                        <div
                          className="h-40 w-full shrink-0 overflow-hidden rounded-[24px] border border-[#dce6fb] lg:w-64"
                          style={{
                            background: banner.image
                              ? `linear-gradient(135deg, rgba(8,15,40,0.4), rgba(8,15,40,0.18)), url(${banner.image}) center/cover no-repeat`
                              : gradientStyle(index),
                          }}
                        >
                          {!banner.image ? (
                            <div className="flex h-full items-end p-5 text-white">
                              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                                Không có ảnh upload
                              </span>
                            </div>
                          ) : null}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-[1.35rem] font-semibold text-slate-900">
                                  {banner.title}
                                </h3>
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                                    banner.active
                                      ? "bg-[#e6f8ec] text-[#11823b]"
                                      : "bg-[#fff0f0] text-[#d83b3b]"
                                  }`}
                                >
                                  {banner.active ? "Đang hiển thị" : "Tạm ẩn"}
                                </span>
                                <span className="rounded-full bg-[#edf3ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#315fe0]">
                                  #{banner.sortOrder}
                                </span>
                              </div>
                              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#315fe0]">
                                {banner.subtitle || "Banner trang chủ"}
                              </p>
                              <p className="mt-3 max-w-3xl text-[1rem] leading-7 text-slate-600">
                                {banner.description || "Chưa có mô tả cho banner này."}
                              </p>
                              <p className="mt-3 text-sm text-slate-500">
                                CTA:{" "}
                                <span className="font-semibold text-slate-700">
                                  {banner.buttonText}
                                </span>
                                {" • "}
                                Link:{" "}
                                <span className="font-semibold text-slate-700">
                                  {banner.href}
                                </span>
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewBanner(banner);
                                  setEditingId(null);
                                }}
                                className="rounded-full border border-[#dfe8ff] bg-white px-5 py-2.5 text-sm font-semibold text-[#315fe0]"
                              >
                                Xem
                              </button>
                              <button
                                type="button"
                                onClick={() => startEditing(banner)}
                                className="rounded-full border border-[#cfe0ff] bg-white px-5 py-2.5 text-sm font-semibold text-[#315fe0]"
                              >
                                Sửa
                              </button>
                              <button
                                type="button"
                                onClick={() => removeBanner(banner.id)}
                                className="rounded-full border border-[#ffd1d1] bg-white px-5 py-2.5 text-sm font-semibold text-[#e34848]"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
