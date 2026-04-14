import GiftCatalogPage from "@/components/GiftCatalogPage";
import { allCatalogProducts } from "@/lib/catalog";

export default function GiftPage() {
  return <GiftCatalogPage items={allCatalogProducts} />;
}
