import { promises as fs } from "fs";
import path from "path";

export type BannerRecord = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  href: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

const bannersPath = path.join(process.cwd(), "src", "data", "banners.json");

function normalizeBanner(input: Partial<BannerRecord>): BannerRecord {
  return {
    id: String(input.id ?? ""),
    title: String(input.title ?? ""),
    subtitle: String(input.subtitle ?? ""),
    description: String(input.description ?? ""),
    image: String(input.image ?? ""),
    buttonText: String(input.buttonText ?? "Mua ngay"),
    href: String(input.href ?? "/shop"),
    active: input.active !== false,
    sortOrder: Number.isFinite(Number(input.sortOrder))
      ? Number(input.sortOrder)
      : 0,
    createdAt: String(input.createdAt ?? new Date().toISOString()),
    updatedAt: String(input.updatedAt ?? new Date().toISOString()),
  };
}

export async function readBanners() {
  const file = await fs.readFile(bannersPath, "utf8");
  const parsed = JSON.parse(file) as Partial<BannerRecord>[];

  return parsed
    .map(normalizeBanner)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
}

export async function writeBanners(banners: BannerRecord[]) {
  await fs.writeFile(bannersPath, JSON.stringify(banners, null, 2), "utf8");
}

export function buildBannerPayload(input: Record<string, unknown>) {
  const now = new Date().toISOString();

  return {
    title: String(input.title ?? "").trim(),
    subtitle: String(input.subtitle ?? "").trim(),
    description: String(input.description ?? "").trim(),
    image: String(input.image ?? "").trim(),
    buttonText: String(input.buttonText ?? "Mua ngay").trim() || "Mua ngay",
    href: String(input.href ?? "/shop").trim() || "/shop",
    active: input.active !== false,
    sortOrder: Number.isFinite(Number(input.sortOrder))
      ? Number(input.sortOrder)
      : 0,
    updatedAt: now,
  };
}
