"use client";

import { useState } from "react";
import { getOrders } from "@/lib/shop";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  address: string;
  createdAt: string;
};

export default function OrdersPage() {
  const [orders] = useState<Order[]>(() => {
    if (typeof window === "undefined") return [];
    return getOrders();
  });

  if (!orders.length) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Đơn hàng đã mua</h2>
        <p className="mt-2">Bạn chưa có đơn hàng nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Đơn hàng đã mua</h2>
      {orders.map((order) => (
        <div key={order.id} className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Mã đơn: {order.id}</p>
          <p>Thời gian: {new Date(order.createdAt).toLocaleString()}</p>
          <p>Địa chỉ: {order.address}</p>
          <p className="font-semibold">Tổng: {order.total.toLocaleString("vi-VN")} ₫</p>
          <div className="mt-2 space-y-1">
            {order.items.map((item) => (
              <p key={item.id} className="text-sm">
                {item.name} x {item.quantity} = {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
