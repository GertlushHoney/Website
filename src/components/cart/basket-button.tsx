'use client'

import { useCart } from './cart-context'

export function BasketButton() {
  const { cart, open } = useCart()
  const count = cart?.totalQuantity ?? 0

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Basket, ${count} item${count === 1 ? '' : 's'}`}
      className="border-porcelain/40 bg-porcelain/10 text-porcelain hover:bg-porcelain/20 hover:border-porcelain focus-visible:outline-honey-amber rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition focus-visible:outline focus-visible:outline-offset-2"
    >
      Basket{count > 0 ? ` (${count})` : ''}
    </button>
  )
}
