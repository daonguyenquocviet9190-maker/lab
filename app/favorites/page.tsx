"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { FavoriteItem } from "@/lib/favorites";
import { readFavorites, removeFavorite } from "@/lib/favorites";

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")} đ`;
}

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    const syncFavorites = () => {
      setItems(readFavorites());
    };

    syncFavorites();
    window.addEventListener("favorites-updated", syncFavorites as EventListener);

    return () => {
      window.removeEventListener("favorites-updated", syncFavorites as EventListener);
    };
  }, []);

  const handleRemove = (slug: string) => {
    removeFavorite(slug);
    setItems(readFavorites());
  };

  return (
    <section className="bg-[#fff9fb] py-8 sm:py-10">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-[30px] border border-[#f4d6e1] bg-white p-6 shadow-[0_18px_55px_rgba(238,91,148,0.08)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[0.95rem] font-bold uppercase tracking-[0.32em] text-[#ef4a89]">
                FAVORITES
              </p>
              <h1 className="mt-3 text-[2.25rem] font-black text-[#1f1730]">
                Sản phẩm yêu thích
              </h1>
              <p className="mt-3 text-[1.05rem] text-[#75606c]">
                Danh sách sản phẩm bạn đã lưu để xem lại nhanh hơn.
              </p>
            </div>
            <span className="rounded-full bg-[#fff1f6] px-4 py-2 text-[1rem] font-bold text-[#ef4a89]">
              {items.length} sản phẩm
            </span>
          </div>

          {items.length === 0 ? (
            <div className="mt-8 rounded-[24px] border border-dashed border-[#f1c7d7] bg-[#fffdfd] p-8 text-center">
              <p className="text-[1.05rem] text-[#75606c]">Bạn chưa lưu sản phẩm yêu thích nào.</p>
              <Link
                href="/shop"
                className="mt-5 inline-flex h-12 items-center justify-center rounded-[18px] bg-[#ef4a89] px-6 text-[1rem] font-semibold text-white transition hover:bg-[#e33d7d]"
              >
                Đi tới shop
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-5">
              {items.map((item) => (
                <div
                  key={item.slug}
                  className="flex flex-col gap-4 rounded-[24px] border border-[#f0d6df] p-4 sm:flex-row sm:items-center"
                >
                  <Link
                    href={`/product/${item.slug}`}
                    className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-[#fff7fa]"
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-sm font-semibold text-[#d8a9bd]">KYO</span>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${item.slug}`}
                      className="text-[1.2rem] font-bold leading-8 text-[#1f1730] transition hover:text-[#ef4a89]"
                    >
                      {item.name}
                    </Link>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="text-[1.25rem] font-bold text-[#ef4a89]">
                        {formatPrice(item.price)}
                      </span>
                      {typeof item.oldPrice === "number" && item.oldPrice > item.price ? (
                        <span className="text-[1rem] text-[#c59aa9] line-through">
                          {formatPrice(item.oldPrice)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/product/${item.slug}`}
                      className="inline-flex h-11 items-center justify-center rounded-[16px] bg-[#ef4a89] px-5 text-[0.98rem] font-semibold text-white transition hover:bg-[#e33d7d]"
                    >
                      Xem sản phẩm
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.slug)}
                      className="inline-flex h-11 items-center justify-center rounded-[16px] border border-[#f1c7d7] px-5 text-[0.98rem] font-semibold text-[#2a1f2d] transition hover:bg-[#fff4f8]"
                    >
                      Xóa khỏi yêu thích
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
