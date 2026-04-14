import { NextResponse } from "next/server";
import { readBanners } from "@/lib/server/bannerStore";

export async function GET() {
  const banners = await readBanners();
  const activeBanners = banners.filter((banner) => banner.active);

  return NextResponse.json({ items: activeBanners });
}
