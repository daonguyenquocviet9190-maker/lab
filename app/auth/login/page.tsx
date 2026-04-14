"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LoginResponse = {
  user?: {
    id: string;
    fullName?: string;
    username?: string;
    email?: string;
    phone?: string;
    role?: string;
  };
  message?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok || !data.user) {
        setError(data.message || "Sai tài khoản hoặc mật khẩu.");
        return;
      }

      window.localStorage.setItem("kyo-auth-user", JSON.stringify(data.user));
window.dispatchEvent(new Event("auth-updated"));

// 🔥 phân quyền
if (data.user.role === "admin") {
  router.replace("/admin");
} else {
  router.replace("/account");
}
    } catch (err) {
      setError("Không thể đăng nhập. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fdeef2] py-12">
      <div className="mx-auto w-full max-w-[520px] rounded-[32px] border border-[#f6d7e0] bg-white px-8 py-10 shadow-[0_24px_60px_rgba(238,77,140,0.08)]">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-slate-900">Đăng nhập</h1>
          <Link
            href="/auth/register"
            className="rounded-full border border-[#f2c9d5] px-4 py-2 text-sm font-semibold text-[#ee4d8c]"
          >
            Đăng ký
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-full border border-[#f2c9d5] px-4 py-3 text-base text-slate-900 outline-none focus:border-[#ee4d8c]"
              placeholder="ban@gmail.com"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Mật khẩu</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-full border border-[#f2c9d5] px-4 py-3 text-base text-slate-900 outline-none focus:border-[#ee4d8c]"
              placeholder="••••••"
              required
            />
          </label>

          {error ? (
            <p className="rounded-2xl border border-[#ffd3d3] bg-[#fff1f1] px-4 py-3 text-sm text-[#d43c3c]">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-full bg-[#ee4d8c] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#db3f7b] disabled:cursor-not-allowed disabled:bg-[#f2a6c2]"
          >
            {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Hoặc đăng nhập nhanh
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <a
            href="/api/auth/oauth/google"
            className="flex items-center justify-center gap-2 rounded-full border border-[#f2c9d5] px-4 py-3 text-sm font-semibold text-slate-700"
          >
            Google
          </a>
          <a
            href="/api/auth/oauth/facebook"
            className="flex items-center justify-center gap-2 rounded-full border border-[#f2c9d5] px-4 py-3 text-sm font-semibold text-slate-700"
          >
            Facebook
          </a>
        </div>
      </div>
    </div>
  );
}
