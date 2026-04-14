import { access, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type OrderItem = {
  id: string;
  name: string;
  image?: string;
  price: number;
  priceText: string;
  quantity: number;
};

type StoredOrder = {
  id: string;
  orderNumber: string;
  customer: {
    fullName: string;
    username?: string;
    email: string;
    phone: string;
    address: string;
  };
  options: {
    createAccount: boolean;
    shipToOtherAddress: boolean;
  };
  note: string;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: string;
  createdAt: string;
  cancelledAt?: string;
};

type CatalogProduct = {
  id: string;
  name: string;
  image: string;
  price: number;
  priceText: string;
};

const ordersJsonCandidates = [
  path.join(process.cwd(), "src", "data", "orders.json"),
  path.join(process.cwd(), "my-app", "src", "data", "orders.json"),
];

const catalogFileNames = [
  "products.json",
  "lipsticks.json",
  "perfumes.json",
  "db.json",
];

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)} d`;
}

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseCurrencyAmount(value: string) {
  const digitsOnly = value.replace(/[^\d]/g, "");
  const parsed = Number(digitsOnly);
  return Number.isFinite(parsed) ? parsed : 0;
}

function extractAmountsFromText(value: string) {
  const matches = value.match(/\d[\d.,\s]*/g) ?? [];

  return matches
    .map((match) => parseCurrencyAmount(match))
    .filter((amount) => amount > 0);
}

function hasMultipleAmounts(value: string) {
  return extractAmountsFromText(value).length > 1;
}

function getCleanPriceFromText(value: string) {
  const amounts = extractAmountsFromText(value);
  return amounts.length > 0 ? amounts[amounts.length - 1] : 0;
}

function normalizeText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (isObject(value)) {
      const nested = extractString(value, ["src", "url", "path", "default"]);

      if (nested) {
        return nested;
      }
    }
  }

  return "";
}

function extractPriceValue(source: Record<string, unknown>) {
  const candidates = [
    source.salePrice,
    source.currentPrice,
    source.discountPrice,
    source.finalPrice,
    source.price,
    source.unitPrice,
  ];

  for (const candidate of candidates) {
    const value = toNumber(candidate);

    if (value > 0) {
      return value;
    }
  }

  return 0;
}

function extractPriceTextValue(source: Record<string, unknown>) {
  return extractString(source, [
    "priceText",
    "salePriceText",
    "currentPriceText",
    "discountPriceText",
    "formattedPrice",
  ]);
}

function isReasonablePriceText(value: string) {
  const text = value.trim();

  if (!text) {
    return false;
  }

  return !hasMultipleAmounts(text);
}

function normalizeItem(input: unknown, index: number): OrderItem {
  const item = (input ?? {}) as Partial<OrderItem> & {
    priceText?: string;
    image?: string;
  };
  const rawPriceText = String(item.priceText ?? "").trim();
  const priceFromText = getCleanPriceFromText(rawPriceText);
  const price =
    hasMultipleAmounts(rawPriceText) && priceFromText > 0
      ? priceFromText
      : toNumber(item.price) || priceFromText;
  const quantity = Math.max(1, Math.floor(toNumber(item.quantity) || 1));

  return {
    id: String(item.id ?? `item-${index + 1}`),
    name: String(item.name ?? "Sản phẩm"),
    image: String(item.image ?? ""),
    price,
    priceText: formatCurrency(price),
    quantity,
  };
}

async function readCatalogFile(fileName: string) {
  for (const candidate of [
    path.join(process.cwd(), "src", "data", fileName),
    path.join(process.cwd(), "my-app", "src", "data", fileName),
  ]) {
    try {
      await access(candidate);
      const raw = await readFile(candidate, "utf8");
      return JSON.parse(raw) as unknown;
    } catch {
      continue;
    }
  }

  return null;
}

function flattenCatalogProducts(
  input: unknown,
  collector: CatalogProduct[],
  seen = new WeakSet<object>(),
) {
  if (Array.isArray(input)) {
    input.forEach((item) => flattenCatalogProducts(item, collector, seen));
    return;
  }

  if (!isObject(input)) {
    return;
  }

  if (seen.has(input)) {
    return;
  }

  seen.add(input);

  const name = extractString(input, ["name", "title", "productName", "label"]);
  const id = extractString(input, ["id", "slug", "code"]);
  const image = extractString(input, [
    "image",
    "imageSrc",
    "thumbnail",
    "thumb",
    "photo",
    "avatar",
  ]);
  const price = extractPriceValue(input);
  const priceText = extractPriceTextValue(input);

  if (name) {
    collector.push({
      id: id || normalizeText(name),
      name,
      image,
      price,
      priceText: formatCurrency(getCleanPriceFromText(priceText) || price),
    });
  }

  Object.values(input).forEach((value) =>
    flattenCatalogProducts(value, collector, seen),
  );
}

async function getCatalogProducts() {
  const collected: CatalogProduct[] = [];

  for (const fileName of catalogFileNames) {
    const parsed = await readCatalogFile(fileName);

    if (parsed) {
      flattenCatalogProducts(parsed, collected);
    }
  }

  const unique = new Map<string, CatalogProduct>();

  collected.forEach((product) => {
    const key = `${normalizeText(product.id)}::${normalizeText(product.name)}`;

    if (!unique.has(key)) {
      unique.set(key, product);
    }
  });

  return Array.from(unique.values());
}

function findCatalogProduct(item: OrderItem, catalogProducts: CatalogProduct[]) {
  const itemId = normalizeText(item.id);
  const itemName = normalizeText(item.name);

  let matched =
    catalogProducts.find(
      (product) =>
        normalizeText(product.id) === itemId ||
        normalizeText(product.name) === itemName,
    ) ?? null;

  if (matched) {
    return matched;
  }

  matched =
    catalogProducts.find((product) => {
      const productName = normalizeText(product.name);

      return (
        (itemName && productName.includes(itemName)) ||
        (productName && itemName.includes(productName))
      );
    }) ?? null;

  return matched;
}

function enrichItem(item: OrderItem, catalogProducts: CatalogProduct[]) {
  const catalogProduct = findCatalogProduct(item, catalogProducts);
  const currentCatalogPrice = toNumber(catalogProduct?.price);
  const currentItemPrice = toNumber(item.price);
  const priceFromText = getCleanPriceFromText(String(item.priceText ?? ""));
  const price = currentCatalogPrice || currentItemPrice || priceFromText;
  const image = String(item.image ?? "").trim() || catalogProduct?.image || "";

  return {
    ...item,
    image,
    price,
    priceText: formatCurrency(price),
  };
}

async function enrichOrders(orders: StoredOrder[]) {
  const catalogProducts = await getCatalogProducts();

  return orders
    .map((order) => ({
      ...order,
      items: (order.items ?? []).map((item, index) =>
        enrichItem(normalizeItem(item, index), catalogProducts),
      ),
    }))
    .map((order) => {
      const subtotal = (order.items ?? []).reduce(
        (sum, item) =>
          sum + toNumber(item.price) * Math.max(1, toNumber(item.quantity) || 1),
        0,
      );
      const shippingFee = toNumber(order.shippingFee);

      return {
        ...order,
        subtotal,
        total: subtotal + shippingFee,
      };
    });
}

async function getOrdersJsonPath() {
  for (const candidate of ordersJsonCandidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }

  const fallback = ordersJsonCandidates[0];
  await mkdir(path.dirname(fallback), { recursive: true });
  await writeFile(fallback, "[]", "utf8");
  return fallback;
}

async function readOrders() {
  const ordersJsonPath = await getOrdersJsonPath();
  const raw = await readFile(ordersJsonPath, "utf8");

  try {
    const parsed = JSON.parse(raw) as StoredOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeOrders(orders: StoredOrder[]) {
  const ordersJsonPath = await getOrdersJsonPath();
  await writeFile(ordersJsonPath, JSON.stringify(orders, null, 2), "utf8");
}

function buildOrderNumber() {
  return `KYO-${Date.now()}`;
}

function normalizeOrder(input: Record<string, unknown>): StoredOrder {
  const items = Array.isArray(input.items)
    ? input.items.map((item, index) => normalizeItem(item, index))
    : [];
  const subtotal =
    toNumber(input.subtotal) ||
    items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = toNumber(input.shippingFee);
  const total = toNumber(input.total) || subtotal + shippingFee;
  const customerInput = (input.customer ?? {}) as Record<string, unknown>;
  const optionsInput = (input.options ?? {}) as Record<string, unknown>;

  return {
    id: crypto.randomUUID(),
    orderNumber: buildOrderNumber(),
    customer: {
      fullName: String(customerInput.fullName ?? ""),
      username: String(customerInput.username ?? ""),
      email: String(customerInput.email ?? ""),
      phone: String(customerInput.phone ?? ""),
      address: String(customerInput.address ?? ""),
    },
    options: {
      createAccount: Boolean(optionsInput.createAccount),
      shipToOtherAddress: Boolean(optionsInput.shipToOtherAddress),
    },
    note: String(input.note ?? ""),
    paymentMethod: String(input.paymentMethod ?? "cod"),
    items,
    subtotal,
    shippingFee,
    total,
    status: String(input.status ?? "pending"),
    createdAt: new Date().toISOString(),
  };
}

export async function GET() {
  const orders = await readOrders();
  const enrichedOrders = await enrichOrders(orders);
  return NextResponse.json(enrichedOrders);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const order = normalizeOrder(body);
    const orders = await readOrders();
    const nextOrders = [...orders, order];

    await writeOrders(nextOrders);
    const [enrichedOrder] = await enrichOrders([order]);

    return NextResponse.json({
      message: `Đơn ${order.orderNumber} đã được lưu vào src/data/orders.json.`,
      order: enrichedOrder,
    });
  } catch {
    return NextResponse.json(
      { message: "Không thể lưu đơn hàng lúc này." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      id?: string;
      orderNumber?: string;
      status?: string;
      action?: string;
    };
    const orderId = String(body.id ?? "").trim();
    const orderNumber = String(body.orderNumber ?? "").trim();
    const nextStatus =
      body.action === "cancel"
        ? "cancelled"
        : String(body.status ?? "").trim() || "cancelled";

    if (!orderId && !orderNumber) {
      return NextResponse.json(
        { message: "Thiếu mã đơn để cập nhật." },
        { status: 400 },
      );
    }

    const orders = await readOrders();
    const orderIndex = orders.findIndex(
      (order) =>
        order.id === orderId ||
        order.orderNumber.toLowerCase() === orderNumber.toLowerCase(),
    );

    if (orderIndex === -1) {
      return NextResponse.json(
        { message: "Không tìm thấy đơn hàng." },
        { status: 404 },
      );
    }

    const updatedOrder: StoredOrder = {
      ...orders[orderIndex],
      status: nextStatus,
      cancelledAt:
        nextStatus === "cancelled"
          ? new Date().toISOString()
          : orders[orderIndex].cancelledAt,
    };

    const nextOrders = [...orders];
    nextOrders[orderIndex] = updatedOrder;
    await writeOrders(nextOrders);
    const [enrichedOrder] = await enrichOrders([updatedOrder]);

    return NextResponse.json({
      message:
        nextStatus === "cancelled"
          ? "Đã hủy đơn hàng thành công."
          : "Đã cập nhật trạng thái đơn hàng.",
      order: enrichedOrder,
    });
  } catch {
    return NextResponse.json(
      { message: "Không thể cập nhật đơn hàng." },
      { status: 500 },
    );
  }
}
