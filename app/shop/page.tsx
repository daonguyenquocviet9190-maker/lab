import ProductCard from "@/components/ProductCard";
import { allCatalogProducts } from "@/lib/catalog";

function BrushUnderline({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 36"
      className={`h-4 w-28 text-[#d68b83] ${className}`}
      aria-hidden="true"
    >
      <path
        d="M18 23C47 10 90 10 130 14c31 3 55 8 72 4-8 8-33 14-68 15-34 1-77-4-116-10z"
        fill="currentColor"
        opacity="0.88"
      />
      <path
        d="M27 12c30-7 70-8 104-4 16 2 34 5 50 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

export default function ShopPage() {
  return (
    <div className="bg-white">
      <section className="mx-auto max-w-[1360px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-[2rem] font-medium uppercase tracking-tight text-[#ee4d8c] sm:text-[2.4rem]">
            Shop All
          </h1>
          <BrushUnderline className="mx-auto mt-1" />
        </div>

        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allCatalogProducts.map((product) => (
            <ProductCard
              key={`${product.section}-${product.id}`}
              product={product}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
