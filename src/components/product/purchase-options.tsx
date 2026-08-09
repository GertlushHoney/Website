'use client'

import { useState, useTransition } from 'react'
import { checkoutWithVariant } from '@/lib/shopify/actions'

type PurchaseType = 'one-time' | 'subscription'

function formatGBP(amount: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount)
}

// One-time purchases check out for real via Shopify (see
// /docs/technical-architecture.md) once a variantId is supplied — otherwise
// this falls back to an honest mailto rather than a fake "order placed"
// confirmation. Subscriptions always use the mailto fallback: there's no
// Shopify Selling Plan configured yet, so there's no real recurring cart to
// create; moving to Selling Plans is the eventual automated version of the
// same choice offered here. Delivery is a flat per-order fee (Royal Mail
// Tracked 48), not per jar — charged once per order/shipment, same for
// subscriptions since no free-delivery threshold or subscriber perk has
// been decided.
const SUBSCRIPTION_MINIMUM_MONTHS = 6

export function PurchaseOptions({
  productName,
  unitPrice,
  subscriptionUnitPrice,
  deliveryPrice,
  contactEmail = 'gertlushhoney@outlook.com',
  variantId,
  stockCount,
}: {
  productName: string
  unitPrice: number
  subscriptionUnitPrice: number
  deliveryPrice: number
  contactEmail?: string
  // Real Shopify variant to check out with a live cart, when available.
  // Subscriptions still use the mailto fallback below — there's no Shopify
  // Selling Plan set up yet, so there's no real recurring cart to create.
  variantId?: string | null
  // Real Shopify inventory count. null/undefined means "unknown" (Shopify
  // not configured, product not found) — shown as nothing, never a guess.
  stockCount?: number | null
}) {
  const [type, setType] = useState<PurchaseType>('one-time')
  const [quantity, setQuantity] = useState(1)
  const isSoldOut = stockCount !== null && stockCount !== undefined && stockCount <= 0
  const maxQuantity = Math.min(12, stockCount && stockCount > 0 ? stockCount : 12)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [isCheckingOut, startCheckout] = useTransition()

  function handleCheckout() {
    if (!variantId) return
    setCheckoutError(null)
    startCheckout(async () => {
      try {
        const { checkoutUrl } = await checkoutWithVariant(variantId, quantity)
        window.location.href = checkoutUrl
      } catch {
        setCheckoutError("Couldn't start checkout — please email us instead.")
      }
    })
  }

  const isSubscription = type === 'subscription'
  const canCheckoutLive = Boolean(variantId) && !isSubscription
  const subtotal = unitPrice * quantity
  const total = subtotal + deliveryPrice
  const monthlyTotal = subscriptionUnitPrice + deliveryPrice
  const minimumTermTotal = monthlyTotal * SUBSCRIPTION_MINIMUM_MONTHS

  const subject = isSubscription
    ? `${productName} monthly subscription`
    : `${productName} order (x${quantity})`
  const body = isSubscription
    ? `I'd like to subscribe to one jar of ${productName} a month, at ${formatGBP(subscriptionUnitPrice)}/jar plus ${formatGBP(deliveryPrice)} delivery (${formatGBP(monthlyTotal)}/month total), on the ${SUBSCRIPTION_MINIMUM_MONTHS}-month minimum term.`
    : `I'd like to order ${quantity} jar${quantity > 1 ? 's' : ''} of ${productName} (${formatGBP(subtotal)} + ${formatGBP(deliveryPrice)} delivery = ${formatGBP(total)} total).`
  const mailtoHref = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  return (
    <div className="border-ink-line bg-honeycomb-surface mt-8 rounded-xl border p-5">
      <fieldset>
        <legend className="text-porcelain text-sm font-semibold">How would you like it?</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label
            className={`focus-within:outline-honey-amber cursor-pointer rounded-lg border px-4 py-3 text-sm transition focus-within:outline focus-within:outline-offset-2 ${
              type === 'one-time'
                ? 'border-comb-gold bg-ink-surface text-porcelain'
                : 'border-ink-line text-porcelain/70 hover:text-porcelain'
            }`}
          >
            <input
              type="radio"
              name="purchase-type"
              value="one-time"
              checked={type === 'one-time'}
              onChange={() => setType('one-time')}
              className="sr-only"
            />
            <span className="font-semibold">One-time purchase</span>
            <span className="block text-xs opacity-70">{formatGBP(unitPrice)} a jar</span>
          </label>

          <label
            className={`focus-within:outline-honey-amber cursor-pointer rounded-lg border px-4 py-3 text-sm transition focus-within:outline focus-within:outline-offset-2 ${
              type === 'subscription'
                ? 'border-comb-gold bg-ink-surface text-porcelain'
                : 'border-ink-line text-porcelain/70 hover:text-porcelain'
            }`}
          >
            <input
              type="radio"
              name="purchase-type"
              value="subscription"
              checked={type === 'subscription'}
              onChange={() => setType('subscription')}
              className="sr-only"
            />
            <span className="font-semibold">Subscribe monthly</span>
            <span className="block text-xs opacity-70">
              {formatGBP(subscriptionUnitPrice)}/jar &middot; {SUBSCRIPTION_MINIMUM_MONTHS}-month
              minimum
            </span>
          </label>
        </div>
      </fieldset>

      {!isSubscription && (
        <div className="mt-4 flex items-center gap-3">
          <span className="text-porcelain/60 text-sm">Quantity</span>
          <div className="border-ink-line flex items-center rounded-full border">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="text-porcelain hover:text-honey-amber focus-visible:outline-honey-amber px-3 py-1.5 text-lg leading-none focus-visible:outline focus-visible:outline-offset-2"
            >
              −
            </button>
            <span className="text-porcelain w-6 text-center text-sm" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              className="text-porcelain hover:text-honey-amber focus-visible:outline-honey-amber px-3 py-1.5 text-lg leading-none focus-visible:outline focus-visible:outline-offset-2"
            >
              +
            </button>
          </div>
        </div>
      )}

      {stockCount !== null && stockCount !== undefined && (
        <p className={`mt-2 text-xs ${isSoldOut ? 'text-honey-amber' : 'text-porcelain/50'}`}>
          {isSoldOut
            ? 'Out of stock — check back soon.'
            : `${stockCount} jar${stockCount === 1 ? '' : 's'} in stock`}
        </p>
      )}

      <dl className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-porcelain/60">
            {isSubscription ? `${productName} (monthly)` : `Subtotal (x${quantity})`}
          </dt>
          <dd className="text-porcelain/90">
            {formatGBP(isSubscription ? subscriptionUnitPrice : subtotal)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-porcelain/60">Delivery</dt>
          <dd className="text-porcelain/90">{formatGBP(deliveryPrice)}</dd>
        </div>
      </dl>
      <p className="text-porcelain border-ink-line mt-2 flex justify-between border-t pt-2 text-lg font-semibold">
        <span>{isSubscription ? 'Total / month' : 'Total'}</span>
        <span>{formatGBP(isSubscription ? monthlyTotal : total)}</span>
      </p>
      {isSubscription && (
        <p className="text-porcelain/50 mt-1 text-xs">
          {SUBSCRIPTION_MINIMUM_MONTHS}-month minimum term &middot; {formatGBP(minimumTermTotal)}{' '}
          over {SUBSCRIPTION_MINIMUM_MONTHS} months &middot; cancel any time after that
        </p>
      )}

      {isSoldOut && !isSubscription ? (
        <button
          type="button"
          disabled
          className="bg-ink-line text-porcelain/50 mt-4 inline-block cursor-not-allowed rounded-full px-6 py-2.5 text-sm font-semibold"
        >
          Sold out
        </button>
      ) : canCheckoutLive ? (
        <>
          <p className="text-porcelain/60 mt-3 text-sm">
            Checkout is handled securely by Shopify — you&apos;ll be taken there to pay.
          </p>
          {checkoutError && (
            <p className="text-honey-amber mt-2 text-sm" role="alert">
              {checkoutError}
            </p>
          )}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-4 inline-block rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4 disabled:opacity-60"
          >
            {isCheckingOut ? 'Redirecting to checkout…' : 'Buy now'}
          </button>
        </>
      ) : (
        <>
          <p className="text-porcelain/60 mt-3 text-sm">
            Online ordering isn&apos;t live yet —{' '}
            {isSubscription
              ? `monthly subscriptions are set up by hand for now, on a ${SUBSCRIPTION_MINIMUM_MONTHS}-month minimum term.`
              : "we're finishing the shop first."}{' '}
            Email us and we&apos;ll sort it directly.
          </p>
          <a
            href={mailtoHref}
            className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-4 inline-block rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
          >
            {isSubscription ? 'Email to subscribe' : 'Email to order'}
          </a>
        </>
      )}
    </div>
  )
}
