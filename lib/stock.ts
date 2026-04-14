export type ProductStockStatus = "in_stock" | "out_of_stock";

type ProductLike = {
  stockStatus?: unknown;
  stock?: unknown;
  quantity?: unknown;
  inventory?: unknown;
  inStock?: unknown;
  isAvailable?: unknown;
  availability?: unknown;
  status?: unknown;
  stockQuantity?: unknown;
  [key: string]: unknown;
};

function normalizeStatusText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function toFiniteNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getProductStockQuantity(product: ProductLike) {
  const candidates = [
    product.stockQuantity,
    product.stock,
    product.quantity,
    product.inventory,
  ];

  for (const candidate of candidates) {
    const parsed = toFiniteNumber(candidate);

    if (parsed !== null) {
      return parsed;
    }
  }

  return null;
}

export function normalizeStockStatus(value: unknown): ProductStockStatus | null {
  const normalized = normalizeStatusText(value);

  if (!normalized) {
    return null;
  }

  if (
    normalized === "out_of_stock" ||
    normalized === "outofstock" ||
    normalized === "sold_out" ||
    normalized === "soldout" ||
    normalized === "het_hang" ||
    normalized === "hethang" ||
    normalized === "het hang" ||
    normalized === "unavailable" ||
    normalized === "false" ||
    normalized === "0"
  ) {
    return "out_of_stock";
  }

  if (
    normalized === "in_stock" ||
    normalized === "instock" ||
    normalized === "con_hang" ||
    normalized === "conhang" ||
    normalized === "con hang" ||
    normalized === "available" ||
    normalized === "true" ||
    normalized === "1"
  ) {
    return "in_stock";
  }

  return null;
}

export function getProductStockStatus(product: ProductLike): ProductStockStatus {
  const directStatus =
    normalizeStockStatus(product.stockStatus) ||
    normalizeStockStatus(product.availability) ||
    normalizeStockStatus(product.status);

  if (directStatus) {
    return directStatus;
  }

  if (product.inStock === false || product.isAvailable === false) {
    return "out_of_stock";
  }

  if (product.inStock === true || product.isAvailable === true) {
    return "in_stock";
  }

  const quantity = getProductStockQuantity(product);

  if (quantity !== null) {
    return quantity > 0 ? "in_stock" : "out_of_stock";
  }

  return "in_stock";
}

export function isProductOutOfStock(product: ProductLike) {
  return getProductStockStatus(product) === "out_of_stock";
}

export function isProductInStock(product: ProductLike) {
  return getProductStockStatus(product) === "in_stock";
}

export function getProductStockLabel(product: ProductLike) {
  return isProductOutOfStock(product) ? "HẾT HÀNG" : "CÒN HÀNG";
}

export function getProductStockBadgeClassName(product: ProductLike) {
  return isProductOutOfStock(product)
    ? "bg-[#fff1f3] text-[#d62849]"
    : "bg-[#effaf1] text-[#0f9f56]";
}

export function getProductPurchaseLabel(product: ProductLike) {
  return isProductOutOfStock(product) ? "HẾT HÀNG - LIÊN HỆ" : "MUA NGAY";
}

export const getStockStatus = getProductStockStatus;
export const getStockQuantity = getProductStockQuantity;
export const isOutOfStock = isProductOutOfStock;
export const isInStock = isProductInStock;
export const getStockLabel = getProductStockLabel;
export const getStockBadgeClassName = getProductStockBadgeClassName;
export const getPurchaseLabel = getProductPurchaseLabel;
