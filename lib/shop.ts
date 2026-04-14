export type Product = {
  id: string;
  name: string;
  image: string;
  price: number;
  description: string;
  stock: number;
};

export type CartItem = Product & { quantity: number };

const CART_KEY = "shopping_cart";
const AUTH_KEY = "user_info";
const ORDERS_KEY = "order_history";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function setCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(item: Product, quantity = 1) {
  const cart = getCart();
  const exists = cart.find((x) => x.id === item.id);
  if (exists) {
    exists.quantity = Math.min(exists.quantity + quantity, item.stock);
  } else {
    cart.push({ ...item, quantity });
  }
  setCart(cart);
  return cart;
}

export function removeFromCart(id: string) {
  const cart = getCart().filter((item) => item.id !== id);
  setCart(cart);
  return cart;
}

export function updateCartQuantity(id: string, quantity: number) {
  const cart = getCart().map((item) =>
    item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
  );
  setCart(cart);
  return cart;
}

export function clearCart() {
  setCart([]);
}

export function login(email: string, name: string) {
  const user = { email, name, joinedAt: new Date().toISOString() };
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }
  return user;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function addOrder(order: { id: string; items: CartItem[]; total: number; address: string; createdAt: string }) {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(ORDERS_KEY);
  const orders = raw ? JSON.parse(raw) : [];
  const next = [order, ...orders];
  localStorage.setItem(ORDERS_KEY, JSON.stringify(next));
}

export function getOrders() {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(ORDERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
