"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import rawBanners from "@/data/banners.json";

type BannerRecord = {
  id?: string | number;
  title?: string;
  heading?: string;
  subtitle?: string;
  description?: string;
  ctaLabel?: string;
  buttonText?: string;
  href?: string;
  link?: string;
  image?: string;
  imageUrl?: string;
  src?: string;
  active?: boolean;
  enabled?: boolean;
};

type BannerItem = {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  href: string;
  image: string;
};

const fallbackBanners: BannerItem[] = [
  {
    id: "fallback-1",
    title: "Cosmetics Mykingdom",
    subtitle: "Ưu đãi quà tặng và đồ chơi chính hãng",
    ctaLabel: "Shop Now",
    href: "/shop",
    image: "/images/banner-kyo-1.jpg",
  },
  {
    id: "fallback-2",
    title: "Mykingdom",
    subtitle: "Bộ sưu tập mới đã lên kệ",
    ctaLabel: "Xem sản phẩm",
    href: "/shop",
    image: "/images/banner-kyo-3-2048x1024.jpg",
  },
  {
    id: "fallback-3",
    title: "Ưu đãi nổi bật",
    subtitle: "Săn deal quà tặng, son môi, nước hoa",
    ctaLabel: "Mua ngay",
    href: "/shop",
    image: "/images/banner-kyo-4-2048x1024 (1).jpg",
  },
];

const fallbackBannerImage =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 700">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff7f8" />
          <stop offset="100%" stop-color="#ffe1eb" />
        </linearGradient>
      </defs>
      <rect width="1600" height="700" fill="url(#bg)" />
      <text x="800" y="290" font-size="78" text-anchor="middle" fill="#ef3f7d" font-family="Arial">Mykingdom</text>
      <text x="800" y="370" font-size="30" text-anchor="middle" fill="#5b4a51" font-family="Arial">Banner dang duoc cap nhat</text>
    </svg>
  `);

function normalizeAssetPath(value?: string | null) {
  if (!value) {
    return "";
  }

  if (/^(https?:)?\/\//.test(value) || value.startsWith("data:")) {
    return value;
  }

  return value.startsWith("/") ? value : `/${value}`;
}

function normalizeBanner(record: BannerRecord, index: number): BannerItem | null {
  if (record.active === false || record.enabled === false) {
    return null;
  }

  const image = normalizeAssetPath(record.image ?? record.imageUrl ?? record.src);

  return {
    id: String(record.id ?? `banner-${index + 1}`),
    title: record.title ?? record.heading ?? "Mykingdom",
    subtitle:
      record.subtitle ??
      record.description ??
      "Mỹ phẩm chính hãng và quà tặng cao cấp",
    ctaLabel: record.ctaLabel ?? record.buttonText ?? "Xem ngay",
    href: record.href ?? record.link ?? "/shop",
    image: image || fallbackBanners[index % fallbackBanners.length].image,
  };
}

export default function HeroCarousel() {
  const banners = useMemo(() => {
    const source = Array.isArray(rawBanners) ? rawBanners : [];
    const normalized = source
      .map((item, index) => normalizeBanner(item as BannerRecord, index))
      .filter((item): item is BannerItem => Boolean(item));

    return normalized.length > 0 ? normalized : fallbackBanners;
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [banners.length]);

  const currentBanner = banners[activeIndex] ?? fallbackBanners[0];

  return (
    <section className="relative w-full overflow-hidden bg-[#fff7f8]">
      <div className="relative h-[300px] w-full sm:h-[420px] lg:h-[540px]">
        <img
          src={currentBanner.image || fallbackBannerImage}
          alt={currentBanner.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />

        <div className="absolute inset-x-0 bottom-8 mx-auto flex max-w-[1440px] items-end justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[520px] rounded-[28px] bg-white/82 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-sm sm:p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ef3f7d]">
              Mykingdom
            </p>
            <h2 className="mt-3 text-[1.7rem] font-semibold leading-tight text-[#1a1730] sm:text-[2.4rem]">
              {currentBanner.title}
            </h2>
            <p className="mt-3 text-[1rem] leading-7 text-[#5b4a51] sm:text-[1.08rem]">
              {currentBanner.subtitle}
            </p>
            <Link
              href={currentBanner.href}
              className="mt-5 inline-flex items-center rounded-full bg-[#ef3f7d] px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#d92d69]"
            >
              {currentBanner.ctaLabel}
            </Link>
          </div>

          <div className="hidden items-center gap-3 rounded-full bg-white/82 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-sm md:flex">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`Xem banner ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`h-3.5 w-3.5 rounded-full transition ${
                  index === activeIndex ? "bg-[#ef3f7d]" : "bg-[#f5b7cc]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
