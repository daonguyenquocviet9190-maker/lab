"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  clearCart,
  getCartCount,
  getCartItemKey,
  recoverCartItem,
  readCart,
  removeCartItem,
  type CartItem,
  updateCartItemQuantity,
  writeCart,
} from "../../lib/cart";

function formatPrice(value: number) {
  if (!value) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN").format(value) + " đ";
}

function getItemDisplayName(item: CartItem) {
  return String(item.name ?? item.title ?? "Sản phẩm");
}

function getItemDisplayPrice(item: CartItem) {
  const price = Number(item.price) || 0;

  if (price > 0) {
    return formatPrice(price);
  }

  if (typeof item.priceText === "string" && item.priceText.trim().length > 0) {
    return item.priceText.trim();
  }

  return "Liên hệ";
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const syncCart = () => {
      setCart(readCart());
    };

    syncCart();

    window.addEventListener("storage", syncCart);
    window.addEventListener("cart-updated", syncCart as EventListener);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("cart-updated", syncCart as EventListener);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const recoverInvalidItems = async () => {
      const invalidItems = cart.filter(
        (item) =>
          (!Number(item.price) || !item.priceText) &&
          String(item.slug ?? item.productId ?? item.id ?? "").trim().length > 0
      );

      if (invalidItems.length === 0) return;

      const recovered = await Promise.all(
        cart.map((item) =>
          !Number(item.price) || !item.priceText ? recoverCartItem(item) : item
        )
      );

      if (cancelled) return;

      const hasChanged =
        JSON.stringify(recovered.map((item) => [item.name, item.price, item.priceText])) !==
        JSON.stringify(cart.map((item) => [item.name, item.price, item.priceText]));

      if (hasChanged) {
        writeCart(recovered);
        setCart(recovered);
      }
    };

    recoverInvalidItems();

    return () => {
      cancelled = true;
    };
  }, [cart]);

  const totalItems = getCartCount(cart);
  const subtotal = cart.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    return sum + price * quantity;
  }, 0);
  const hasInvalidPrice = cart.some((item) => !Number(item.price));

  const handleDecrease = (item: CartItem) => {
    const key = getCartItemKey(item);
    const nextQuantity = Math.max(1, (Number(item.quantity) || 1) - 1);
    setCart(updateCartItemQuantity(key, nextQuantity));
  };

  const handleIncrease = (item: CartItem) => {
    const key = getCartItemKey(item);
    const nextQuantity = (Number(item.quantity) || 1) + 1;
    setCart(updateCartItemQuantity(key, nextQuantity));
  };

  const handleRemove = (item: CartItem) => {
    setCart(removeCartItem(getCartItemKey(item)));
  };

  const handleClear = () => {
    clearCart();
    setCart([]);
  };

  return (
    <main className="mx-auto w-full max-w-[1540px] px-4 py-8 lg:px-8">
      <section className="rounded-[28px] border border-[#f3d6df] bg-white shadow-[0_18px_48px_rgba(224,112,146,0.08)]">
        <div className="flex flex-col gap-4 border-b border-[#f7dfe6] px-6 py-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ec3a7a]">
              Giỏ hàng
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[#16111d]">
              Sản phẩm bạn đã chọn
            </h1>
            <p className="mt-2 text-base text-[#6b5b61]">
              Hiện có {totalItems} sản phẩm trong giỏ hàng của bạn.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/shop"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#f1d8de] px-5 text-sm font-semibold text-[#16111d] transition hover:border-[#ec3a7a] hover:text-[#ec3a7a]"
            >
              Tiếp tục mua sắm
            </Link>
            {cart.length > 0 ? (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#fff1f6] px-5 text-sm font-semibold text-[#ec3a7a] transition hover:bg-[#ffe2ee]"
              >
                Xóa toàn bộ
              </button>
            ) : null}
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-3xl font-bold text-[#16111d]">Giỏ hàng của bạn đang trống</p>
            <p className="mt-3 text-base text-[#6b5b61]">
              Hãy quay về cửa hàng và thêm sản phẩm để tiếp tục mua sắm.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#ec3a7a] px-7 text-base font-semibold text-white transition hover:bg-[#d82d69]"
            >
              Đi đến cửa hàng
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 px-6 py-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              {hasInvalidPrice ? (
                <div className="rounded-[20px] border border-[#f7d6df] bg-[#fff7fa] px-5 py-4 text-sm text-[#7a6168]">
                  Có sản phẩm đang có giá không hợp lệ từ dữ liệu cũ. Hãy xóa và thêm
                  lại sản phẩm đó để cập nhật đúng giá.
                </div>
              ) : null}

              {cart.map((item) => {
                const itemKey = getCartItemKey(item);
                const quantity = Number(item.quantity) || 1;
                const price = Number(item.price) || 0;
                const image =
                  typeof item.image === "string" && item.image.length > 0
                    ? item.image
                    : "/images/logo-kyo.png";

                return (
                  <article
                    key={itemKey}
                    className="flex flex-col gap-4 rounded-[24px] border border-[#f5dfe6] bg-[#fffafb] p-4 md:flex-row md:items-center"
                  >
                    <div className="h-28 w-28 overflow-hidden rounded-[20px] border border-[#f3d6df] bg-white">
                      <img
                        src={image}
                        alt={String(item.name ?? item.title ?? "Sản phẩm")}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl font-bold leading-snug text-[#16111d]">
                        {getItemDisplayName(item)}
                      </h2>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#7b6971]">
                        <span className="rounded-full bg-[#fff1f6] px-3 py-1 text-[#ec3a7a]">
                          Mã: {item.slug ?? item.productId ?? item.id ?? "N/A"}
                        </span>
                        <span>Đơn giá: {getItemDisplayPrice(item)}</span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        <div className="inline-flex h-12 items-center rounded-2xl border border-[#ecd6de] bg-white">
                          <button
                            type="button"
                            onClick={() => handleDecrease(item)}
                            className="flex h-12 w-12 items-center justify-center text-xl font-semibold text-[#7e6c74]"
                          >
                            -
                          </button>
                          <span className="flex h-12 min-w-12 items-center justify-center border-x border-[#ecd6de] px-4 text-base font-semibold text-[#16111d]">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleIncrease(item)}
                            className="flex h-12 w-12 items-center justify-center text-xl font-semibold text-[#7e6c74]"
                          >
                            +
                          </button>
                        </div>

                        <p className="text-xl font-bold text-[#ec3a7a]">
                          {price > 0
                            ? formatPrice(price * quantity)
                            : getItemDisplayPrice(item)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-[#f1d8de] px-5 text-sm font-semibold text-[#6b5b61] transition hover:border-[#ec3a7a] hover:text-[#ec3a7a]"
                    >
                      Xóa
                    </button>
                  </article>
                );
              })}
            </div>

            <aside className="rounded-[28px] border border-[#f5dfe6] bg-[#fff7fa] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ec3a7a]">
                Tóm tắt đơn hàng
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[#16111d]">
                Thanh toán
              </h2>

              <div className="mt-6 space-y-4 text-[#4f4349]">
                <div className="flex items-center justify-between text-base">
                  <span>Số lượng sản phẩm</span>
                  <span className="font-semibold text-[#16111d]">{totalItems}</span>
                </div>
                <div className="flex items-center justify-between text-base">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-[#16111d]">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-base">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold text-[#16111d]">Tính ở bước sau</span>
                </div>
              </div>

              <div className="mt-6 border-t border-[#f0dbe3] pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-[#16111d]">Tổng cộng</span>
                  <span className="text-3xl font-bold text-[#ec3a7a]">
                    {hasInvalidPrice ? "Liên hệ" : formatPrice(subtotal)}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  href="/checkout"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#ec3a7a] px-6 text-base font-semibold text-white transition hover:bg-[#d82d69]"
                >
                  Tiến hành thanh toán
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#f1d8de] px-6 text-base font-semibold text-[#16111d] transition hover:border-[#ec3a7a] hover:text-[#ec3a7a]"
                >
                  Mua thêm sản phẩm
                </Link>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
