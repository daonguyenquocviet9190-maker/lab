import { NextResponse } from "next/server";

import { readDataObject, writeDataObject } from "@/lib/server/dataStore";

export const runtime = "nodejs";

type AdminSettings = {
  storeName: string;
  supportEmail: string;
  hotline: string;
  freeShippingThreshold: number;
  adminNotice: string;
};

const defaultSettings: AdminSettings = {
  storeName: "KYO Authentic",
  supportEmail: "kyoauthentic@gmail.com",
  hotline: "0975 436 989",
  freeShippingThreshold: 800000,
  adminNotice: "Kiểm tra đơn hàng mới và cập nhật sản phẩm mỗi ngày.",
};

export async function GET() {
  try {
    const settings = await readDataObject<AdminSettings>("settings", defaultSettings);
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json(
      { error: "Không thể tải cài đặt." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const settings: AdminSettings = {
      storeName: String(body?.storeName ?? defaultSettings.storeName).trim(),
      supportEmail: String(body?.supportEmail ?? defaultSettings.supportEmail).trim(),
      hotline: String(body?.hotline ?? defaultSettings.hotline).trim(),
      freeShippingThreshold: Number(body?.freeShippingThreshold ?? defaultSettings.freeShippingThreshold),
      adminNotice: String(body?.adminNotice ?? defaultSettings.adminNotice).trim(),
    };

    await writeDataObject("settings", settings);

    return NextResponse.json({ success: true, settings });
  } catch {
    return NextResponse.json(
      { error: "Không thể lưu cài đặt." },
      { status: 500 },
    );
  }
}
