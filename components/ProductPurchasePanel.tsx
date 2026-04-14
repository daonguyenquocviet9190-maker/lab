"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getStockLabel, isOutOfStock } from "@/lib/stock";

type PurchaseProduct = {
  slug: string;
  name: string;
  image: string;
  hoverImage?: string;
  price: number;
  oldPrice?: number;
  brand?: string;
  origin?: string;
  sectionLabel?: string;
  categories?: string[];
  stockStatus?: string;
  stock?: number;
};

type CartItem = PurchaseProduct & {
  id: string;
  slug?: string;
  title?: string;
  priceText?: string;
  section?: string;
  category?: string;
  quantity: number;
};

const CART_KEYS = ["kyo-cart", "cart", "kyoauthentic-cart", "kyo_cart"] as const;

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")} đ`;
}

function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  for (const key of CART_KEYS) {
    try {
      const raw = window.localStorage.getItem(key);
      const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      continue;
    }
  }

  return [];
}

function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  for (const key of CART_KEYS) {
    window.localStorage.setItem(key, JSON.stringify(items));
  }

  window.dispatchEvent(new Event("cart-updated"));
}

export default function ProductPurchasePanel({
  product,
}: {
  product: PurchaseProduct;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [toastVisible, setToastVisible] = useState(false);
  const soldOut = isOutOfStock(product);

  const toastPrice = useMemo(() => formatPrice(product.price), [product.price]);

  function upsertCart(nextQuantity: number) {
    const currentCart = readCart();
    const existingIndex = currentCart.findIndex(
      (item) => item.id === product.slug || item.slug === product.slug,
    );

    const normalizedProduct = {
      ...product,
      id: product.slug,
      slug: product.slug,
      title: product.name,
      priceText: formatPrice(product.price),
      section: product.sectionLabel?.toLowerCase() || "product",
      category:
        product.categories && product.categories.length > 0
          ? product.categories[0]
          : product.sectionLabel || "",
      categories: product.categories || [],
    };

    if (existingIndex >= 0) {
      const currentItem = currentCart[existingIndex];
      currentCart[existingIndex] = {
        ...currentItem,
        ...normalizedProduct,
        quantity: (currentItem.quantity || 0) + nextQuantity,
      };
    } else {
      currentCart.push({
        ...normalizedProduct,
        quantity: nextQuantity,
      });
    }

    writeCart(currentCart);
  }

  function showToast() {
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 2600);
  }

  function handleAddToCart() {
    if (soldOut) {
      return;
    }

    upsertCart(quantity);
    showToast();
  }

  function handleBuyNow() {
    if (soldOut) {
      return;
    }

    upsertCart(quantity);
    router.push("/cart");
  }

  return (
    <>
      {toastVisible ? (
        <div className="fixed left-4 top-4 z-[120] w-[min(360px,calc(100vw-2rem))] rounded-[24px] border border-white bg-[#111111] p-3 text-white shadow-[0_20px_45px_rgba(15,23,42,0.28)]">
          <p className="px-1 text-sm font-semibold">Đã thêm vào giỏ hàng</p>
          <div className="mt-3 flex items-center gap-3 rounded-[20px] border border-white/15 bg-white/5 p-2.5">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white bg-white">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="line-clamp-2 text-[0.98rem] font-semibold leading-6 text-white">
                {product.name}
              </p>
              <p className="mt-1 text-[1rem] font-bold text-[#ff6fa4]">
                {toastPrice}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              soldOut
                ? "bg-[#fff1f2] text-[#dc2626]"
                : "bg-[#ecfdf3] text-[#15803d]"
            }`}
          >
            {getStockLabel(product)}
          </span>
          {soldOut ? (
            <span className="text-sm font-medium text-[#dc2626]">
              Hết hàng - liên hệ shop để được hỗ trợ.
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-4">
        <div className="inline-flex h-12 items-center overflow-hidden rounded-xl border border-[#ead9de] bg-white">
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            disabled={soldOut}
            className="inline-flex h-full w-12 items-center justify-center text-[1.25rem] text-slate-600 transition hover:bg-[#fff4f8]"
          >
            -
          </button>
          <span className="inline-flex h-full min-w-12 items-center justify-center border-x border-[#ead9de] px-3 text-[1.05rem] font-semibold text-slate-900">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((current) => current + 1)}
            disabled={soldOut}
            className="inline-flex h-full w-12 items-center justify-center text-[1.25rem] text-slate-600 transition hover:bg-[#fff4f8]"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={soldOut}
          className={`inline-flex h-12 items-center justify-center rounded-xl border px-7 text-[1.05rem] font-semibold transition ${
            soldOut
              ? "cursor-not-allowed border-[#e5e7eb] bg-[#f3f4f6] text-slate-400"
              : "border-[#ee2f78] bg-white text-[#ee2f78] hover:bg-[#fff4f8]"
          }`}
        >
          {soldOut ? "Hết hàng - liên hệ" : "Thêm giỏ hàng"}
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={soldOut}
          className={`inline-flex h-12 items-center justify-center rounded-xl px-7 text-[1.05rem] font-semibold transition ${
            soldOut
              ? "cursor-not-allowed bg-[#e5e7eb] text-slate-400"
              : "bg-[#ee2f78] text-white hover:bg-[#dd246b]"
          }`}
        >
          {soldOut ? "Liên hệ shop" : "Mua ngay"}
        </button>
        </div>
      </div>
    </>
  );
}
