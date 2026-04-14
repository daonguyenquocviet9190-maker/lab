import Image from "next/image";

const supportLinks = [
  "Giới thiệu",
  "Liên hệ",
  "Chính sách thanh toán",
  "Chính sách đổi trả",
  "Chính sách vận chuyển",
  "Chính sách bảo hành",
  "Chính sách kiểm hàng",
  "Chính sách bảo mật thông tin",
];

const categoryLinks = [
  "Đồ chơi LEGO",
  "Robot thông minh",
  "Búp bê",
  "Xe điều khiển",
  "Đồ chơi giáo dục",
  "Đồ chơi lắp ráp",
  "Đồ chơi trẻ em",
  "Quà tặng cho bé",
  "Sản phẩm khuyến mãi",
];

const socialLinks = [
  {
    label: "Facebook",
    bg: "bg-[#355AA3]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M13.5 21v-7h2.4l.6-3h-3v-1.6c0-1 .3-1.7 1.7-1.7H16V5.1c-.2 0-.9-.1-1.8-.1-2.7 0-4.5 1.6-4.5 4.7V11H7v3h2.7v7h3.8Z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    bg: "bg-[#2E6E99]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z" />
      </svg>
    ),
  },
  {
    label: "Email",
    bg: "bg-[#111111]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M3 5h18v14H3V5Z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    bg: "bg-[#D43B24]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M10 15.5v-7l6 3.5-6 3.5Z" />
      </svg>
    ),
  },
];

const certificationImages = [
  {
    alt: "Đã thông báo Bộ Công Thương",
    src: "/images/footer/bo-cong-thuong.png",
    width: 210,
    height: 58,
  },
  {
    alt: "DMCA Protected",
    src: "/images/footer/dmca-badge.png",
    width: 122,
    height: 58,
  },
];

const paymentImages = [
  {
    alt: "Visa",
    src: "/images/footer/payment-visa.svg",
    width: 76,
    height: 34,
  },
  {
    alt: "MasterCard",
    src: "/images/footer/payment-mastercard.svg",
    width: 76,
    height: 34,
  },
  {
    alt: "Cash On Delivery",
    src: "/images/footer/payment-cod.svg",
    width: 76,
    height: 34,
  },
  {
    alt: "Bank Transfer",
    src: "/images/footer/payment-bank.svg",
    width: 76,
    height: 34,
  },
  {
    alt: "ATM",
    src: "/images/footer/payment-atm.svg",
    width: 60,
    height: 34,
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-6">
      <div className="bg-[#60a5fa]">
        <div className="mx-auto grid max-w-[1480px] gap-7 px-5 py-8 text-[#111111] md:grid-cols-2 xl:grid-cols-4 xl:gap-9 xl:px-10 xl:py-9">
          
          {/* INFO */}
          <div>
            <h3 className="text-[1.12rem] font-bold uppercase text-[#0f172a]">
              TOY STORE
            </h3>

            <div className="mt-4 space-y-3 text-[0.86rem] leading-7">
              <p>Đồ chơi trẻ em chính hãng & an toàn</p>
              <p>Chuyên cung cấp đồ chơi giáo dục & giải trí</p>
              <p><strong>MST</strong> 0123456789</p>
              <p>Địa chỉ: TP. Hồ Chí Minh</p>
              <p><strong>Email:</strong> toystore@gmail.com</p>
              <p><strong>Hotline:</strong> 0909 123 456</p>
            </div>
          </div>

          {/* SUPPORT */}
          <div>
            <h3 className="text-[1.12rem] font-bold uppercase text-[#0f172a]">
              HỖ TRỢ KHÁCH HÀNG
            </h3>

            <div className="mt-4 space-y-2.5 text-[0.86rem]">
              {supportLinks.map((item) => (
                <a key={item} href="#" className="block hover:underline">
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* CATEGORY */}
          <div>
            <h3 className="text-[1.12rem] font-bold uppercase text-[#0f172a]">
              DANH MỤC ĐỒ CHƠI
            </h3>

            <div className="mt-4 space-y-2.5 text-[0.86rem]">
              {categoryLinks.map((item) => (
                <a key={item} href="#" className="block hover:underline">
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* SUBSCRIBE */}
          <div>
            <h3 className="text-[1.12rem] font-bold uppercase text-[#0f172a]">
              THEO DÕI CHÚNG TÔI
            </h3>

            <p className="mt-4 text-[0.86rem]">
              Nhận thông tin khuyến mãi đồ chơi mới nhất
            </p>

            <div className="mt-4 flex overflow-hidden rounded-full border bg-white">
              <input className="h-11 flex-1 px-4 outline-none" placeholder="Email" />
              <button className="bg-[#2563eb] px-5 text-white font-bold">
                GỬI
              </button>
            </div>

            <div className="mt-4 flex gap-2">
              {socialLinks.map((item) => (
                <a key={item.label} className={`h-10 w-10 flex items-center justify-center rounded-full text-white ${item.bg}`}>
                  {item.icon}
                </a>
              ))}
            </div>

            <div className="mt-5 flex gap-3">
              {certificationImages.map((item) => (
                <Image key={item.alt} {...item} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="bg-[#2f2f2f]">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-4 px-5 py-4 text-[#a5a5a5] md:flex-row md:justify-between">
          <p className="text-[0.8rem] font-semibold">
            © 2026 TOY STORE. All Rights Reserved
          </p>

          <div className="flex gap-2">
            {paymentImages.map((item) => (
              <Image key={item.alt} {...item} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}