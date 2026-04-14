'use client'

import type { CSSProperties } from 'react'
import { useState } from 'react'

type ProductInput = {
  id: string | number
  name: string
  price: string | number
  image?: string
}

type CartItem = ProductInput & {
  quantity: number
}

export default function AddToCartButton({
  product,
  className,
  style,
}: {
  product: ProductInput
  className?: string
  style?: CSSProperties
}) {
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    if (typeof window === 'undefined') return

    try {
      const raw = window.localStorage.getItem('cart')
      const cart: CartItem[] = raw ? JSON.parse(raw) : []

      const existingIndex = cart.findIndex(
        (item) => String(item.id) === String(product.id)
      )

      if (existingIndex >= 0) {
        cart[existingIndex].quantity += 1
      } else {
        cart.push({
          ...product,
          quantity: 1,
        })
      }

      window.localStorage.setItem('cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cart-updated'))

      setAdded(true)
      window.setTimeout(() => setAdded(false), 1500)
    } catch (error) {
      console.error('Add to cart failed:', error)
    }
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className={className}
      style={{
        marginTop: '16px',
        padding: '12px 20px',
        border: 'none',
        borderRadius: '10px',
        backgroundColor: added ? '#16a34a' : '#111827',
        color: '#ffffff',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ...style,
      }}
    >
      {added ? 'Đã thêm vào giỏ' : 'Thêm giỏ hàng'}
    </button>
  )
}
