import Link from "next/link";

type ProductRecord = {
  id: string | number;
  slug?: string;
  name: string;
  image?: string;
  hoverImage?: string;
  price: number;
  oldPrice?: number;
  categories?: string[];
  sectionLabel?: string;
  section?: string;
  stockStatus?: string;
  stock?: number;
  quantity?: number;
  inventory?: number;
  inStock?: boolean;
};

const fallbackProductImage =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 520">
      <rect width="520" height="520" rx="36" fill="#fff4f8"/>
      <text x="260" y="235" text-anchor="middle" font-size="40" fill="#ef3f7d" font-family="Arial">KYO</text>
      <text x="260" y="290" text-anchor="middle" font-size="24" fill="#6b5f66" font-family="Arial">No Image</text>
    </svg>
  `);

function formatPrice(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "";
  }

  return `${value.toLocaleString("vi-VN")} đ`;
}

function normalizeAssetPath(value?: string | null) {
  if (!value) {
    return fallbackProductImage;
  }

  if (/^(https?:)?\/\//.test(value) || value.startsWith("data:")) {
    return value;
  }

  return value.startsWith("/") ? value : `/${value}`;
}

function getCategoryLabel(product: ProductRecord) {
  if (Array.isArray(product.categories) && product.categories.length > 0) {
    return product.categories.join(" • ").toUpperCase();
  }

  if (product.sectionLabel) {
    return product.sectionLabel.toUpperCase();
  }

  if (product.section) {
    return product.section.toUpperCase();
  }

  return "SẢN PHẨM NỔI BẬT";
}

function isOutOfStock(product: ProductRecord) {
  if (typeof product.inStock === "boolean") {
    return !product.inStock;
  }

  const numericStock = [product.stock, product.quantity, product.inventory].find(
    (value) => typeof value === "number",
  );

  if (typeof numericStock === "number") {
    return numericStock <= 0;
  }

  return String(product.stockStatus ?? "")
    .toLowerCase()
    .includes("out");
}

export default function ProductCard({ product }: { product: ProductRecord }) {
  const href = `/product/${product.slug ?? product.id}`;
  const mainImage = normalizeAssetPath(product.image);
  const hoverImage = product.hoverImage
    ? normalizeAssetPath(product.hoverImage)
    : mainImage;
  const soldOut = isOutOfStock(product);

  return (
    <article className="group flex h-full flex-col text-center">
      <div className="relative overflow-hidden rounded-[26px] bg-white">
        <span
          className={`absolute left-4 top-4 z-10 rounded-full px-4 py-2 text-[0.82rem] font-semibold uppercase tracking-[0.14em] ${
            soldOut
              ? "bg-[#fff1f1] text-[#e34646]"
              : "bg-[#ebfff2] text-[#0a8f55]"
          }`}
        >
          {soldOut ? "Hết hàng" : "Còn hàng"}
        </span>

        <Link href={href} className="block">
          <div className="relative aspect-[4/4.45] overflow-hidden bg-white">
            <img
              src={mainImage}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-contain p-5 transition duration-500 group-hover:scale-[1.02] group-hover:opacity-0"
            />
            <img
              src={hoverImage}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-contain p-5 opacity-0 transition duration-500 group-hover:scale-[1.02] group-hover:opacity-100"
            />
          </div>
        </Link>
      </div>

      <div className="mt-6 flex flex-1 flex-col">
        <p className="text-[0.92rem] uppercase tracking-[0.28em] text-[#d9638e]">
          {getCategoryLabel(product)}
        </p>

        <Link href={href} className="mt-4 block">
          <h3 className="text-[1rem] font-semibold leading-10 text-[#171530]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-5 flex items-center justify-center gap-2 text-[0.98rem]">
          {typeof product.oldPrice === "number" ? (
            <span className="text-[#f09ca8] line-through">
              {formatPrice(product.oldPrice)}
            </span>
          ) : null}
          <span className="font-bold text-[#ef230f]">
            {formatPrice(product.price)}
          </span>
        </div>

        <div className="mt-5 text-[1rem] tracking-[0.18em] text-[#ff4a86]">
          {"★★★★★"}
        </div>

        <Link
          href={href}
          className={`mt-8 inline-flex h-14 items-center justify-center rounded-full px-8 text-[1.02rem] font-semibold uppercase transition ${
            soldOut
              ? "border border-[#f2ccd8] bg-white text-[#d9537f] hover:bg-[#fff6f8]"
              : "bg-[#ef3f7d] text-white hover:bg-[#d92d69]"
          }`}
        >
          {soldOut ? "Hết hàng - Liên hệ" : "Mua ngay"}
        </Link>
      </div>
    </article>
  );
}
