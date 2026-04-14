import { getDb } from "@/lib/mongo";

export const COLLECTIONS = {
  users: "users",
  orders: "orders",
  reviews: "reviews",
  banners: "banners",
  products: "products",
  lipsticks: "lipsticks",
  perfumes: "perfumes",
  blogPosts: "blogPosts",
  settings: "settings",
  brands: "brands",
  origins: "origins",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

export async function getCollection(name: CollectionName) {
  const db = await getDb();
  return db.collection(name);
}
