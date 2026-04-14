import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { COLLECTIONS, getCollection } from "@/lib/server/mongoCollections";

const DATA_FILES: Array<{
  collection: keyof typeof COLLECTIONS;
  fileName: string;
}> = [
  { collection: "products", fileName: "products.json" },
  { collection: "lipsticks", fileName: "lipsticks.json" },
  { collection: "perfumes", fileName: "perfumes.json" },
  { collection: "blogPosts", fileName: "blogPosts.json" },
  { collection: "banners", fileName: "banners.json" },
  { collection: "reviews", fileName: "reviews.json" },
  { collection: "orders", fileName: "orders.json" },
  { collection: "users", fileName: "users.json" },
  { collection: "settings", fileName: "settings.json" }
];

async function readJson(fileName: string) {
  const filePath = path.join(process.cwd(), "src", "data", fileName);
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

export async function POST() {
  try {
    const results: Record<string, number> = {};

    for (const entry of DATA_FILES) {
      const collection = await getCollection(COLLECTIONS[entry.collection]);
      const count = await collection.countDocuments();

      if (count > 0) {
        results[entry.collection] = 0;
        continue;
      }

      const payload = await readJson(entry.fileName);
      const docs = Array.isArray(payload) ? payload : [payload];

      if (docs.length > 0) {
        await collection.insertMany(docs);
        results[entry.collection] = docs.length;
      } else {
        results[entry.collection] = 0;
      }
    }

    return NextResponse.json({ ok: true, inserted: results });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Seed data thất bại.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
