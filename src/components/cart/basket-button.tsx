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
      className="hover:text-porcelain focus-visible:outline-honey-amber rounded-full focus-visible:outline focus-visible:outline-offset-2"
    >
      Basket{count > 0 ? ` (${count})` : ''}
    </button>
  )
}
