"use client";

import { useEffect, useState } from "react";

import type { FavoriteItem } from "@/lib/favorites";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")} đ`;
}

export default function FavoriteButton({
  product,
  variant = "detail",
}: {
  product: FavoriteItem;
  variant?: "detail" | "compact";
}) {
  const [favorite, setFavorite] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    setFavorite(isFavorite(product.slug));
  }, [product.slug]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToastMessage("");
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const handleToggleFavorite = () => {
    const nextState = toggleFavorite(product);
    setFavorite(nextState);
    setToastMessage(nextState ? "Đã thêm vào yêu thích" : "Đã bỏ khỏi yêu thích");
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleToggleFavorite}
        aria-label={favorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
        className={`inline-flex h-12 w-12 items-center justify-center rounded-full border transition ${
          favorite
            ? "border-[#ee4d8c] bg-[#ee4d8c] text-white"
            : "border-[#f1c7d7] bg-white text-[#ee4d8c] hover:bg-[#fff3f8]"
        }`}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
          <path d="M12 21.35 10.55 20C5.4 15.24 2 12.09 2 8.25 2 5.1 4.42 2.75 7.5 2.75c1.74 0 3.41.81 4.5 2.09a6.01 6.01 0 0 1 4.5-2.09c3.08 0 5.5 2.35 5.5 5.5 0 3.84-3.4 6.99-8.55 11.76L12 21.35Z" />
        </svg>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleToggleFavorite}
        className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-5 text-[1rem] font-semibold transition ${
          favorite
            ? "border-[#ee4d8c] bg-[#fff0f6] text-[#ee4d8c]"
            : "border-[#f1c7d7] bg-white text-[#2a1f2d] hover:bg-[#fff4f8]"
        }`}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
          <path d="M12 21.35 10.55 20C5.4 15.24 2 12.09 2 8.25 2 5.1 4.42 2.75 7.5 2.75c1.74 0 3.41.81 4.5 2.09a6.01 6.01 0 0 1 4.5-2.09c3.08 0 5.5 2.35 5.5 5.5 0 3.84-3.4 6.99-8.55 11.76L12 21.35Z" />
        </svg>
        <span>{favorite ? "Đã yêu thích" : "Yêu thích"}</span>
      </button>

      {toastMessage ? (
        <div className="fixed bottom-5 left-5 z-[90] flex max-w-[340px] items-center gap-3 rounded-[22px] border border-white bg-[#151116] px-4 py-3 text-white shadow-[0_20px_45px_rgba(0,0,0,0.24)]">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[16px] border border-white/80 bg-white">
            {product.image ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
            ) : (
              <span className="text-sm font-semibold text-[#d8a9bd]">KYO</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[0.95rem] font-bold">{toastMessage}</p>
            <p className="mt-1 line-clamp-2 text-[0.92rem] text-white/90">{product.name}</p>
            <p className="mt-1 text-[0.95rem] font-bold text-[#ff7fae]">{formatPrice(product.price)}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
