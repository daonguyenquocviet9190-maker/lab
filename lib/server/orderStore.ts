import { promises as fs } from "fs";
import path from "path";

export type OrderRecord = {
  id: string;
  orderNumber?: string;
  customer?: {
    fullName?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  items?: Array<{
    id?: string;
    name?: string;
    image?: string;
    price?: number;
    quantity?: number;
  }>;
  subtotal?: number;
  shippingFee?: number;
  total?: number;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentProvider?: string;
  paymentTransactionId?: string;
  paymentUrl?: string;
  paymentPaidAt?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

const ordersPath = path.join(process.cwd(), "src", "data", "orders.json");

export async function readOrders() {
  const raw = await fs.readFile(ordersPath, "utf8");
  const parsed = JSON.parse(raw) as OrderRecord[];

  return Array.isArray(parsed) ? parsed : [];
}

export async function writeOrders(orders: OrderRecord[]) {
  await fs.writeFile(ordersPath, JSON.stringify(orders, null, 2), "utf8");
}

export async function addOrder(order: OrderRecord) {
  const orders = await readOrders();
  orders.unshift(order);
  await writeOrders(orders);
  return order;
}

export async function updateOrderById(
  id: string,
  updater: (order: OrderRecord) => OrderRecord,
) {
  const orders = await readOrders();
  const index = orders.findIndex((order) => order.id === id);

  if (index === -1) {
    return null;
  }

  orders[index] = updater(orders[index]);
  await writeOrders(orders);

  return orders[index];
}

export async function updateOrderByOrderNumber(
  orderNumber: string,
  updater: (order: OrderRecord) => OrderRecord,
) {
  const orders = await readOrders();
  const index = orders.findIndex((order) => order.orderNumber === orderNumber);

  if (index === -1) {
    return null;
  }

  orders[index] = updater(orders[index]);
  await writeOrders(orders);

  return orders[index];
}
