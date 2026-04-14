import type { CSSProperties, ReactNode } from 'react'

import Link from 'next/link'

type NavItem = {
  href: string
  label: string
  badge?: 'HOT' | 'SALE'
  hasChevron?: boolean
  active?: boolean
}

const navItems: NavItem[] = [
  { href: '/', label: 'TRANG CHỦ', active: true },
  { href: '/shop', label: 'QUÀ TẶNG', badge: 'HOT' },
  { href: '/shop', label: 'SON MÔI', hasChevron: true },
  { href: '/shop', label: 'NƯỚC HOA', hasChevron: true },
  { href: '/shop', label: 'CHỐNG NẮNG' },
  { href: '/shop', label: 'TRANG ĐIỂM MẶT', hasChevron: true },
  { href: '/shop', label: 'TRANG ĐIỂM MẮT', hasChevron: true },
  { href: '/shop', label: 'CHĂM SÓC DA', hasChevron: true },
  { href: '/shop', label: 'CHĂM SÓC TÓC' },
  { href: '/shop', label: 'KHUYẾN MÃI', badge: 'SALE' },
  { href: '/shop', label: 'SHOP ALL' },
  { href: '/shop', label: 'TIN TỨC', hasChevron: true },
]

const featureItems = [
  {
    icon: <FacebookBlockIcon />,
    title: 'Facebook',
    text: 'fb.com/kyoauthentic',
  },
  {
    icon: <AwardIcon />,
    title: 'Đảm bảo chất lượng',
    text: '100% chính hãng',
  },
  {
    icon: <TruckIcon />,
    title: 'Free ship',
    text: 'đơn hàng từ 800k',
  },
  {
    icon: <PhoneOutlineIcon />,
    title: 'Hotline: 0975 436 989',
    text: 'tư vấn miễn phí 24/7',
  },
]

export default function SiteHeader() {
  return (
    <header
      style={{
        position: 'relative',
        zIndex: 30,
        background: '#ffffff',
        borderBottom: '1px solid #f5d6e0',
      }}
    >
      <TopBar />

      <div
        style={{
          background: '#fbf4f6',
          borderBottom: '1px solid #f2e3e8',
        }}
      >
        <div
          style={{
            maxWidth: '1640px',
            margin: '0 auto',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '28px',
            flexWrap: 'wrap',
          }}
        >
          <LogoBlock />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(180px, 1fr))',
              gap: '32px',
              flex: 1,
              minWidth: '720px',
            }}
          >
            {featureItems.map((item) => (
              <div
                key={item.title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  minHeight: '56px',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </span>
                <div>
                  <div
                    style={{
                      color: '#111111',
                      fontSize: '17px',
                      fontWeight: 700,
                      lineHeight: 1.2,
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      marginTop: '6px',
                      color: '#111111',
                      fontSize: '17px',
                      fontWeight: 400,
                      lineHeight: 1.15,
                    }}
                  >
                    {item.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              paddingRight: '6px',
            }}
          >
            <ActionCircle href="/shop" ariaLabel="Tìm kiếm">
              <SearchIcon />
            </ActionCircle>

            <Link
              href="/cart"
              aria-label="Giỏ hàng"
              style={{
                position: 'relative',
                width: '44px',
                height: '44px',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ef3f8f',
                textDecoration: 'none',
              }}
            >
              <CartIcon />
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-6px',
                  minWidth: '20px',
                  height: '20px',
                  padding: '0 5px',
                  borderRadius: '999px',
                  background: '#ff4b8f',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  boxShadow: '0 0 0 2px #fbf4f6',
                }}
              >
                1
              </span>
            </Link>
          </div>
        </div>
      </div>

      <nav
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #f3d6df',
        }}
      >
        <div
          style={{
            maxWidth: '1640px',
            margin: '0 auto',
            padding: '0 24px',
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          {navItems.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: item.active ? '#ef3f8f' : '#4a4a4a',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: 1,
                letterSpacing: '-0.01em',
                padding: '8px 0',
                textTransform: 'uppercase',
              }}
            >
              <span>{item.label}</span>
              {item.badge ? <Badge type={item.badge} /> : null}
              {item.hasChevron ? <ChevronDownIcon /> : null}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}

function TopBar() {
  return (
    <div
      style={{
        background: '#f58daa',
        color: '#ffffff',
      }}
    >
      <div
        style={{
          maxWidth: '1640px',
          margin: '0 auto',
          minHeight: '38px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '17px',
            fontWeight: 500,
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          Mykingdom - Đồ chơi & Quà tặng cao cấp chính hãng
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            flexWrap: 'wrap',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          <span style={topMetaStyle}>
            <MailIcon />
            <span>kyoauthentic@gmail.com</span>
          </span>
          <span style={{ color: 'rgba(255,255,255,0.45)' }}>|</span>
          <span style={topMetaStyle}>
            <PhoneIcon />
            <span>024.66.737.999</span>
          </span>
          <span style={socialIconWrapStyle}>
            <FacebookIcon />
          </span>
          <span style={socialIconWrapStyle}>
            <InstagramIcon />
          </span>
          <span style={socialIconWrapStyle}>
            <YoutubeIcon />
          </span>
        </div>
      </div>
    </div>
  )
}

function LogoBlock() {
  return (
    <Link
      href="/"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '250px',
        textDecoration: 'none',
      }}
    >
      <LogoIcon />
      <span
        style={{
          color: '#ef3f8f',
          fontSize: '34px',
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: '-0.04em',
        }}
      >
        KYO.VN
      </span>
    </Link>
  )
}

function Badge({ type }: { type: 'HOT' | 'SALE' }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '18px',
        padding: type === 'SALE' ? '0 5px' : '0 4px',
        borderRadius: '3px',
        background: '#ef3f8f',
        color: '#ffffff',
        fontSize: type === 'SALE' ? '10px' : '9px',
        fontWeight: 700,
        lineHeight: 1,
        transform: 'translateY(-1px)',
      }}
    >
      {type}
    </span>
  )
}

function ActionCircle({
  href,
  ariaLabel,
  children,
}: {
  href: string
  ariaLabel: string
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '999px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ef3f8f',
        textDecoration: 'none',
      }}
    >
      {children}
    </Link>
  )
}

function MailIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
      <path
        d="M1.25 1.5H14.75V10.5H1.25V1.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M1.75 2L8 6.75L14.25 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3.3 1.4C3.56 1.14 3.95 1.05 4.3 1.16L5.74 1.64C6.13 1.77 6.4 2.11 6.45 2.52L6.61 3.89C6.65 4.22 6.54 4.55 6.31 4.78L5.33 5.76C5.97 7.14 6.86 8.03 8.24 8.67L9.22 7.69C9.45 7.46 9.78 7.35 10.11 7.39L11.48 7.55C11.89 7.6 12.23 7.87 12.36 8.26L12.84 9.7C12.95 10.05 12.86 10.44 12.6 10.7L11.69 11.61C11.17 12.13 10.41 12.35 9.69 12.18C7.82 11.74 6.05 10.75 4.61 9.39C3.25 7.95 2.26 6.18 1.82 4.31C1.65 3.59 1.87 2.83 2.39 2.31L3.3 1.4Z"
        fill="currentColor"
      />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="9" height="16" viewBox="0 0 9 16" fill="none" aria-hidden="true">
      <path
        d="M8.28 0.23V2.78H6.77C5.58 2.78 5.35 3.35 5.35 4.17V6H8.18L7.81 8.86H5.35V16H2.39V8.86H0V6H2.39V3.88C2.39 1.5 3.84 0.2 5.96 0.2C6.98 0.2 7.86 0.27 8.28 0.23Z"
        fill="currentColor"
      />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="1.1" y="1.1" width="12.8" height="12.8" rx="3.6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7.5" cy="7.5" r="3.05" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="11.15" cy="3.9" r="0.85" fill="currentColor" />
    </svg>
  )
}

function YoutubeIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
      <path
        d="M15.32 2.19C15.15 1.55 14.65 1.05 14.01 0.88C12.84 0.56 8 0.56 8 0.56C8 0.56 3.16 0.56 1.99 0.88C1.35 1.05 0.85 1.55 0.68 2.19C0.36 3.36 0.36 5.8 0.36 5.8C0.36 5.8 0.36 8.24 0.68 9.41C0.85 10.05 1.35 10.55 1.99 10.72C3.16 11.04 8 11.04 8 11.04C8 11.04 12.84 11.04 14.01 10.72C14.65 10.55 15.15 10.05 15.32 9.41C15.64 8.24 15.64 5.8 15.64 5.8C15.64 5.8 15.64 3.36 15.32 2.19Z"
        fill="currentColor"
      />
      <path d="M6.45 8.27V3.33L10.73 5.8L6.45 8.27Z" fill="#F58DAA" />
    </svg>
  )
}

function FacebookBlockIcon() {
  return (
    <svg width="42" height="42" viewBox="0 0 42 42" fill="none" aria-hidden="true">
      <rect width="42" height="42" rx="4" fill="#FFB38B" />
      <path
        d="M24.46 7.2V12.68H21.2C19.38 12.68 19.03 13.89 19.03 15.22V18.42H24.14L23.33 24.57H19.03V40H13.65V24.57H9.3V18.42H13.65V13.87C13.65 8.72 16.29 5.9 20.16 5.9C22.01 5.9 23.63 6.05 24.46 7.2Z"
        fill="white"
      />
    </svg>
  )
}

function AwardIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <circle cx="26" cy="17" r="14" stroke="#FF8B7F" strokeWidth="3" />
      <circle cx="26" cy="17" r="9.5" stroke="#FFB38B" strokeWidth="2" />
      <path d="M18 31L12 47L24 41.5L18 31Z" fill="#FF8B7F" />
      <path d="M34 31L28 41.5L40 47L34 31Z" fill="#F29A85" />
      <path d="M26 10L28.01 14.6L33 15.2L29.3 18.54L30.34 23.4L26 20.72L21.66 23.4L22.7 18.54L19 15.2L23.99 14.6L26 10Z" fill="#FFB38B" />
    </svg>
  )
}

function TruckIcon() {
  return (
    <svg width="58" height="34" viewBox="0 0 58 34" fill="none" aria-hidden="true">
      <path d="M2 7.5H31V24H2V7.5Z" stroke="#FF8B7F" strokeWidth="2.2" />
      <path d="M31 12H41L47 18V24H31V12Z" stroke="#FF8B7F" strokeWidth="2.2" />
      <circle cx="14" cy="27.5" r="4" stroke="#FF8B7F" strokeWidth="2.2" />
      <circle cx="40" cy="27.5" r="4" stroke="#FF8B7F" strokeWidth="2.2" />
      <path d="M10 4.5H23" stroke="#FFB38B" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M7 9H16" stroke="#FFB38B" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function PhoneOutlineIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true">
      <path
        d="M15.2 6.7C16.1 5.8 17.45 5.47 18.68 5.86L23.76 7.55C25.14 8.01 26.09 9.22 26.27 10.67L26.83 15.47C26.97 16.62 26.57 17.78 25.77 18.58L22.33 22.02C24.58 26.86 27.7 29.98 32.54 32.23L35.98 28.79C36.78 27.99 37.94 27.59 39.09 27.73L43.89 28.29C45.34 28.47 46.55 29.42 47.01 30.8L48.7 35.88C49.09 37.11 48.76 38.46 47.86 39.36L44.65 42.57C42.81 44.41 40.12 45.19 37.57 44.58C30.99 43.04 24.78 39.56 19.74 34.8C14.98 29.76 11.5 23.55 9.96 16.97C9.35 14.42 10.13 11.73 11.97 9.89L15.2 6.7Z"
        transform="scale(0.7) translate(5 5)"
        stroke="#FF9BA0"
        strokeWidth="2.6"
        fill="none"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6.5" stroke="white" strokeWidth="2.2" />
      <path d="M14 14L18.2 18.2" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M2 3H4.9L6.4 13.2H17.1L19 6.2H7.2"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="17.6" r="1.4" fill="white" />
      <circle cx="16.1" cy="17.6" r="1.4" fill="white" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="9" height="6" viewBox="0 0 9 6" fill="none" aria-hidden="true">
      <path
        d="M1 1.25L4.5 4.75L8 1.25"
        stroke="#9ca3af"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LogoIcon() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" aria-hidden="true">
      <circle cx="30" cy="30" r="30" fill="#EF3F8F" />
      <path
        d="M18.5 28C18.5 18.9 24.3 12.8 30.3 12.8C36.1 12.8 41.4 17.8 41.4 25.1C41.4 31.8 38.8 37.6 36.1 40.7C33.9 43.2 33.3 44.7 33.3 47.5H26.7C26.7 44.9 26.2 43.5 24.1 41C20.7 37 18.5 32.4 18.5 28Z"
        fill="white"
      />
      <path
        d="M20.7 25.2C22.1 21.1 25.6 17.5 30.2 17.5C35.8 17.5 39.5 21.6 39.5 26.8C39.5 31.4 37.8 35.2 35.8 38C33.4 35.7 29.4 34.4 25.7 34.4C23.6 34.4 21.9 34.7 20.8 35.2C19.3 32.3 19 29.8 20.7 25.2Z"
        fill="#FFC1D6"
      />
      <ellipse cx="29.6" cy="30.3" rx="6.9" ry="8.4" fill="white" />
      <path
        d="M27.8 29.8C27.8 28.4 28.8 27.4 30.2 27.4C31.5 27.4 32.5 28.4 32.5 29.8C32.5 31.2 31.5 32.2 30.2 32.2C28.8 32.2 27.8 31.2 27.8 29.8Z"
        fill="#F6A3BE"
      />
      <path
        d="M22.8 22.2C25.2 18.2 28.5 16 30.8 16C30.8 20.7 29 24.8 24.2 27.2C23.1 25.5 22.8 23.9 22.8 22.2Z"
        fill="#FDE1EC"
      />
    </svg>
  )
}

const topMetaStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '7px',
}

const socialIconWrapStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
}
