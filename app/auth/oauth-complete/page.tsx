"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function decodeSession(session: string) {
  try {
    const normalized = session.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );

    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

// Bóc tách logic xử lý OAuth ra một component riêng
function OAuthHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);

  const error = searchParams.get("error");
  const sessionToken = searchParams.get("session");
  const provider = searchParams.get("provider");

  const session = useMemo(
    () => (sessionToken ? decodeSession(sessionToken) : null),
    [sessionToken],
  );

  useEffect(() => {
    if (error || !session) {
      setReady(true);
      return;
    }

    window.localStorage.setItem("kyo-auth-user", JSON.stringify(session));
    window.dispatchEvent(new Event("auth-updated"));
    setReady(true);

    const timer = window.setTimeout(() => {
      router.replace("/account");
    }, 1200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [error, router, session]);

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="rounded-[32px] border border-[#f3d6df] bg-white px-8 py-10 text-center shadow-[0_24px_60px_rgba(238,77,140,0.08)]">
          <h1 className="text-3xl font-semibold text-slate-900">
            Đang hoàn tất đăng nhập...
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Hệ thống đang đồng bộ tài khoản {provider || "mạng xã hội"} của bạn.
          </p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-2xl rounded-[32px] border border-[#ffd3d3] bg-white px-8 py-10 shadow-[0_24px_60px_rgba(238,77,140,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ee4d8c]">
            OAuth Error
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900">
            Đăng nhập mạng xã hội thất bại
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            {error || "Không hoàn tất được xác thực với Google hoặc Facebook."}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/auth/login"
              className="rounded-full bg-[#ee4d8c] px-6 py-3 text-sm font-semibold text-white"
            >
              Quay lại đăng nhập
            </Link>
            <Link
              href="/"
              className="rounded-full border border-[#f0d5de] bg-white px-6 py-3 text-sm font-semibold text-slate-700"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="rounded-[32px] border border-[#d7efd7] bg-white px-8 py-10 text-center shadow-[0_24px_60px_rgba(238,77,140,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#1e8c44]">
          OAuth Success
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900">
          Đăng nhập thành công
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Chào {session.fullName || session.username || session.email}, hệ thống
          đang chuyển bạn tới trang tài khoản.
        </p>
      </div>
    </div>
  );
}

// Component chính export ra ngoài, bọc Suspense xung quanh
export default function OAuthCompletePage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-lg text-slate-500">Đang tải cấu hình xác thực...</div>}>
      <OAuthHandler />
    </Suspense>
  );
}