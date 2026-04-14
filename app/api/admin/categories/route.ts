import { NextResponse } from "next/server";

import {
  aggregateCatalogItems,
  readDataArray,
  writeDataArray,
  type CatalogItem,
  type CatalogResourceKey,
} from "@/lib/server/dataStore";

export const runtime = "nodejs";

type CategoryInfo = {
  name: string;
  count: number;
  resources: CatalogResourceKey[];
};

async function getCategoryMap() {
  const catalogItems = await aggregateCatalogItems();
  const categoryMap = new Map<string, CategoryInfo>();

  catalogItems.forEach((item) => {
    const categories = Array.isArray(item.categories) ? item.categories : [];
    categories.forEach((category) => {
      const current = categoryMap.get(category) ?? {
        name: category,
        count: 0,
        resources: [],
      };

      current.count += 1;
      if (item.resource && !current.resources.includes(item.resource)) {
        current.resources.push(item.resource);
      }

      categoryMap.set(category, current);
    });
  });

  return Array.from(categoryMap.values()).sort((left, right) =>
    left.name.localeCompare(right.name, "vi"),
  );
}

export async function GET() {
  try {
    const items = await getCategoryMap();
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json(
      { error: "Không thể tải danh mục." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const from = String(body?.from ?? "").trim();
    const to = String(body?.to ?? "").trim();

    if (!from || !to) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên danh mục cũ và mới." },
        { status: 400 },
      );
    }

    for (const resource of ["products", "lipsticks", "perfumes"] as CatalogResourceKey[]) {
      const items = await readDataArray<CatalogItem>(resource);
      const nextItems = items.map((item) => ({
        ...item,
        categories: (Array.isArray(item.categories) ? item.categories : []).map((category) =>
          category === from ? to : category,
        ),
      }));
      await writeDataArray(resource, nextItems);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Không thể cập nhật danh mục." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const name = String(url.searchParams.get("name") ?? "").trim();

    if (!name) {
      return NextResponse.json({ error: "Thiếu tên danh mục." }, { status: 400 });
    }

    for (const resource of ["products", "lipsticks", "perfumes"] as CatalogResourceKey[]) {
      const items = await readDataArray<CatalogItem>(resource);
      const nextItems = items.map((item) => ({
        ...item,
        categories: (Array.isArray(item.categories) ? item.categories : []).filter(
          (category) => category !== name,
        ),
      }));
      await writeDataArray(resource, nextItems);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Không thể xóa danh mục." },
      { status: 500 },
    );
  }
}
