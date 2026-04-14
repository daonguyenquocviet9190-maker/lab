"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import ProductCard from "@/components/ProductCard";
import type { CatalogProduct } from "@/lib/catalog";

type GiftCatalogPageProps = {
  items: CatalogProduct[];
};

type SortValue = "newest" | "price-asc" | "price-desc" | "discount-desc";

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")} đ`;
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#ece5e5] bg-white shadow-[0_6px_18px_rgba(15,23,42,0.035)]">
      <div className="bg-[#ee5b94] px-3.5 py-2 text-[0.98rem] font-semibold text-white">
        {title}
      </div>
      <div className="px-3.5 py-2.5">{children}</div>
    </section>
  );
}

function FilterList({
  options,
  selected,
  onSelect,
  maxHeight = "max-h-[300px]",
}: {
  options: Array<{ label: string; count: number }>;
  selected: string | null;
  onSelect: (value: string | null) => void;
  maxHeight?: string;
}) {
  return (
    <div
      className={`${maxHeight} space-y-1 overflow-y-auto pr-1`}
      style={{ scrollbarWidth: "thin" }}
    >
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[0.9rem] leading-6 transition ${
          selected === null
            ? "bg-[#fff1f7] font-medium text-[#e83e84]"
            : "text-slate-700 hover:bg-slate-50"
        }`}
      >
        <span>Tất cả</span>
      </button>

      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => onSelect(option.label)}
          className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[0.9rem] leading-6 transition ${
            selected === option.label
              ? "bg-[#fff1f7] font-medium text-[#e83e84]"
              : "text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span>{option.label}</span>
          <span className="text-xs text-slate-400">({option.count})</span>
        </button>
      ))}
    </div>
  );
}

function PriceRangePanel({
  min,
  max,
  draftMin,
  draftMax,
  onDraftMinChange,
  onDraftMaxChange,
  onApply,
}: {
  min: number;
  max: number;
  draftMin: number;
  draftMax: number;
  onDraftMinChange: (value: number) => void;
  onDraftMaxChange: (value: number) => void;
  onApply: () => void;
}) {
  return (
    <FilterSection title="Khoảng giá">
      <div className="space-y-3">
        <div className="relative pt-1">
          <div className="h-1.5 rounded-full bg-slate-300" />
          <input
            type="range"
            min={min}
            max={max}
            value={draftMin}
            onChange={(event) =>
              onDraftMinChange(
                Math.min(Number(event.target.value), Math.max(draftMax - 1000, min)),
              )
            }
            className="pointer-events-none absolute inset-x-0 top-0 h-4 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#6d6d6d] [&::-webkit-slider-thumb]:shadow-none"
          />
          <input
            type="range"
            min={min}
            max={max}
            value={draftMax}
            onChange={(event) =>
              onDraftMaxChange(
                Math.max(Number(event.target.value), Math.min(draftMin + 1000, max)),
              )
            }
            className="pointer-events-none absolute inset-x-0 top-0 h-4 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#6d6d6d] [&::-webkit-slider-thumb]:shadow-none"
          />
        </div>

        <p className="text-center text-[0.9rem] font-semibold text-slate-800">
          Giá {formatPrice(draftMin)} - {formatPrice(draftMax)}
        </p>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onApply}
            className="rounded-full bg-[#6d6d6d] px-4 py-1.5 text-[0.9rem] font-semibold text-white transition hover:bg-[#5b5b5b]"
          >
            Lọc
          </button>
        </div>
      </div>
    </FilterSection>
  );
}

function buildOptions(values: string[]) {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b, "vi"))
    .map(([label, count]) => ({ label, count }));
}

export default function GiftCatalogPage({ items }: GiftCatalogPageProps) {
  const absoluteMinPrice = useMemo(
    () => Math.min(...items.map((item) => item.price)),
    [items],
  );
  const absoluteMaxPrice = useMemo(
    () => Math.max(...items.map((item) => item.price)),
    [items],
  );

  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<string | null>(null);
  const [selectedDiscount, setSelectedDiscount] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortValue>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [draftMinPrice, setDraftMinPrice] = useState(absoluteMinPrice);
  const [draftMaxPrice, setDraftMaxPrice] = useState(absoluteMaxPrice);
  const [selectedMinPrice, setSelectedMinPrice] = useState(absoluteMinPrice);
  const [selectedMaxPrice, setSelectedMaxPrice] = useState(absoluteMaxPrice);

  useEffect(() => {
    setDraftMinPrice(absoluteMinPrice);
    setDraftMaxPrice(absoluteMaxPrice);
    setSelectedMinPrice(absoluteMinPrice);
    setSelectedMaxPrice(absoluteMaxPrice);
  }, [absoluteMinPrice, absoluteMaxPrice]);

  const brandOptions = useMemo(
    () => buildOptions(items.map((item) => item.brand)),
    [items],
  );

  const categoryOptions = useMemo(
    () =>
      buildOptions(
        items.flatMap((item) =>
          item.categories.length ? item.categories : ["Khác"],
        ),
      ),
    [items],
  );

  const originOptions = useMemo(
    () => buildOptions(items.map((item) => item.origin)),
    [items],
  );

  const discountOptions = useMemo(
    () =>
      [...new Set(items.map((item) => item.discount))]
        .sort((a, b) => a - b)
        .map((value) => ({
          label: `Giảm từ ${value}%`,
          count: items.filter((item) => item.discount >= value).length,
          value: String(value),
        })),
    [items],
  );

  const filteredItems = useMemo(() => {
    const nextItems = items.filter((item) => {
      if (selectedBrand && item.brand !== selectedBrand) {
        return false;
      }

      if (
        selectedCategory &&
        !item.categories.some((category) => category === selectedCategory)
      ) {
        return false;
      }

      if (selectedOrigin && item.origin !== selectedOrigin) {
        return false;
      }

      if (selectedDiscount && item.discount < Number(selectedDiscount)) {
        return false;
      }

      if (item.price < selectedMinPrice || item.price > selectedMaxPrice) {
        return false;
      }

      return true;
    });

    if (sortBy === "price-asc") {
      return [...nextItems].sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-desc") {
      return [...nextItems].sort((a, b) => b.price - a.price);
    }

    if (sortBy === "discount-desc") {
      return [...nextItems].sort((a, b) => b.discount - a.discount);
    }

    return nextItems;
  }, [
    items,
    selectedBrand,
    selectedCategory,
    selectedOrigin,
    selectedDiscount,
    selectedMinPrice,
    selectedMaxPrice,
    sortBy,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedBrand,
    selectedCategory,
    selectedOrigin,
    selectedDiscount,
    selectedMinPrice,
    selectedMaxPrice,
    sortBy,
  ]);

  const itemsPerPage = 12;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * itemsPerPage;
  const pagedItems = filteredItems.slice(pageStart, pageStart + itemsPerPage);
  const rangeStart = filteredItems.length === 0 ? 0 : pageStart + 1;
  const rangeEnd = Math.min(pageStart + itemsPerPage, filteredItems.length);

  return (
    <div className="bg-white">
      <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 text-[0.95rem] text-slate-400">
          <Link href="/" className="transition hover:text-[#ee4d8c]">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <span className="font-semibold text-slate-800">Quà Tặng</span>
        </div>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-[2.15rem] font-semibold text-slate-900 sm:text-[2.55rem]">
              Quà Tặng Hot
            </h1>
          </div>

          <div className="flex flex-col gap-3 text-sm text-slate-700 sm:flex-row sm:items-center">
            <p className="text-[1.06rem]">
              Hiển thị {rangeStart}-{rangeEnd} của {filteredItems.length} kết quả
            </p>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortValue)}
              className="h-13 min-w-[270px] rounded-full border border-[#e8dede] bg-white px-5 text-[1rem] text-slate-700 outline-none transition focus:border-[#ee4d8c]"
            >
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
              <option value="discount-desc">Giảm giá nhiều nhất</option>
            </select>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[292px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <FilterSection title="Thương hiệu">
              <FilterList
                options={brandOptions}
                selected={selectedBrand}
                onSelect={setSelectedBrand}
                maxHeight="max-h-[360px]"
              />
            </FilterSection>

            <FilterSection title="Categories">
              <FilterList
                options={categoryOptions}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
                maxHeight="max-h-[240px]"
              />
            </FilterSection>

            <FilterSection title="Xuất xứ">
              <FilterList
                options={originOptions}
                selected={selectedOrigin}
                onSelect={setSelectedOrigin}
                maxHeight="max-h-[220px]"
              />
            </FilterSection>

            <FilterSection title="Mức giảm giá">
              <div
                className="max-h-[360px] space-y-1 overflow-y-auto pr-1"
                style={{ scrollbarWidth: "thin" }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedDiscount(null)}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[0.9rem] leading-6 transition ${
                    selectedDiscount === null
                      ? "bg-[#fff1f7] font-medium text-[#e83e84]"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>Tất cả</span>
                </button>

                {discountOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedDiscount(option.value)}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[0.9rem] leading-6 transition ${
                      selectedDiscount === option.value
                        ? "bg-[#fff1f7] font-medium text-[#e83e84]"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{option.label}</span>
                    <span className="text-xs text-slate-400">({option.count})</span>
                  </button>
                ))}
              </div>
            </FilterSection>

            <PriceRangePanel
              min={absoluteMinPrice}
              max={absoluteMaxPrice}
              draftMin={draftMinPrice}
              draftMax={draftMaxPrice}
              onDraftMinChange={setDraftMinPrice}
              onDraftMaxChange={setDraftMaxPrice}
              onApply={() => {
                setSelectedMinPrice(draftMinPrice);
                setSelectedMaxPrice(draftMaxPrice);
              }}
            />
          </aside>

          <div>
            <div className="grid gap-x-7 gap-y-11 sm:grid-cols-2 xl:grid-cols-4">
              {pagedItems.map((product) => (
                <ProductCard
                  key={`${product.section}-${product.id}`}
                  product={product}
                />
              ))}
            </div>

            {pagedItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#f1c7d8] bg-[#fff8fb] px-6 py-12 text-center text-slate-500">
                Không có sản phẩm phù hợp với bộ lọc hiện tại.
              </div>
            ) : null}

            {totalPages > 1 ? (
              <div className="mt-12 flex justify-center gap-3">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition ${
                        page === safePage
                          ? "border-[#ee4d8c] bg-[#ee4d8c] text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-[#ee4d8c] hover:text-[#ee4d8c]"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
