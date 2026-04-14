import products from "@/data/products.json";
import lipsticks from "@/data/lipsticks.json";
import perfumes from "@/data/perfumes.json";

type SourceProduct = {
  id: number;
  name: string;
  image: string;
  hoverImage?: string;
  categories?: string[];
  origin?: string;
  oldPrice: number;
  price: number;
  discount: number;
  rating?: number;
};

export type CatalogProduct = {
  id: number;
  slug: string;
  name: string;
  image: string;
  hoverImage?: string;
  categories: string[];
  origin: string;
  oldPrice: number;
  price: number;
  discount: number;
  rating: number;
  brand: string;
  section: "gift" | "lipstick" | "perfume";
  sectionLabel: string;
};

function inferBrand(name: string) {
  if (name.includes("Dior")) return "Dior";
  if (name.includes("Gucci")) return "Gucci";
  if (name.includes("Hermes") || name.includes("Hermès")) return "Hermès";
  if (name.includes("YSL")) return "YSL";
  if (name.includes("Bvlgari")) return "Bvlgari";
  if (name.includes("Kenzo")) return "Kenzo";
  if (name.includes("Le Labo")) return "Le Labo";
  if (name.includes("Maison Margiela")) return "Maison Margiela";
  if (name.includes("Narciso")) return "Narciso Rodriguez";
  if (name.includes("Armani")) return "Armani";
  if (name.includes("Chanel")) return "Chanel";
  if (name.includes("Batious")) return "Batious";
  if (name.includes("3CE")) return "3CE";
  if (name.includes("KYO")) return "KYO Authentic";
  return "KYO Authentic";
}

function inferOrigin(name: string) {
  if (name.includes("Gucci") || name.includes("Bvlgari")) return "Italy";
  if (
    name.includes("Dior") ||
    name.includes("YSL") ||
    name.includes("Hermes") ||
    name.includes("Hermès") ||
    name.includes("Kenzo") ||
    name.includes("Chanel")
  ) {
    return "Pháp";
  }

  if (
    name.includes("Le Labo") ||
    name.includes("Maison Margiela") ||
    name.includes("Narciso") ||
    name.includes("Armani")
  ) {
    return "Mỹ";
  }

  if (name.includes("Batious") || name.includes("3CE")) return "Hàn Quốc";
  return "Pháp";
}

function mapProducts(
  sourceKey: CatalogProduct["section"],
  sectionLabel: string,
  items: SourceProduct[],
): CatalogProduct[] {
  return items.map((item) => ({
    id: item.id,
    slug: `${sourceKey}-${item.id}`,
    name: item.name,
    image: item.image,
    hoverImage: item.hoverImage,
    categories: item.categories ?? [sectionLabel],
    origin: item.origin ?? inferOrigin(item.name),
    oldPrice: item.oldPrice,
    price: item.price,
    discount: item.discount,
    rating: item.rating ?? 5,
    brand: inferBrand(item.name),
    section: sourceKey,
    sectionLabel,
  }));
}

export const allCatalogProducts: CatalogProduct[] = [
  ...mapProducts("gift", "Quà Tặng Hot", products as SourceProduct[]),
  ...mapProducts("lipstick", "Son Môi Đẹp", lipsticks as SourceProduct[]),
  ...mapProducts("perfume", "Nước Hoa", perfumes as SourceProduct[]),
];

export function getCatalogProductBySlug(slug: string) {
  return allCatalogProducts.find((item) => item.slug === slug);
}

export function getRelatedCatalogProducts(
  product: CatalogProduct,
  limit = 4,
) {
  const primaryCategory = product.categories[0];

  return allCatalogProducts
    .filter((item) => item.slug !== product.slug)
    .sort((a, b) => {
      const aScore =
        (a.section === product.section ? 3 : 0) +
        (primaryCategory && a.categories.includes(primaryCategory) ? 2 : 0) +
        (a.brand === product.brand ? 1 : 0);
      const bScore =
        (b.section === product.section ? 3 : 0) +
        (primaryCategory && b.categories.includes(primaryCategory) ? 2 : 0) +
        (b.brand === product.brand ? 1 : 0);

      return bScore - aScore;
    })
    .slice(0, limit);
}
