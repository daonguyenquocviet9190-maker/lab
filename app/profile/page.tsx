"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/lib/shop";

type User = { name: string; email: string; joinedAt: string } | null;

export default function ProfilePage() {
  const [user] = useState<User>(() => {
    if (typeof window === "undefined") return null;
    return getCurrentUser();
  });
  const router = useRouter();

  if (!user) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p>Bạn chưa đăng nhập.</p>
        <button className="mt-3 rounded bg-cyan-600 px-4 py-2 text-white" onClick={() => router.push("/auth/login")}>Đăng nhập</button>
      </div>
    );
  }

  function handleLogout() {
    logout();
    router.push("/auth/login");
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm space-y-4">
      <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
      <p>Tên: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Ngày tham gia: {new Date(user.joinedAt).toLocaleDateString()}</p>
      <div>
        <button className="rounded bg-cyan-600 px-4 py-2 text-white" onClick={() => router.push("/orders")}>Xem đơn hàng</button>
        <button className="ml-3 rounded bg-slate-300 px-4 py-2 text-slate-800" onClick={handleLogout}>Đăng xuất</button>
      </div>
    </div>
  );
}
