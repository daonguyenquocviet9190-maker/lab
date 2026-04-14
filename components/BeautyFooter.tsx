const utilityItems = [
  {
    title: "Facebook",
    subtitle: "fb.com/kyoauthentic",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-current">
        <path d="M13.5 21v-7h2.4l.6-3h-3v-1.6c0-1 .3-1.7 1.7-1.7H16V5.1c-.2 0-.9-.1-1.8-.1-2.7 0-4.5 1.6-4.5 4.7V11H7v3h2.7v7h3.8Z" />
      </svg>
    ),
  },
  {
    title: "Đảm bảo chất lượng",
    subtitle: "100% chính hãng",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-current">
        <path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Zm-1.2 13.8-3.3-3.3 1.4-1.4 1.9 1.9 4.8-4.8 1.4 1.4-6.2 6.2Z" />
      </svg>
    ),
  },
  {
    title: "Free ship",
    subtitle: "đơn hàng từ 800k",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-current">
        <path d="M3 5h11v8h2.6l2.2-3H21v5h-1.1a2.9 2.9 0 0 1-5.8 0H9.9a2.9 2.9 0 0 1-5.8 0H3V5Zm13 6h2.1l-1.2-1.7H16V11Zm-9 7a1.3 1.3 0 1 0 0-2.6A1.3 1.3 0 0 0 7 18Zm10 0a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6Z" />
      </svg>
    ),
  },
  {
    title: "Hotline: 0975 436 989",
    subtitle: "tư vấn miễn phí 24/7",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-current">
        <path d="M6.6 10.8c1.6 3.1 3.9 5.4 7 7l2.3-2.3c.3-.3.7-.4 1.1-.3 1.2.4 2.5.7 3.9.7.6 0 1.1.5 1.1 1.1V21c0 .6-.5 1.1-1.1 1.1C10.2 22.1 1.9 13.8 1.9 3.1 1.9 2.5 2.4 2 3 2h4.1c.6 0 1.1.5 1.1 1.1 0 1.4.2 2.7.7 3.9.1.4 0 .8-.3 1.1l-2 2.7Z" />
      </svg>
    ),
  },
];

const footerMenu = [
  "TRANG CHỦ",
  "QUÀ TẶNG",
  "SON MÔI",
  "NƯỚC HOA",
  "CHỐNG NẮNG",
  "TRANG ĐIỂM MẶT",
  "CHĂM SÓC DA",
  "CHĂM SÓC TÓC",
  "KHUYẾN MÃI",
  "SHOP ALL",
  "TIN TỨC",
];

const socialIcons = [
  {
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
        <path d="M13.5 21v-7h2.4l.6-3h-3v-1.6c0-1 .3-1.7 1.7-1.7H16V5.1c-.2 0-.9-.1-1.8-.1-2.7 0-4.5 1.6-4.5 4.7V11H7v3h2.7v7h3.8Z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2.2A2.8 2.8 0 0 0 4.2 7v10A2.8 2.8 0 0 0 7 19.8h10a2.8 2.8 0 0 0 2.8-2.8V7A2.8 2.8 0 0 0 17 4.2H7Zm10.8 1.7a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2.1a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
        <path d="M21.6 7.2a2.9 2.9 0 0 0-2-2c-1.8-.5-7.6-.5-7.6-.5s-5.8 0-7.6.5a2.9 2.9 0 0 0-2 2A30.7 30.7 0 0 0 2 12a30.7 30.7 0 0 0 .4 4.8 2.9 2.9 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.9 2.9 0 0 0 2-2A30.7 30.7 0 0 0 22 12a30.7 30.7 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" />
      </svg>
    ),
  },
];

function ActionIcon({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ef3f7f] text-white transition hover:bg-[#d7306d]"
    >
      {children}
    </button>
  );
}

export default function BeautyFooter() {
  return (
    <footer className="mt-10 border-t border-[#f0d7dc] bg-white">
      <div className="bg-[#f58aa4] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-3 text-sm font-medium lg:flex-row lg:items-center lg:justify-between">
          <p>Mykingdom - Đồ chơi &amp; Quà tặng cao cấp chính hãng</p>

          <div className="flex flex-wrap items-center gap-4 text-white/95">
            <span className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                <path d="M3 5h18v14H3V5Zm2 2v.5L12 13l7-5.5V7H5Zm14 10V9.9l-7 5.4-7-5.4V17h14Z" />
              </svg>
              mykingdom@gmail.com
            </span>
            <span className="hidden h-4 w-px bg-white/40 sm:block" />
            <span className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                <path d="M6.6 10.8c1.6 3.1 3.9 5.4 7 7l2.3-2.3c.3-.3.7-.4 1.1-.3 1.2.4 2.5.7 3.9.7.6 0 1.1.5 1.1 1.1V21c0 .6-.5 1.1-1.1 1.1C10.2 22.1 1.9 13.8 1.9 3.1 1.9 2.5 2.4 2 3 2h4.1c.6 0 1.1.5 1.1 1.1 0 1.4.2 2.7.7 3.9.1.4 0 .8-.3 1.1l-2 2.7Z" />
              </svg>
              0286.2638.600
            </span>

            <div className="flex items-center gap-3">
              {socialIcons.map((social) => (
                <span key={social.label} aria-label={social.label} className="text-white">
                  {social.icon}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#fff7f8]">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[1.3fr_repeat(4,1fr)_auto] lg:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ef3f7f] text-white shadow-[0_10px_24px_rgba(239,63,127,0.25)]">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 fill-current">
                <path d="M12 3c3.8 0 7 3.1 7 7 0 2.6-1.4 4.8-3.6 6v3.2c0 .5-.4.8-.8.8H9.4a.8.8 0 0 1-.8-.8V16c-2.2-1.2-3.6-3.4-3.6-6 0-3.9 3.2-7 7-7Zm-2.9 7.6c-.8.8-.8 2.2 0 3 .8.9 2.2.9 3 0 .9-.8.9-2.2 0-3a2.1 2.1 0 0 0-3 0Zm5.8 0a2.1 2.1 0 1 0 0 3 2.1 2.1 0 0 0 0-3Z" />
              </svg>
            </div>

            <div>
              <p className="text-4xl font-semibold tracking-tight text-[#ef3f7f]">
                KYO.VN
              </p>
              <p className="text-sm text-[#8a6d77]">
                Mỹ phẩm tuyển chọn cho routine đẹp và gọn.
              </p>
            </div>
          </div>

          {utilityItems.map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="mt-1 text-[#ff7f62]">{item.icon}</div>
              <div>
                <p className="text-lg font-semibold text-[#24161b]">{item.title}</p>
                <p className="mt-1 text-sm text-[#6f5b60]">{item.subtitle}</p>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-3 lg:justify-end">
            <ActionIcon label="Search">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                <path d="m21 19.6-4.7-4.7a7 7 0 1 0-1.4 1.4L19.6 21 21 19.6ZM5 10a5 5 0 1 1 10 0A5 5 0 0 1 5 10Z" />
              </svg>
            </ActionIcon>
            <ActionIcon label="Cart">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                <path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM6.2 6l.4 2H20l-1.7 6.5a1 1 0 0 1-1 .8H8a1 1 0 0 1-1-.8L4.6 4H2V2h4a1 1 0 0 1 1 .8L7.4 4H22v2H6.2Z" />
              </svg>
            </ActionIcon>
          </div>
        </div>
      </div>

      <div className="border-t border-[#f0e5e8] bg-white">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-5 text-lg font-medium text-[#4a343c]">
          {footerMenu.map((item) => (
            <a
              key={item}
              href="#"
              className="transition hover:text-[#ef3f7f]"
            >
              {item}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
import type { ReactNode } from "react";
