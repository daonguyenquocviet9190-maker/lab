import Link from "next/link";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#eef4ff]">
      <style>{`
        header,
        footer {
          display: none !important;
        }
      `}</style>

      <div className="fixed bottom-5 right-5 z-50 flex flex-wrap items-center gap-3">
        <Link
          href="/admin"
          className="rounded-full border border-[#d7e4ff] bg-white px-4 py-2 text-sm font-semibold text-[#315fe0] shadow-[0_12px_28px_rgba(49,95,224,0.12)] transition hover:-translate-y-0.5"
        >
          Dashboard
        </Link>
        <Link
          href="/admin/banners"
          className="rounded-full border border-[#d7e4ff] bg-white px-4 py-2 text-sm font-semibold text-[#315fe0] shadow-[0_12px_28px_rgba(49,95,224,0.12)] transition hover:-translate-y-0.5"
        >
          Banner
        </Link>
        <Link
          href="/"
          className="rounded-full border border-[#d7e4ff] bg-white px-4 py-2 text-sm font-semibold text-[#315fe0] shadow-[0_12px_28px_rgba(49,95,224,0.12)] transition hover:-translate-y-0.5"
        >
          Về shop
        </Link>
      </div>

      {children}
    </div>
  );
}
