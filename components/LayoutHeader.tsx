"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { getCartCount, readCart } from "../lib/cart";
import { repairObjectTextFields } from "../lib/repairVietnameseText";

const logoSrc = "/images/logo.avif";

const utilityItems = [
  // {
  //   title: "Facebook",
  //   subtitle: "fb.com/kyoauthentic",
  //   icon: (
  //     <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 fill-current">
  //       <path d="M13.5 21v-7h2.4l.6-3h-3v-1.6c0-1 .3-1.7 1.7-1.7H16V5.1c-.2 0-.9-.1-1.8-.1-2.7 0-4.5 1.6-4.5 4.7V11H7v3h2.7v7h3.8Z" />
  //     </svg>
  //   ),
  // },
  {
    title: "Đảm bảo chất lượng",
    subtitle: "100% chính hãng",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 fill-current">
        <path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Zm-1.2 13.8-3.3-3.3 1.4-1.4 1.9 1.9 4.8-4.8 1.4 1.4-6.2 6.2Z" />
      </svg>
    ),
  },
  {
    title: "Free ship",
    subtitle: "đơn hàng từ 800k",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 fill-current">
        <path d="M3 5h11v8h2.6l2.2-3H21v5h-1.1a2.9 2.9 0 0 1-5.8 0H9.9a2.9 2.9 0 0 1-5.8 0H3V5Zm13 6h2.1l-1.2-1.7H16V11Zm-9 7a1.3 1.3 0 1 0 0-2.6A1.3 1.3 0 0 0 7 18Zm10 0a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6Z" />
      </svg>
    ),
  },
  {
    title: "Hotline: 0975 436 989",
    subtitle: "tư vấn miễn phí 24/7",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 fill-current">
        <path d="M6.6 10.8c1.6 3.1 3.9 5.4 7 7l2.3-2.3c.3-.3.7-.4 1.1-.3 1.2.4 2.5.7 3.9.7.6 0 1.1.5 1.1 1.1V21c0 .6-.5 1.1-1.1 1.1C10.2 22.1 1.9 13.8 1.9 3.1 1.9 2.5 2.4 2 3 2h4.1c.6 0 1.1.5 1.1 1.1 0 1.4.2 2.7.7 3.9.1.4 0 .8-.3 1.1l-2 2.7Z" />
      </svg>
    ),
  },
];

const topSocialIcons = [
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

// const navItems = [
  // { label: "TRANG CHỦ", active: true, href: "/" },
  // { label: "QUÀ TẶNG HOT", href: "/qua-tang" },
  // { label: "SON MÔI", arrow: true, href: "#" },
  // { label: "NƯỚC HOA", arrow: true, href: "#" },
  // { label: "CHỐNG NẮNG", href: "#" },
  // { label: "TRANG ĐIỂM MẶT", arrow: true, href: "#" },
  // { label: "TRANG ĐIỂM MẮT", arrow: true, href: "#" },
  // { label: "CHĂM SÓC DA", arrow: true, href: "#" },
  // { label: "CHĂM SÓC TÓC", href: "#" },
  // { label: "KHUYẾN MÃI", badge: "SALE", href: "#" },
  // { label: "SHOP ALL", href: "/shop" },
  // { label: "SP YÊU THÍCH", href: "/favorites" },
  const navItems = [
  { label: "TRANG CHỦ", active: true, href: "/" },
  { label: "ĐỒ CHƠI HOT", href: "/qua-tang" },
  { label: "LEGO - LẮP RÁP", arrow: true, href: "#" },
  { label: "ROBOT - CÔNG NGHỆ", arrow: true, href: "#" },
  { label: "BÚP BÊ", arrow: true, href: "#" },
  { label: "XE ĐIỀU KHIỂN", href: "#" },
  { label: "ĐỒ CHƠI GIÁO DỤC", arrow: true, href: "#" },
  { label: "ĐỒ CHƠI CHO BÉ", arrow: true, href: "#" },
  { label: "KHUYẾN MÃI", badge: "SALE", href: "#" },
  { label: "SHOP ALL", href: "/shop" },
  { label: "YÊU THÍCH", href: "/favorites" },
];
// ];

type AuthUser = {
  id?: string;
  fullName?: string;
  username?: string;
  email?: string;
};

function ActionIcon({
  label,
  children,
  onClick,
  badgeCount,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  badgeCount?: number;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#ec3a7a] text-white transition hover:bg-[#d82d69]"
    >
      {children}
      {badgeCount && badgeCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff5b97] px-1 text-[0.7rem] font-bold text-white shadow-[0_0_0_2px_#fff6f8]">
          {badgeCount}
        </span>
      ) : null}
    </button>
  );
}

function Caret() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M5.2 7.7 10 12.5l4.8-4.8 1.2 1.1-6 6-6-6 1.2-1.1Z" />
    </svg>
  );
}

function normalizeMenuLabel(label: string) {
  return label
    .replace(/Khuy[a-zA-Z0-9_À-ỹ€ÆØåÁº¿]+i/gi, "Khuyến Mãi")
    .replace(/Khuy[a-zA-Z0-9_À-ỹ€ÆØåÁº¿]+n/gi, "Khuyến")
    .replace(/M[a-zA-Z0-9_À-ỹ€ÆØåÁº¿]+i/gi, "Mãi")
    .normalize("NFC");
}

function hasDetailQuantityControls(container: Element) {
  const controls = Array.from(container.querySelectorAll("button, span, input"));
  const hasMinus = controls.some((node) => node.textContent?.trim() === "-");
  const hasPlus = controls.some((node) => node.textContent?.trim() === "+");
  const hasQuantityValue = controls.some((node) => {
    if (node instanceof HTMLInputElement) {
      return node.type === "number";
    }

    return /^\d+$/.test(node.textContent?.trim() ?? "");
  });

  return hasMinus && hasPlus && hasQuantityValue;
}

function isListingBuyNowButton(element: Element) {
  if (!(element instanceof HTMLElement) || !element.matches("button, a")) {
    return false;
  }

  return element.textContent?.trim().toLowerCase().includes("mua ngay") ?? false;
}

function findListingProductCard(button: HTMLElement) {
  let current = button.parentElement;
  let fallback: HTMLElement | null = null;

  for (let depth = 0; current && depth < 8; depth += 1) {
    if (hasDetailQuantityControls(current)) {
      return null;
    }

    const purchaseButtons = Array.from(
      current.querySelectorAll("button, a"),
    ).filter(isListingBuyNowButton);
    const images = current.querySelectorAll("img");

    if (images.length >= 1 && purchaseButtons.length === 1) {
      fallback = current;

      if (current.children.length >= 4) {
        return current;
      }
    }

    current = current.parentElement;
  }

  return fallback;
}

function resetListingCardStyle(card: HTMLElement) {
  card.style.display = "";
  card.style.flexDirection = "";
  card.style.alignItems = "";
  card.style.height = "";
  card.style.minHeight = "";
}

function resetListingButtonStyle(button: HTMLElement) {
  button.style.marginTop = "";
  button.style.alignSelf = "";
  button.style.display = "";

  if (button.parentElement instanceof HTMLElement) {
    button.parentElement.style.marginTop = "";
    button.parentElement.style.display = "";
    button.parentElement.style.justifyContent = "";
    button.parentElement.style.width = "";
  }
}

function applyListingCardLayout() {
  const buttons = Array.from(document.querySelectorAll("button, a")).filter(
    isListingBuyNowButton,
  ) as HTMLElement[];

  const cards = buttons
    .map((button) => ({
      button,
      card: findListingProductCard(button),
    }))
    .filter(
      (
        entry,
      ): entry is {
        button: HTMLElement;
        card: HTMLElement;
      } => entry.card instanceof HTMLElement,
    );

  if (cards.length === 0) {
    return;
  }

  const uniqueCards = Array.from(new Set(cards.map((entry) => entry.card)));

  uniqueCards.forEach((card) => {
    resetListingCardStyle(card);
  });

  cards.forEach(({ button }) => {
    resetListingButtonStyle(button);
  });

  const groups = new Map<
    HTMLElement,
    Array<{
      button: HTMLElement;
      card: HTMLElement;
    }>
  >();

  cards.forEach((entry) => {
    const groupKey =
      entry.card.parentElement instanceof HTMLElement
        ? entry.card.parentElement
        : entry.card;
    const currentGroup = groups.get(groupKey) ?? [];

    currentGroup.push(entry);
    groups.set(groupKey, currentGroup);
  });

  groups.forEach((entries) => {
    const groupCards = Array.from(new Set(entries.map((entry) => entry.card)));

    const buttonOffsets = entries.map(({ button, card }) => ({
      button,
      card,
      offset:
        button.getBoundingClientRect().top - card.getBoundingClientRect().top,
    }));

    const maxButtonOffset = Math.max(
      ...buttonOffsets.map((entry) => Math.ceil(entry.offset)),
    );

    buttonOffsets.forEach(({ button, offset }) => {
      const extraSpacing = Math.max(0, Math.ceil(maxButtonOffset - offset));

      button.style.display = "inline-flex";
      button.style.alignSelf = "center";
      button.style.marginTop = `${extraSpacing}px`;
    });

    const maxHeight = Math.max(
      ...groupCards.map((card) => Math.ceil(card.getBoundingClientRect().height)),
    );

    groupCards.forEach((card) => {
      card.style.minHeight = `${maxHeight}px`;
    });
  });
}

function getAccountLabel(user: AuthUser | null) {
  if (!user) {
    return "";
  }

  return (
    String(user.username ?? "").trim() ||
    String(user.fullName ?? "").trim() ||
    String(user.email ?? "").trim()
  );
}

function shouldCompactStorefront(pathname: string) {
  const excludedPrefixes = [
    "/auth",
    "/account",
    "/cart",
    "/checkout",
    "/api",
  ];

  return !excludedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export default function LayoutHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [accountLabel, setAccountLabel] = useState("");
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const searchPanelRef = useRef<HTMLDivElement | null>(null);
  const shouldUseCompactMain = shouldCompactStorefront(pathname);

  const openCartPage = () => {
    if (typeof window !== "undefined") {
      window.location.assign("/cart");
      return;
    }

    router.push("/cart");
  };

  const handleAccountButtonClick = () => {
    if (!accountLabel) {
      router.push("/auth/login");
      return;
    }

    setIsAccountMenuOpen((value) => !value);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("kyo-auth-user");
      window.dispatchEvent(new Event("auth-updated"));
    }

    setAccountLabel("");
    setIsAccountMenuOpen(false);
    router.refresh();
  };

  const handleOpenAccountPage = () => {
    setIsAccountMenuOpen(false);
    router.push("/account");
  };

  const handleOpenSearch = () => {
    setIsSearchOpen((value) => !value);
    setIsAccountMenuOpen(false);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const keyword = searchKeyword.trim();

    if (!keyword) {
      return;
    }

    setIsSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  useEffect(() => {
    const syncCartCount = () => {
      setCartCount(getCartCount(readCart()));
    };

    syncCartCount();

    window.addEventListener("storage", syncCartCount);
    window.addEventListener("cart-updated", syncCartCount as EventListener);

    return () => {
      window.removeEventListener("storage", syncCartCount);
      window.removeEventListener("cart-updated", syncCartCount as EventListener);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const rawUser = window.localStorage.getItem("kyo-auth-user");

    if (!rawUser) {
      return;
    }

    try {
      const parsedUser = JSON.parse(rawUser) as Record<string, unknown>;
      const repairedUser = repairObjectTextFields(parsedUser);

      if (JSON.stringify(repairedUser) !== JSON.stringify(parsedUser)) {
        window.localStorage.setItem(
          "kyo-auth-user",
          JSON.stringify(repairedUser),
        );
        window.dispatchEvent(new Event("auth-updated"));
      }
    } catch {
      // Ignore invalid persisted session data.
    }
  }, []);

  useEffect(() => {
    const syncAuthLabel = () => {
      if (typeof window === "undefined") {
        setAccountLabel("");
        return;
      }

      try {
        const storedUser = window.localStorage.getItem("kyo-auth-user");

        if (!storedUser) {
          setAccountLabel("");
          return;
        }

        const parsedUser = JSON.parse(storedUser) as AuthUser;
        setAccountLabel(getAccountLabel(parsedUser));
      } catch {
        setAccountLabel("");
      }
    };

    syncAuthLabel();

    window.addEventListener("storage", syncAuthLabel);
    window.addEventListener("auth-updated", syncAuthLabel as EventListener);

    return () => {
      window.removeEventListener("storage", syncAuthLabel);
      window.removeEventListener("auth-updated", syncAuthLabel as EventListener);
    };
  }, [pathname]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }

      if (
        searchPanelRef.current &&
        !searchPanelRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    setIsAccountMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      applyListingCardLayout();
    });

    const timeouts = [120, 320, 720].map((delay) =>
      window.setTimeout(() => {
        applyListingCardLayout();
      }, delay),
    );

    const handleResize = () => {
      applyListingCardLayout();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(frame);
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
      window.removeEventListener("resize", handleResize);
    };
  }, [pathname]);

  return (
    <>
      {shouldUseCompactMain ? (
        <style jsx global>{`
          @media (min-width: 1024px) {
            body main {
              zoom: 0.94;
            }
          }
        `}</style>
      ) : null}

      <header className="relative z-40 w-full border-b border-[#f1d8de] bg-white shadow-[0_10px_30px_rgba(224,112,146,0.08)]">
        <div className="bg-[#f586a3] text-white">
          <div className="mx-auto flex min-h-10 max-w-[1540px] flex-col gap-2 px-4 py-2 text-sm font-semibold lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <p>Bộ Sưu Tập Cực Đỉnh &amp; Quà tặng cao cấp chính hãng</p>

            <div className="flex flex-wrap items-center gap-3 text-white">
              <span className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                  <path d="M3 5h18v14H3V5Zm2 2v.5L12 13l7-5.5V7H5Zm14 10V9.9l-7 5.4-7-5.4V17h14Z" />
                </svg>
                mykingdom@gmail.com
              </span>
              <span className="hidden h-4 w-px bg-white/40 md:block" />
              <span className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                  <path d="M6.6 10.8c1.6 3.1 3.9 5.4 7 7l2.3-2.3c.3-.3.7-.4 1.1-.3 1.2.4 2.5.7 3.9.7.6 0 1.1.5 1.1 1.1V21c0 .6-.5 1.1-1.1 1.1C10.2 22.1 1.9 13.8 1.9 3.1 1.9 2.5 2.4 2 3 2h4.1c.6 0 1.1.5 1.1 1.1 0 1.4.2 2.7.7 3.9.1.4 0 .8-.3 1.1l-2 2.7Z" />
                </svg>
                0286.2638.600
              </span>
              <div className="flex items-center gap-3">
                {topSocialIcons.map((item) => (
                  <span key={item.label} aria-label={item.label}>
                    {item.icon}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#fff6f8]">
          <div className="mx-auto flex max-w-[1540px] flex-col gap-6 px-4 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <a href="#" className="flex shrink-0 items-center">
              <Image
                src={logoSrc}
                alt="Logo KYO"
                width={360}
                height={90}
                className="h-[64px] w-auto object-contain md:h-[76px]"
                priority
              />
            </a>

            <div className="grid flex-1 gap-5 md:grid-cols-2 xl:grid-cols-4 xl:pl-6">
              {utilityItems.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="mt-1 text-[#ff835d]">{item.icon}</div>
                  <div className="space-y-1">
                    <p className="text-[0.95rem] font-semibold text-[#16111d]">
                      {item.title}
                    </p>
                    <p className="text-[0.9rem] text-[#4d4150]">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div ref={searchPanelRef} className="relative">
                <ActionIcon label="Search" onClick={handleOpenSearch}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-current">
                    <path d="m21 19.6-4.7-4.7a7 7 0 1 0-1.4 1.4L19.6 21 21 19.6ZM5 10a5 5 0 1 1 10 0A5 5 0 0 1 5 10Z" />
                  </svg>
                </ActionIcon>

                {isSearchOpen ? (
                  <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[320px] rounded-[24px] border border-[#f3d2dc] bg-white p-4 shadow-[0_20px_50px_rgba(44,20,34,0.14)]">
                    <form className="space-y-3" onSubmit={handleSearchSubmit}>
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#ef4c89]">
                        Tìm kiếm
                      </p>
                      <input
                        value={searchKeyword}
                        onChange={(event) => setSearchKeyword(event.target.value)}
                        placeholder="Nhập tên sản phẩm..."
                        className="h-11 w-full rounded-full border border-[#f3d2dc] bg-[#fff8fb] px-4 text-sm text-[#241821] outline-none transition placeholder:text-[#9b8791] focus:border-[#ef4c89]"
                      />
                      <button
                        type="submit"
                        className="flex h-11 w-full items-center justify-center rounded-full bg-[#ef4c89] text-sm font-bold text-white transition hover:bg-[#e13f7d]"
                      >
                        Tìm sản phẩm
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>

              <div ref={accountMenuRef} className="relative">
                <button
                  type="button"
                  onClick={handleAccountButtonClick}
                  aria-label={accountLabel ? `Tài khoản ${accountLabel}` : "Tài khoản"}
                  className="flex h-11 max-w-[220px] items-center gap-2 rounded-full bg-[#ec3a7a] px-3 text-white transition hover:bg-[#d82d69]"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 shrink-0 fill-current">
                    <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2.2c-4.3 0-7.8 2.6-7.8 5.8 0 .6.5 1 1 1h13.6c.6 0 1-.4 1-1 0-3.2-3.5-5.8-7.8-5.8Z" />
                  </svg>
                  <span className="max-w-[150px] truncate text-sm font-semibold">
                    {accountLabel || "Tài khoản"}
                  </span>
                </button>

                {accountLabel && isAccountMenuOpen ? (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 rounded-[24px] border border-[#f3d2dc] bg-white p-3 shadow-[0_20px_50px_rgba(44,20,34,0.14)]">
                    <p className="mb-3 truncate px-2 text-sm font-semibold text-[#2b1d24]">
                      {accountLabel}
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenAccountPage}
                      className="mb-2 flex w-full items-center justify-center rounded-full border border-[#f3d2dc] bg-white px-4 py-3 text-sm font-bold text-[#2b1d24] transition hover:bg-[#fff4f7]"
                    >
                      Trang account
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-center rounded-full border border-[#f3d2dc] bg-[#fff4f7] px-4 py-3 text-sm font-bold text-[#e83e7f] transition hover:bg-[#ffe7ef]"
                    >
                      Đăng xuất
                    </button>
                  </div>
                ) : null}
              </div>

              <ActionIcon
                label="Cart"
                onClick={openCartPage}
                badgeCount={cartCount}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-current">
                  <path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM6.2 6l.4 2H20l-1.7 6.5a1 1 0 0 1-1 .8H8a1 1 0 0 1-1-.8L4.6 4H2V2h4a1 1 0 0 1 1 .8L7.4 4H22v2H6.2Z" />
                </svg>
              </ActionIcon>
            </div>
          </div>
        </div>

        <div className="border-t border-[#f2e6e8] bg-white">
          <div className="mx-auto max-w-[1540px] overflow-x-auto px-4 lg:px-8">
          <nav className="flex min-w-max flex-nowrap items-center gap-4 py-3.5 text-[0.84rem] font-medium uppercase tracking-[-0.01em] text-[#5a4a50] xl:min-w-0 xl:justify-between xl:gap-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`flex shrink-0 items-center gap-1 whitespace-nowrap transition ${
                    pathname === item.href || (item.active && pathname === "/")
                      ? "text-[#f03f7d]"
                      : "hover:text-[#f03f7d]"
                  }`}
                >
                <span>{typeof item.label === "string" ? normalizeMenuLabel(item.label) : item.label}</span>
                  {item.badge ? (
                    <span className="rounded bg-[#f03f7d] px-1.5 py-0.5 text-[0.58rem] font-bold leading-none text-white">
                      {item.badge}
                    </span>
                  ) : null}
                  {item.arrow ? <Caret /> : null}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
