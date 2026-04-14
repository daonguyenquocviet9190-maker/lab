"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !newPassword || !confirmPassword) {
      setErrorMessage("Vui lòng nhập email và mật khẩu mới.");
      return;
    }

    if (!normalizedEmail.endsWith("@gmail.com")) {
      setErrorMessage("Email phải dùng đuôi @gmail.com.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Nhập lại mật khẩu mới chưa khớp.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrorMessage(data.error ?? "Không thể đổi mật khẩu lúc này.");
        return;
      }

      setSuccessMessage("Đổi mật khẩu thành công. Đang chuyển sang đăng nhập...");
      window.setTimeout(() => {
        router.push("/auth/login");
      }, 900);
    } catch {
      setErrorMessage("Không thể đổi mật khẩu lúc này.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-[linear-gradient(90deg,rgba(243,92,145,0.12)_0,rgba(243,92,145,0.12)_7%,transparent_7%,transparent_14%)] py-10 sm:py-14">
      <div className="mx-auto max-w-[560px] px-4">
        <div className="rounded-[38px] border border-[#f6bfd1] bg-white/95 p-6 shadow-[0_20px_70px_rgba(238,91,148,0.12)] sm:p-8">
          <h1 className="text-[2.05rem] font-black leading-none text-[#1f1730] sm:text-[2.35rem]">
            Quên Mật Khẩu
          </h1>
          <p className="mt-3 text-[1rem] leading-7 text-[#76636e]">
            Nhập email đã đăng ký và đặt lại mật khẩu mới cho tài khoản của bạn.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email @gmail.com"
              className="h-14 w-full rounded-[22px] border border-[#f5bfd0] px-5 text-[1.05rem] text-[#23182e] outline-none transition focus:border-[#ee4d8c]"
            />

            <div className="flex overflow-hidden rounded-[22px] border border-[#f5bfd0]">
              <input
                type={isNewPasswordVisible ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Mật khẩu mới"
                className="h-14 min-w-0 flex-1 px-5 text-[1.05rem] text-[#23182e] outline-none"
              />
              <button
                type="button"
                onClick={() => setIsNewPasswordVisible((current) => !current)}
                className="w-20 text-[1rem] font-medium text-[#9b8794]"
              >
                {isNewPasswordVisible ? "Ẩn" : "Hiện"}
              </button>
            </div>

            <div className="flex overflow-hidden rounded-[22px] border border-[#f5bfd0]">
              <input
                type={isConfirmVisible ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="h-14 min-w-0 flex-1 px-5 text-[1.05rem] text-[#23182e] outline-none"
              />
              <button
                type="button"
                onClick={() => setIsConfirmVisible((current) => !current)}
                className="w-20 text-[1rem] font-medium text-[#9b8794]"
              >
                {isConfirmVisible ? "Ẩn" : "Hiện"}
              </button>
            </div>

            {errorMessage ? (
              <p className="text-[1rem] font-medium text-[#ff477e]">{errorMessage}</p>
            ) : null}

            {successMessage ? (
              <p className="text-[1rem] font-medium text-[#15a05e]">{successMessage}</p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-14 w-full items-center justify-center rounded-[22px] bg-[#ef7ea8] text-[1.15rem] font-bold text-white transition hover:bg-[#ee4d8c] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
            </button>
          </form>

          <div className="mt-7 text-center text-[1rem] text-[#978490]">
            <Link href="/auth/login" className="font-semibold text-[#ee4d8c]">
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
