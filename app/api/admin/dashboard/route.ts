import { NextResponse } from "next/server";

import {
  aggregateCatalogItems,
  readDataArray,
} from "@/lib/server/dataStore";

export const runtime = "nodejs";

type OrderItem = {
  status?: string;
  total?: number;
};

export async function GET() {
  try {
    const [catalogItems, users, orders, reviews] = await Promise.all([
      aggregateCatalogItems(),
      readDataArray("users"),
      readDataArray<OrderItem>("orders"),
      readDataArray("reviews"),
    ]);

    const revenue = orders.reduce((sum, order) => {
      const status = String(order.status ?? "").toLowerCase();

      if (status === "cancelled" || status === "da huy" || status === "đã hủy") {
        return sum;
      }

      return sum + (typeof order.total === "number" ? order.total : 0);
    }, 0);

    return NextResponse.json({
      stats: {
        products: catalogItems.length,
        users: users.length,
        orders: orders.length,
        reviews: reviews.length,
        revenue,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Không thể tải dữ liệu dashboard." },
      { status: 500 },
    );
  }
}
