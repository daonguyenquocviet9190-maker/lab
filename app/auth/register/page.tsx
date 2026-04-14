"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const registerInitialValues = {
  fullName: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [formValues, setFormValues] = useState(registerInitialValues);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const fullName = formValues.fullName.trim();
    const username = formValues.username.trim();
    const email = formValues.email.trim().toLowerCase();
    const phone = formValues.phone.trim();
    const normalizedPhone = phone.replace(/\D/g, "");
    const password = formValues.password;
    const confirmPassword = formValues.confirmPassword;

    if (!fullName || !username || !email || !phone || !password || !confirmPassword) {
      setErrorMessage("Vui lòng nhập đầy đủ thông tin đăng ký.");
      return;
    }

    if (!email.endsWith("@gmail.com")) {
      setErrorMessage("Email đăng ký phải dùng đuôi @gmail.com.");
      return;
    }

    if (normalizedPhone.length !== 10) {
      setErrorMessage("Số điện thoại phải đúng 10 số.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Nhập lại mật khẩu chưa khớp.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          username,
          email,
          phone: normalizedPhone,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrorMessage(data.error ?? "Không thể đăng ký lúc này.");
        return;
      }

      setSuccessMessage("Đăng ký thành công. Bạn có thể đăng nhập ngay.");
      setFormValues(registerInitialValues);
      window.setTimeout(() => {
        router.push("/auth/login");
      }, 900);
    } catch {
      setErrorMessage("Không thể đăng ký lúc này.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-[linear-gradient(90deg,rgba(243,92,145,0.12)_0,rgba(243,92,145,0.12)_7%,transparent_7%,transparent_14%)] py-10 sm:py-14">
      <div className="mx-auto max-w-[560px] px-4">
        <div className="rounded-[38px] border border-[#f6bfd1] bg-white/95 p-6 shadow-[0_20px_70px_rgba(238,91,148,0.12)] sm:p-8">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0f6] text-[#ee4d8c] shadow-[0_10px_24px_rgba(238,91,148,0.16)]">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" />
              </svg>
            </div>
            <div className="flex flex-1 rounded-full bg-[#fff4f8] p-1.5">
              <Link
                href="/auth/login"
                className="flex-1 rounded-full px-5 py-2.5 text-center text-[1rem] font-semibold text-[#a18e9a] transition hover:text-[#ee4d8c]"
              >
                Đăng Nhập
              </Link>
              <span className="flex-1 rounded-full bg-white px-5 py-2.5 text-center text-[1rem] font-semibold text-[#3b2432] shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
                Đăng Ký
              </span>
            </div>
          </div>

          <h1 className="text-[2.15rem] font-black leading-none text-[#1f1730] sm:text-[2.45rem]">
            Đăng Ký
          </h1>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <input
              type="text"
              value={formValues.fullName}
              onChange={(event) =>
                setFormValues((current) => ({ ...current, fullName: event.target.value }))
              }
              placeholder="Họ và tên"
              className="h-14 w-full rounded-[22px] border border-[#f5bfd0] px-5 text-[1.05rem] text-[#23182e] outline-none transition focus:border-[#ee4d8c]"
            />

            <input
              type="text"
              value={formValues.username}
              onChange={(event) =>
                setFormValues((current) => ({ ...current, username: event.target.value }))
              }
              placeholder="Tài khoản"
              className="h-14 w-full rounded-[22px] border border-[#f5bfd0] px-5 text-[1.05rem] text-[#23182e] outline-none transition focus:border-[#ee4d8c]"
            />

            <input
              type="email"
              value={formValues.email}
              onChange={(event) =>
                setFormValues((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="Email @gmail.com"
              className="h-14 w-full rounded-[22px] border border-[#f5bfd0] px-5 text-[1.05rem] text-[#23182e] outline-none transition focus:border-[#ee4d8c]"
            />

            <input
              type="tel"
              value={formValues.phone}
              onChange={(event) =>
                setFormValues((current) => ({ ...current, phone: event.target.value }))
              }
              placeholder="Số điện thoại"
              inputMode="numeric"
              maxLength={10}
              className="h-14 w-full rounded-[22px] border border-[#f5bfd0] px-5 text-[1.05rem] text-[#23182e] outline-none transition focus:border-[#ee4d8c]"
            />

            <div className="flex overflow-hidden rounded-[22px] border border-[#f5bfd0]">
              <input
                type={isPasswordVisible ? "text" : "password"}
                value={formValues.password}
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="Mật khẩu"
                className="h-14 min-w-0 flex-1 px-5 text-[1.05rem] text-[#23182e] outline-none"
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible((current) => !current)}
                className="w-20 text-[1rem] font-medium text-[#9b8794]"
              >
                {isPasswordVisible ? "Ẩn" : "Hiện"}
              </button>
            </div>

            <div className="flex overflow-hidden rounded-[22px] border border-[#f5bfd0]">
              <input
                type={isConfirmVisible ? "text" : "password"}
                value={formValues.confirmPassword}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
                placeholder="Nhập lại mật khẩu"
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
              className="mt-2 inline-flex h-14 w-full items-center justify-center rounded-[22px] bg-[#ef7ea8] text-[1.15rem] font-bold text-white transition hover:bg-[#ee4d8c] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4 text-[#a18e9a]">
            <span className="h-px flex-1 bg-[#f4cddb]" />
            <span className="text-[1rem] font-semibold">Hoặc</span>
            <span className="h-px flex-1 bg-[#f4cddb]" />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              className="inline-flex h-14 items-center justify-center rounded-[20px] border border-[#f5bfd0] text-[1rem] font-semibold text-[#445084]"
            >
              Facebook
            </button>
            <button
              type="button"
              className="inline-flex h-14 items-center justify-center rounded-[20px] border border-[#f5bfd0] text-[1rem] font-semibold text-[#ef5135]"
            >
              Google
            </button>
          </div>

          <p className="mt-7 text-center text-[1rem] text-[#978490]">
            Bạn đã có tài khoản?{" "}
            <Link href="/auth/login" className="font-semibold text-[#ee4d8c]">
              Đăng Nhập
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
