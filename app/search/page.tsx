import Link from "next/link";

import ProductCard from "@/components/ProductCard";
import { allCatalogProducts } from "@/lib/catalog";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const keyword = q.trim();
  const normalizedKeyword = normalizeText(keyword);

  const matchedProducts = keyword
    ? allCatalogProducts.filter((product) => {
        const haystack = normalizeText(
          [
            product.name,
            product.brand,
            product.origin,
            product.sectionLabel,
            ...(product.categories ?? []),
          ].join(" "),
        );

        return haystack.includes(normalizedKeyword);
      })
    : [];

  return (
    <main className="bg-[#f7f3f4]">
      <section className="mx-auto max-w-[1460px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-[#efe4e8] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] sm:p-8">
          <div className="mb-6 text-[0.95rem] text-[#a08f96]">
            <Link href="/" className="transition hover:text-[#ee4d8c]">
              Trang chủ
            </Link>
            <span className="mx-2">/</span>
            <span>Kết quả tìm kiếm</span>
          </div>

          <div className="flex flex-col gap-3 border-b border-[#f1e3e8] pb-6">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#ef4c89]">
              Search
            </p>
            <h1 className="text-[2rem] font-semibold leading-tight text-slate-900 sm:text-[2.3rem]">
              {keyword ? `Kết quả cho "${keyword}"` : "Nhập từ khóa để tìm sản phẩm"}
            </h1>
            <p className="text-[1rem] leading-8 text-slate-600">
              {keyword
                ? `Tìm thấy ${matchedProducts.length} sản phẩm phù hợp.`
                : "Hãy dùng icon tìm kiếm trên header để nhập tên sản phẩm, thương hiệu hoặc danh mục."}
            </p>
          </div>

          {!keyword ? (
            <div className="py-10 text-center text-[1rem] text-slate-600">
              Chưa có từ khóa tìm kiếm.
            </div>
          ) : null}

          {keyword && matchedProducts.length === 0 ? (
            <div className="py-10 text-center text-[1rem] text-slate-600">
              Không tìm thấy sản phẩm phù hợp với từ khóa này.
            </div>
          ) : null}

          {keyword && matchedProducts.length > 0 ? (
            <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
              {matchedProducts.map((product) => (
                <ProductCard key={`search-${product.slug}`} product={product} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
