import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import blogPosts from "@/data/blogPosts.json";
import lipsticks from "@/data/lipsticks.json";
import perfumes from "@/data/perfumes.json";
import products from "@/data/products.json";

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

function SectionHeader({
  title,
  viewMoreHref,
}: {
  title: string;
  viewMoreHref?: string;
}) {
  return (
    <div className="mb-8 text-center">
      {viewMoreHref ? (
        <div className="mb-4">
          <Link
            href={viewMoreHref}
            className="inline-flex items-center gap-2 border border-[#ee4d8c] px-6 py-3 text-[1.05rem] font-semibold text-[#ee4d8c] transition hover:bg-[#ee4d8c] hover:text-white"
          >
            <span>Xem thêm</span>
            <span>↗</span>
          </Link>
        </div>
      ) : null}

      <h2 className="text-[2.3rem] font-medium uppercase tracking-tight text-[#ee4d8c] sm:text-[2.8rem]">
        {title}
      </h2>
      <BrushUnderline className="mx-auto mt-2" />
    </div>
  );
}

function BlogPaintEdge({ position }: { position: "top" | "bottom" }) {
  const isTop = position === "top";

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 z-10 h-7 ${
        isTop ? "top-0" : "bottom-0"
      }`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className={`h-full w-full ${isTop ? "" : "rotate-180"}`}
      >
        <path
          d="M0 48C119 19 240 61 360 47c120-14 240-43 360-27 120 15 240 64 360 50 120-15 240-52 360-38v48H0z"
          fill="#ffffff"
          opacity="0.96"
        />
        <path
          d="M0 62c120-25 240 15 360 0s240-53 360-39 240 58 360 44 240-51 360-34v47H0z"
          fill="#ffffff"
          opacity="0.78"
        />
      </svg>
    </div>
  );
}

function BlogSectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-6 text-center">
      <h2 className="text-[2rem] font-medium uppercase tracking-tight text-[#ee4d8c] sm:text-[2.3rem]">
        {title}
      </h2>
      <BrushUnderline className="mx-auto mt-1" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-white">
      <HeroCarousel />

      <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader title="QUÀ TẶNG HOT" />
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard
              key={`gift-${product.id}`}
              product={{ ...product, section: "gift", slug: `gift-${product.id}` }}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader title="LEGO" viewMoreHref="/shop" />
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {lipsticks.map((product) => (
            <ProductCard
              key={`lipstick-${product.id}`}
              product={{
                ...product,
                section: "lipstick",
                slug: `lipstick-${product.id}`,
              }}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader title="XE" viewMoreHref="/shop" />
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {perfumes.map((product) => (
            <ProductCard
              key={`perfume-${product.id}`}
              product={{
                ...product,
                section: "perfume",
                slug: `perfume-${product.id}`,
              }}
            />
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-r from-[#ffbb8b] via-[#ff9cad] to-[#f57cac]">
        <BlogPaintEdge position="top" />

        <div className="mx-auto max-w-[1360px] px-4 py-8 sm:px-6 lg:px-8">
          <BlogSectionHeader title="BLOG TIN TỨC" />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {blogPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        <BlogPaintEdge position="bottom" />
      </section>
    </div>
  );
}
