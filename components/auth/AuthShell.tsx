import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  mode: "login" | "register";
  title: string;
  children: ReactNode;
  footerText: string;
  footerLinkLabel: string;
  footerHref: string;
};

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-current">
      <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" />
    </svg>
  );
}

function SocialButton({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <button
      type="button"
      className={`flex h-12 items-center justify-center gap-3 rounded-2xl border border-[#f4d1dd] bg-white px-4 text-sm font-semibold text-[#5e5664] transition hover:border-[#ec3a7a] hover:text-[#ec3a7a] ${className}`}
    >
      {label}
    </button>
  );
}

export default function AuthShell({
  mode,
  title,
  children,
  footerText,
  footerLinkLabel,
  footerHref,
}: AuthShellProps) {
  return (
    <section className="px-4 py-10 lg:px-8 lg:py-14">
      <div
        className="mx-auto flex min-h-[680px] max-w-[520px] items-center justify-center rounded-[36px] px-4 py-8"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(243,111,151,0.12) 0 28px, rgba(255,255,255,0.88) 28px 56px)",
        }}
      >
        <div className="w-full max-w-[360px] rounded-[30px] border border-[#f5cfdb] bg-white/95 p-6 shadow-[0_24px_50px_rgba(236,58,122,0.10)] backdrop-blur">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2f7] text-[#ea3b83]">
              <GridIcon />
            </div>

            <div className="flex flex-1 rounded-full bg-[#fff5f8] p-1">
              <Link
                href="/auth/login"
                className={`flex-1 rounded-full px-4 py-2 text-center text-sm font-bold transition ${
                  mode === "login"
                    ? "bg-white text-[#111111] shadow-[0_8px_20px_rgba(17,17,17,0.08)]"
                    : "text-[#8e8191] hover:text-[#ea3b83]"
                }`}
              >
                Đăng Nhập
              </Link>
              <Link
                href="/auth/register"
                className={`flex-1 rounded-full px-4 py-2 text-center text-sm font-bold transition ${
                  mode === "register"
                    ? "bg-white text-[#111111] shadow-[0_8px_20px_rgba(17,17,17,0.08)]"
                    : "text-[#8e8191] hover:text-[#ea3b83]"
                }`}
              >
                Đăng Ký
              </Link>
            </div>
          </div>

          <h1 className="text-[1.9rem] font-extrabold tracking-[-0.03em] text-[#111111]">
            {title}
          </h1>

          <div className="mt-6">{children}</div>

          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-[#edd8e1]" />
            <span className="text-sm font-semibold text-[#7f7482]">Hoặc</span>
            <span className="h-px flex-1 bg-[#edd8e1]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SocialButton label="Facebook" className="text-[#3b5998]" />
            <SocialButton label="Google" className="text-[#db4437]" />
          </div>

          <p className="mt-6 text-center text-sm text-[#8a7e8e]">
            {footerText}{" "}
            <Link href={footerHref} className="font-bold text-[#ea3b83]">
              {footerLinkLabel}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
