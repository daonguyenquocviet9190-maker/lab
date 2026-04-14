import Link from "next/link";
import { notFound } from "next/navigation";
import ProductComments from "@/components/ProductComments";
import ProductDetailGallery from "@/components/ProductDetailGallery";
import ProductDetailTabs from "@/components/ProductDetailTabs";
import ProductCard from "@/components/ProductCard";
import ProductPurchasePanel from "@/components/ProductPurchasePanel";
import giftProducts from "@/data/products.json";
import lipstickProducts from "@/data/lipsticks.json";
import perfumeProducts from "@/data/perfumes.json";
import {
  allCatalogProducts,
  getCatalogProductBySlug,
  getRelatedCatalogProducts,
} from "@/lib/catalog";

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")} đ`;
}

function buildIntro(productName: string, category: string, origin: string) {
  return `${productName} là lựa chọn nổi bật trong nhóm ${category.toLowerCase()}, phù hợp cho khách đang tìm một sản phẩm đẹp mắt, dễ dùng và có xuất xứ ${origin.toLowerCase()}. Thiết kế gọn gàng, tông hình ảnh sang và mức giá dễ chọn giúp sản phẩm này phù hợp để mua dùng cho trẻ em.`;
}

type RawProductMeta = {
  id: number | string;
  slug: string;
  name: string;
  price: number;
  oldPrice?: number;
  image?: string;
  hoverImage?: string;
  brand?: string;
  origin?: string;
  categories?: string[];
  category?: string;
  sectionLabel?: string;
  section?: string;
  stockStatus?: string;
  stock?: number;
};

type ResolvedProduct = {
  slug: string;
  name: string;
  price: number;
  oldPrice: number;
  image: string;
  hoverImage: string;
  brand: string;
  origin: string;
  sectionLabel: string;
  categories: string[];
  discount: number;
};

function getRawProductMeta(slug: string): RawProductMeta | undefined {
  const allProducts = [
    ...giftProducts.map((item) => ({ ...item, slug: `gift-${item.id}` })),
    ...lipstickProducts.map((item) => ({ ...item, slug: `lipstick-${item.id}` })),
    ...perfumeProducts.map((item) => ({ ...item, slug: `perfume-${item.id}` })),
  ];

  return allProducts.find((item) => item.slug === slug) as RawProductMeta | undefined;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getCatalogProductBySlug(id);
  const fallbackProduct = product ? null : getRawProductMeta(id);

  if (!product && !fallbackProduct) {
    notFound();
  }

  const resolvedProduct: ResolvedProduct = product
    ? {
        slug: product.slug,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice ?? product.price,
        image: product.image ?? "",
        hoverImage: product.hoverImage ?? product.image ?? "",
        brand: product.brand ?? "",
        origin: product.origin ?? "",
        sectionLabel: product.sectionLabel,
        categories: product.categories,
        discount: product.discount ?? 0,
      }
    : {
        slug: fallbackProduct!.slug,
        name: fallbackProduct!.name,
        price: fallbackProduct!.price,
        oldPrice: fallbackProduct!.oldPrice ?? fallbackProduct!.price,
        image: fallbackProduct!.image ?? "",
        hoverImage: fallbackProduct!.hoverImage ?? fallbackProduct!.image ?? "",
        brand: fallbackProduct!.brand ?? "",
        origin: fallbackProduct!.origin ?? "",
        sectionLabel: fallbackProduct!.sectionLabel ?? fallbackProduct!.section ?? "Sản phẩm",
        categories: Array.isArray(fallbackProduct!.categories)
          ? fallbackProduct!.categories
          : fallbackProduct!.category
            ? [fallbackProduct!.category]
            : [],
        discount:
          fallbackProduct!.oldPrice && fallbackProduct!.price
            ? Math.max(
                0,
                Math.round(
                  (1 - fallbackProduct!.price / fallbackProduct!.oldPrice) *
                    100,
                ),
              )
            : 0,
      };

  const primaryCategory = resolvedProduct.categories[0] ?? resolvedProduct.sectionLabel;
  const relatedProducts = product
    ? getRelatedCatalogProducts(product, 4)
    : allCatalogProducts.slice(0, 4);
  const sidebarProducts = allCatalogProducts
    .filter((item) => item.slug !== resolvedProduct.slug)
    .slice(0, 5);
  const rawProductMeta = getRawProductMeta(resolvedProduct.slug);

  return (
    <div className="bg-[#f7f3f4]">
      <section className="mx-auto max-w-[1460px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <section className="overflow-hidden rounded-[24px] border border-[#f0e3e7] bg-white shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
              <div className="bg-[#ee5b94] px-5 py-3 text-[1.1rem] font-semibold text-white">
                Sản phẩm khuyến mãi
              </div>

              <div className="space-y-5 p-5">
                {sidebarProducts.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/product/${item.slug}`}
                    className="flex gap-4 rounded-2xl transition hover:bg-[#fff8fb]"
                  >
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#fffdfb]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="line-clamp-3 text-[1rem] font-medium leading-7 text-slate-900">
                        {item.name}
                      </h3>
                      <div className="mt-2 text-sm tracking-[0.14em] text-[#d3c8cc]">
                        {"☆".repeat(5)}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="whitespace-nowrap text-[0.95rem] text-[#f08a8a] line-through">
                          {formatPrice(item.oldPrice)}
                        </span>
                        <span className="whitespace-nowrap text-[1rem] font-bold text-[#ea1b0a]">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="overflow-hidden rounded-[24px] border border-[#f0e3e7] bg-white shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
              <div className="bg-[#ee5b94] px-5 py-3 text-[1.1rem] font-semibold text-white">
                Có thể bạn quan tâm
              </div>

              <div className="space-y-5 p-5">
                {relatedProducts.map((item) => (
                  <Link
                    key={`interest-${item.slug}`}
                    href={`/product/${item.slug}`}
                    className="flex gap-4 rounded-2xl transition hover:bg-[#fff8fb]"
                  >
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#fffdfb]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="line-clamp-3 text-[1rem] font-medium leading-7 text-slate-900">
                        {item.name}
                      </h3>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="whitespace-nowrap text-[0.95rem] text-[#f08a8a] line-through">
                          {formatPrice(item.oldPrice)}
                        </span>
                        <span className="whitespace-nowrap text-[1rem] font-bold text-[#ea1b0a]">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </aside>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-[#efe4e8] bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:p-7">
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_520px]">
                <div>
                  <div className="mb-5 text-[0.98rem] text-[#a08f96]">
                    <Link href="/" className="transition hover:text-[#ee4d8c]">
                      Trang chủ
                    </Link>
                    <span className="mx-2">/</span>
                    <Link href="/shop" className="transition hover:text-[#ee4d8c]">
                      {resolvedProduct.sectionLabel}
                    </Link>
                    <span className="mx-2">/</span>
                    <span>{resolvedProduct.brand}</span>
                  </div>

                  <h1 className="max-w-[820px] text-[2rem] font-semibold leading-[1.28] text-slate-900 sm:text-[2.35rem]">
                    {resolvedProduct.name}
                  </h1>

                  <div className="mt-5 flex flex-wrap items-end gap-3">
                    <span className="text-[1.8rem] font-bold text-[#ea1b0a] sm:text-[2.1rem]">
                      {formatPrice(resolvedProduct.price)}
                    </span>
                    <span className="text-[1.15rem] text-[#f08a8a] line-through">
                      {formatPrice(resolvedProduct.oldPrice)}
                    </span>
                    <span className="rounded-full bg-[#fff0f6] px-3 py-1 text-sm font-semibold text-[#ee4d8c]">
                      Giảm {resolvedProduct.discount}%
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <span className="rounded-full bg-[#fff4f8] px-4 py-2 text-sm font-medium text-[#d1578f]">
                      Danh mục: {resolvedProduct.categories.join(" • ")}
                    </span>
                    <span className="rounded-full bg-[#fff4f8] px-4 py-2 text-sm font-medium text-[#d1578f]">
                      Xuất xứ: {resolvedProduct.origin}
                    </span>
                    <span className="rounded-full bg-[#fff4f8] px-4 py-2 text-sm font-medium text-[#d1578f]">
                      Thương hiệu: {resolvedProduct.brand}
                    </span>
                  </div>

                  <p className="mt-6 text-[1.05rem] leading-9 text-slate-700">
                    {buildIntro(resolvedProduct.name, primaryCategory, resolvedProduct.origin)}
                  </p>

                  <ProductPurchasePanel
                    product={{
                      slug: resolvedProduct.slug,
                      name: resolvedProduct.name,
                      image: resolvedProduct.image,
                      hoverImage: resolvedProduct.hoverImage,
                      price: resolvedProduct.price,
                      oldPrice: resolvedProduct.oldPrice,
                      brand: resolvedProduct.brand,
                      origin: resolvedProduct.origin,
                      sectionLabel: resolvedProduct.sectionLabel,
                      categories: resolvedProduct.categories,
                      stockStatus:
                        typeof rawProductMeta?.stockStatus === "string"
                          ? rawProductMeta.stockStatus
                          : undefined,
                      stock:
                        typeof rawProductMeta?.stock === "number"
                          ? rawProductMeta.stock
                          : undefined,
                    }}
                  />

                  <div className="mt-8 rounded-[24px] border border-[#efe4e8] bg-[#fffdfd] p-5">
                    <h2 className="text-[1.45rem] font-semibold text-slate-900">
                      Chi tiết sản phẩm
                    </h2>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-[#fff7fa] px-4 py-3">
                        <p className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[#d1578f]">
                          Tên sản phẩm
                        </p>
                        <p className="mt-2 text-[0.95rem] leading-7 text-slate-800">
                          {resolvedProduct.name}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#fff7fa] px-4 py-3">
                        <p className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[#d1578f]">
                          Giá bán
                        </p>
                        <p className="mt-2 text-[0.95rem] leading-7 text-slate-800">
                          {formatPrice(resolvedProduct.price)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#fff7fa] px-4 py-3">
                        <p className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[#d1578f]">
                          Categories
                        </p>
                        <p className="mt-2 text-[0.95rem] leading-7 text-slate-800">
                          {resolvedProduct.categories.join(" • ")}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#fff7fa] px-4 py-3">
                        <p className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[#d1578f]">
                          Origin
                        </p>
                        <p className="mt-2 text-[0.95rem] leading-7 text-slate-800">
                          {resolvedProduct.origin}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <ProductDetailGallery
                    name={resolvedProduct.name}
                    image={resolvedProduct.image}
                    hoverImage={resolvedProduct.hoverImage}
                  />

                  <div className="mt-6 rounded-[24px] border border-[#efe4e8] bg-white p-5">
                    <h2 className="text-[1.5rem] font-semibold text-slate-900">
                      Hỗ trợ mua hàng
                    </h2>
                    <div className="mt-4 space-y-3 text-[1.06rem] text-slate-800">
                      <p>
                        <span className="font-semibold">Hotline:</span> 0975 436 989
                      </p>
                      <p>
                        <span className="font-semibold">Zalo / iMessage:</span> hỗ
                        trợ nhanh trong ngày
                      </p>
                      <p className="text-[#ee4d8c]">
                        Hàng chính hãng, kiểm tra trước khi nhận.
                      </p>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        className="rounded-2xl bg-[#ee2f78] px-6 py-4 text-[1.2rem] font-semibold text-white transition hover:bg-[#dd246b]"
                      >
                        Gọi ngay
                      </button>
                      <button
                        type="button"
                        className="rounded-2xl border border-[#ee2f78] bg-white px-6 py-4 text-[1.2rem] font-semibold text-[#ee2f78] transition hover:bg-[#fff4f8]"
                      >
                        Chat Zalo
                      </button>
                    </div>

                    <p className="mt-5 text-[1rem] leading-8 text-slate-600">
                      Tư vấn 24/7, giao hàng toàn quốc, hỗ trợ quà tặng và set quà
                      theo nhu cầu.
                    </p>
                  </div>
                </div>
                <div className="xl:col-span-2">
                  <ProductDetailTabs
                    name={resolvedProduct.name}
                    brand={resolvedProduct.brand}
                    origin={resolvedProduct.origin}
                    categories={resolvedProduct.categories}
                    price={resolvedProduct.price}
                  />
                </div>
              </div>
            </section>

            <ProductComments productName={resolvedProduct.name} productKey={resolvedProduct.slug} />

            <section className="rounded-[28px] border border-[#efe4e8] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
              <h2 className="text-[2rem] font-semibold text-slate-900">
                Sản phẩm tương tự
              </h2>

              <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
                {relatedProducts.map((item) => (
                  <ProductCard key={`related-${item.slug}`} product={item} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
