export type CartItem = {
  id?: string;
  slug?: string;
  title?: string;
  name?: string;
  image?: string;
  price?: number;
  oldPrice?: number;
  priceText?: string;
  quantity?: number;
  section?: string;
  category?: string;
  [key: string]: unknown;
};

const PRIMARY_CART_STORAGE_KEY = "kyo-cart";

const CART_STORAGE_KEYS = [
  "kyo-cart",
  "cart",
  "kyoauthentic-cart",
  "kyo_cart",
] as const;

function getClientWindow() {
  return typeof window !== "undefined" ? window : null;
}

function getItemIdentity(item: Partial<CartItem>) {
  return String(item.id || item.slug || item.title || item.name || "");
}

export function getCartItemKey(item: Partial<CartItem>) {
  return getItemIdentity(item);
}

function toSafeNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeCartItem(item: Partial<CartItem>): CartItem | null {
  const identity = getItemIdentity(item);

  if (!identity) {
    return null;
  }

  return {
    ...item,
    id: String(item.id ?? identity),
    slug: item.slug ? String(item.slug) : undefined,
    title: item.title ? String(item.title) : undefined,
    name: item.name ? String(item.name) : String(item.title ?? identity),
    image: item.image ? String(item.image) : "",
    price: toSafeNumber(item.price),
    oldPrice: toSafeNumber(item.oldPrice),
    priceText: item.priceText ? String(item.priceText) : "",
    quantity: Math.max(1, toSafeNumber(item.quantity) || 1),
    section: item.section ? String(item.section) : undefined,
    category: item.category ? String(item.category) : undefined,
  };
}

function parseCartValue(raw: string | null) {
  if (!raw) {
    return [] as Partial<CartItem>[];
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CartItem>[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as Partial<CartItem>[];
  }
}

function mergeCartItems(items: Partial<CartItem>[]) {
  const merged = new Map<string, CartItem>();

  items.forEach((item) => {
    const normalized = normalizeCartItem(item);

    if (!normalized) {
      return;
    }

    const identity = getItemIdentity(normalized);
    const existing = merged.get(identity);

    if (!existing) {
      merged.set(identity, normalized);
      return;
    }

    merged.set(identity, {
      ...existing,
      ...normalized,
      quantity: Math.max(existing.quantity || 1, normalized.quantity || 1),
    });
  });

  return Array.from(merged.values());
}

export function dispatchCartUpdated() {
  const win = getClientWindow();

  if (!win) {
    return;
  }

  win.dispatchEvent(new Event("cart-updated"));
}

export function readCart() {
  const win = getClientWindow();

  if (!win) {
    return [] as CartItem[];
  }

  const primaryRaw = win.localStorage.getItem(PRIMARY_CART_STORAGE_KEY);

  if (primaryRaw !== null) {
    CART_STORAGE_KEYS.filter((key) => key !== PRIMARY_CART_STORAGE_KEY).forEach(
      (key) => {
        win.localStorage.removeItem(key);
      },
    );
    return mergeCartItems(parseCartValue(primaryRaw));
  }

  const merged = mergeCartItems(
    CART_STORAGE_KEYS.flatMap((key) =>
      parseCartValue(win.localStorage.getItem(key)),
    ),
  );

  return merged;
}

export function writeCart(items: Partial<CartItem>[]) {
  const win = getClientWindow();

  if (!win) {
    return;
  }

  const merged = mergeCartItems(items);

  if (merged.length === 0) {
    win.localStorage.setItem(PRIMARY_CART_STORAGE_KEY, "[]");
    CART_STORAGE_KEYS.filter((key) => key !== PRIMARY_CART_STORAGE_KEY).forEach(
      (key) => {
        win.localStorage.removeItem(key);
      },
    );
    dispatchCartUpdated();
    return;
  }

  const serialized = JSON.stringify(merged);

  win.localStorage.setItem(PRIMARY_CART_STORAGE_KEY, serialized);
  CART_STORAGE_KEYS.filter((key) => key !== PRIMARY_CART_STORAGE_KEY).forEach(
    (key) => {
      win.localStorage.removeItem(key);
    },
  );

  dispatchCartUpdated();
}

export const saveCart = writeCart;
export const setCart = writeCart;
export const replaceCart = writeCart;

export function clearCart() {
  writeCart([]);
}

export function getCartCount(items: Partial<CartItem>[] = readCart()) {
  return items.reduce((total, item) => {
    return total + Math.max(1, toSafeNumber(item.quantity) || 1);
  }, 0);
}

export function addCartItem(item: Partial<CartItem>) {
  const normalized = normalizeCartItem(item);

  if (!normalized) {
    return readCart();
  }

  const currentItems = readCart();
  const identity = getItemIdentity(normalized);
  const index = currentItems.findIndex(
    (currentItem) => getItemIdentity(currentItem) === identity,
  );

  if (index >= 0) {
    const nextItems = [...currentItems];
    nextItems[index] = {
      ...nextItems[index],
      ...normalized,
      quantity:
        Math.max(1, nextItems[index].quantity || 1) +
        Math.max(1, normalized.quantity || 1),
    };
    writeCart(nextItems);
    return nextItems;
  }

  const nextItems = [...currentItems, normalized];
  writeCart(nextItems);
  return nextItems;
}

export const recoverCartItem = addCartItem;

export function removeCartItem(idOrSlug: string) {
  const nextItems = readCart().filter(
    (item) => getItemIdentity(item) !== String(idOrSlug),
  );
  writeCart(nextItems);
  return nextItems;
}

export const deleteCartItem = removeCartItem;

export function updateCartItemQuantity(idOrSlug: string, quantity: number) {
  const nextItems = readCart().map((item) => {
    if (getItemIdentity(item) !== String(idOrSlug)) {
      return item;
    }

    return {
      ...item,
      quantity: Math.max(1, quantity),
    };
  });

  writeCart(nextItems);
  return nextItems;
}

export const changeCartItemQuantity = updateCartItemQuantity;
export const upsertCartItem = addCartItem;
