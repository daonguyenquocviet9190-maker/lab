"use client";

import { useMemo, useState } from "react";

type ProductDetailTabsProps = {
  name: string;
  brand: string;
  origin: string;
  categories: string[];
  price: number;
};

type TabKey = "info" | "ingredients" | "guide";

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")} đ`;
}

function getPrimaryCategory(categories: string[]) {
  return categories[0] ?? "Sản phẩm";
}

function buildInfoContent({
  name,
  brand,
  origin,
  categories,
  price,
}: ProductDetailTabsProps) {
  const primaryCategory = getPrimaryCategory(categories).toLowerCase();

  return [
    `${name} là lựa chọn nổi bật trong nhóm ${primaryCategory}, phù hợp cho khách đang tìm một sản phẩm có hình thức đẹp, dễ dùng và đến từ ${origin}. Mức giá ${formatPrice(price)} giúp sản phẩm dễ tiếp cận hơn khi mua dùng hằng ngày hoặc chọn làm quà tặng.`,
    `Thiết kế và tinh thần của ${brand} mang lại cảm giác chỉn chu, hiện đại nhưng vẫn giữ nét sang trọng. Sản phẩm phù hợp để dùng riêng, kết hợp trong set quà hoặc trưng bày đẹp mắt trên bàn trang điểm.`,
  ];
}

function buildIngredientsContent({
  name,
  brand,
  origin,
  categories,
}: Omit<ProductDetailTabsProps, "price">) {
  const categoryText = getPrimaryCategory(categories).toLowerCase();

  if (categories.some((item) => item.toLowerCase().includes("nước hoa"))) {
    return [
      `${name} thuộc nhóm ${categoryText}, thành phần tham khảo thường gồm Alcohol Denat., Fragrance (Parfum), Aqua (Water) cùng các hợp chất tạo mùi đặc trưng của ${brand}.`,
      `Vì từng phiên bản và lô hàng có thể khác nhau, bạn nên kiểm tra bảng thành phần in trên hộp sản phẩm thực tế để có thông tin chính xác nhất. Sản phẩm có xuất xứ ${origin}, phù hợp cho người thích mùi hương rõ nét và sang trọng.`,
    ];
  }

  if (categories.some((item) => item.toLowerCase().includes("son"))) {
    return [
      `${name} thường có nền sáp và dầu dưỡng, kết hợp chất tạo màu, chất làm mềm môi và các thành phần hỗ trợ bám màu. Một số phiên bản có thể bổ sung vitamin E hoặc các thành phần dưỡng ẩm nhẹ.`,
      `Danh sách thành phần chi tiết có thể thay đổi theo màu son và phiên bản. Bạn nên xem thông tin in trực tiếp trên thân hộp hoặc tem phụ đi kèm để nắm rõ bảng thành phần của sản phẩm xuất xứ ${origin}.`,
    ];
  }

  return [
    `${name} là sản phẩm thuộc nhóm ${categoryText}, thành phần sẽ phụ thuộc vào từng món có trong set. Với các set quà hoặc combo, mỗi sản phẩm nhỏ bên trong có bảng thành phần riêng của nhà sản xuất ${brand}.`,
    `Để dùng an tâm hơn, bạn nên xem kỹ mô tả trên bao bì từng món trong set, đặc biệt nếu bạn có làn da nhạy cảm hoặc muốn kiểm tra thành phần chi tiết của sản phẩm có xuất xứ ${origin}.`,
  ];
}

function buildGuideContent({
  name,
  categories,
}: Omit<ProductDetailTabsProps, "brand" | "origin" | "price">) {
  if (categories.some((item) => item.toLowerCase().includes("nước hoa"))) {
    return [
      `Lắc nhẹ và xịt ${name} ở khoảng cách vừa phải lên các điểm mạch như cổ tay, sau tai hoặc vùng cổ để mùi hương lưu tốt hơn. Không nên xịt quá gần hoặc chà mạnh sau khi xịt.`,
      `Bảo quản nơi khô ráo, tránh ánh nắng trực tiếp. Khi mua hàng, bạn nên kiểm tra tem, hộp và tình trạng vòi xịt trước khi sử dụng để đảm bảo sản phẩm còn nguyên vẹn.`,
    ];
  }

  if (categories.some((item) => item.toLowerCase().includes("son"))) {
    return [
      `Thoa trực tiếp ${name} lên môi hoặc dùng cọ để tán đều hơn. Với màu đậm, bạn nên viền môi trước để tổng thể gọn và sắc nét hơn.`,
      `Sau khi sử dụng, đóng nắp kỹ và tránh để sản phẩm ở nơi quá nóng. Khi nhận hàng, hãy kiểm tra đầu son, vỏ hộp và mã màu trước khi dùng.`,
    ];
  }

  return [
    `Khi nhận ${name}, bạn nên mở hộp kiểm tra đầy đủ số lượng món, bao bì và ngoại quan của từng sản phẩm trước khi sử dụng hoặc đem tặng.`,
    `Bảo quản sản phẩm ở nơi khô ráo, tránh nhiệt độ cao. Nếu set gồm nhiều món mỹ phẩm, hãy đọc hướng dẫn riêng trên từng sản phẩm nhỏ để dùng đúng cách.`,
  ];
}

export default function ProductDetailTabs(props: ProductDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("info");

  const tabContent = useMemo(
    () => ({
      info: buildInfoContent(props),
      ingredients: buildIngredientsContent(props),
      guide: buildGuideContent(props),
    }),
    [props],
  );

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "info", label: "THÔNG TIN SẢN PHẨM" },
    { key: "ingredients", label: "THÀNH PHẦN" },
    { key: "guide", label: "HƯỚNG DẪN MUA HÀNG" },
  ];

  return (
    <section className="mt-6 block w-full rounded-[20px] border border-[#efe4e8] bg-[#fffdfd] p-4">
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-[6px] border px-4 py-2 text-[0.82rem] font-semibold transition sm:px-5 sm:text-[0.88rem] ${
                isActive
                  ? "border-[#f0a145] border-t-[3px] border-t-[#ee4d8c] bg-white text-[#f08a18]"
                  : "border-[#f0a145] bg-white text-slate-800 hover:bg-[#fff9f1]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-4 text-[0.98rem] leading-8 text-slate-800">
        {tabContent[activeTab].map((paragraph, index) => (
          <p key={`${activeTab}-${index}`}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
