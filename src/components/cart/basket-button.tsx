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
      className="border-porcelain/40 bg-porcelain/10 text-porcelain hover:bg-porcelain/20 hover:border-porcelain focus-visible:outline-honey-amber relative flex h-8 w-8 items-center justify-center rounded-full border transition focus-visible:outline focus-visible:outline-offset-2 xl:h-auto xl:w-auto xl:px-3.5 xl:py-1.5 xl:text-[13px] xl:font-medium"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-4 w-4 xl:hidden"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
        />
      </svg>
      {count > 0 && (
        <span className="bg-honey-amber text-ink absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold xl:hidden">
          {count}
        </span>
      )}
      <span className="hidden xl:inline">Basket{count > 0 ? ` (${count})` : ''}</span>
    </button>
  )
}
