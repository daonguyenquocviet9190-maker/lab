import { promises as fs } from "fs";
import path from "path";

export const DATA_FILE_KEYS = {
  products: "products.json",
  lipsticks: "lipsticks.json",
  perfumes: "perfumes.json",
  blogPosts: "blogPosts.json",
  users: "users.json",
  orders: "orders.json",
  reviews: "reviews.json",
  settings: "settings.json",
} as const;

export type DataFileKey = keyof typeof DATA_FILE_KEYS;
export type CatalogResourceKey = "products" | "lipsticks" | "perfumes";

export type CatalogItem = {
  id: string | number;
  name: string;
  image: string;
  hoverImage?: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  brand?: string;
  origin?: string;
  sectionLabel?: string;
  categories?: string[];
  description?: string;
  resource?: CatalogResourceKey;
};

const DATA_DIR = path.join(process.cwd(), "src", "data");

function resolveFilePath(fileKey: DataFileKey) {
  return path.join(DATA_DIR, DATA_FILE_KEYS[fileKey]);
}

export async function readDataArray<T>(fileKey: DataFileKey) {
  try {
    const rawValue = await fs.readFile(resolveFilePath(fileKey), "utf8");
    const parsed = JSON.parse(rawValue);

    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [] as T[];
  }
}

export async function writeDataArray<T>(fileKey: DataFileKey, data: T[]) {
  await fs.writeFile(resolveFilePath(fileKey), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function readDataObject<T extends Record<string, unknown>>(
  fileKey: DataFileKey,
  fallback: T,
) {
  try {
    const rawValue = await fs.readFile(resolveFilePath(fileKey), "utf8");
    const parsed = JSON.parse(rawValue);

    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as T)
      : fallback;
  } catch {
    return fallback;
  }
}

export async function writeDataObject<T extends Record<string, unknown>>(
  fileKey: DataFileKey,
  data: T,
) {
  await fs.writeFile(resolveFilePath(fileKey), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function aggregateCatalogItems() {
  const [products, lipsticks, perfumes] = await Promise.all([
    readDataArray<CatalogItem>("products"),
    readDataArray<CatalogItem>("lipsticks"),
    readDataArray<CatalogItem>("perfumes"),
  ]);

  return [
    ...products.map((item) => ({ ...item, resource: "products" as const })),
    ...lipsticks.map((item) => ({ ...item, resource: "lipsticks" as const })),
    ...perfumes.map((item) => ({ ...item, resource: "perfumes" as const })),
  ];
}

export function normalizeText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function toPositiveNumber(value: unknown, fallback = 0) {
  const numericValue =
    typeof value === "number"
      ? value
      : Number(String(value ?? "").replace(/[^\d.-]/g, ""));

  return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : fallback;
}

export function normalizeCategories(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry).trim())
      .filter(Boolean);
  }

  return String(value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function nextNumericId(items: Array<{ id?: string | number }>) {
  const maxId = items.reduce((currentMax, item) => {
    const numericId = Number(item.id);
    return Number.isFinite(numericId) ? Math.max(currentMax, numericId) : currentMax;
  }, 0);

  return maxId + 1;
}
