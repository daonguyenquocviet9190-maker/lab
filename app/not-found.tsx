import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col items-center justify-center p-6 text-center">
      <h1 className="text-5xl font-bold text-[#ee4d8c]">404</h1>
      <p className="mt-4 text-lg text-slate-700">
        Trang bạn đang tìm không tồn tại hoặc đã được di chuyển.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-lg bg-[#ee4d8c] px-5 py-2 text-white hover:bg-[#d62f72]"
        >
          Về trang chủ
        </Link>
        <Link
          href="/shop"
          className="rounded-lg border border-[#ee4d8c] px-5 py-2 text-[#ee4d8c] hover:bg-[#fff4f8]"
        >
          Xem sản phẩm
        </Link>
      </div>
    </main>
  );
}
