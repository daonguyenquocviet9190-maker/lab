import { NextResponse } from "next/server";
import products from "@/data/products.json";
import lipsticks from "@/data/lipsticks.json";
import perfumes from "@/data/perfumes.json";

type RouteParams = Promise<{ id: string }>;

const collections = [products, lipsticks, perfumes].filter(Array.isArray);

function findProductById(id: string) {
  for (const collection of collections) {
    const product = collection.find(
      (item: Record<string, unknown>) =>
        String(item.id) === String(id) || String(item.slug) === String(id),
    );

    if (product) {
      return product;
    }
  }

  return null;
}

export async function GET(
  _request: Request,
  { params }: { params: RouteParams },
) {
  try {
    const { id } = await params;
    const product = findProductById(id);

    if (!product) {
      return NextResponse.json(
        { message: "Không tìm thấy sản phẩm." },
        { status: 404 },
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không tải được sản phẩm.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
