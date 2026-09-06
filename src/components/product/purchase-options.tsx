'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/components/cart/cart-context'
import { RestockAlertForm } from '@/components/product/restock-alert-form'
import { formatHoneySelection, tallyJarSelections } from '@/lib/hamper'
import { FREE_DELIVERY_THRESHOLD_GBP } from '@/lib/delivery'

type PurchaseType = 'one-time' | 'subscription'

function formatGBP(amount: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount)
}

// One-time purchases add to a real Shopify basket (see
// /docs/technical-architecture.md) once a variantId is supplied — otherwise
// this falls back to an honest mailto rather than a fake "order placed"
// confirmation. Subscriptions do the same once a real Shopify Selling Plan
// exists for the product (subscriptionSellingPlanId, created via the
// Shopify Subscriptions app in the merchant's admin — never assumed or
// invented here); otherwise they fall back to the same honest mailto.
// Delivery (Royal Mail Tracked 48) is charged once per order/shipment,
// never per jar. Its real cost is now weight-based (see
// docs/technical-architecture.md, "Shipping weight sync") and computed by
// Shopify itself at checkout — this component never states a specific
// number, only that it's calculated at checkout and free over
// FREE_DELIVERY_THRESHOLD_GBP (see src/lib/delivery.ts).
//
// No minimum term (dropped 2026-08-10) — cancel any time, provided at
// least 7 days' notice before the next monthly charge. Billed on the
// same date each month as the subscriber signed up (not a shared fixed
// date), so a mid-month signup isn't hit with a second charge days
// later, and manual invoicing spreads across the month rather than
// piling up on one day.
const CANCELLATION_NOTICE_DAYS = 7

// Must match the "Honey selection" variant value created in Shopify for
// each hamper product — see docs/technical-architecture.md. Deliberately
// not a per-honey Shopify variant (that doesn't scale as the postcode
// range grows); instead this variant just triggers the picker below,
// built live from whatever honeys are actually active right now.
const HONEY_CHOICE_TRIGGER_LABEL = 'Choose your own'
const HONEY_CHOICE_ATTRIBUTE_KEY = 'Honey selection'
const SESSION_DATE_ATTRIBUTE_KEY = 'Session date'

function formatSessionDate(dateISO: string) {
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export type HoneyJarOption = { name: string; quantityAvailable: number }

export type ExperienceSessionOption = { key: string; date: string; placesRemaining: number }

export type PurchaseOptionsVariant = {
  id: string
  label: string
  price: number
  availableForSale: boolean
  quantityAvailable: number
}

export function PurchaseOptions({
  productName,
  productHandle,
  unitPrice,
  unitLabel = 'jar',
  subscriptionUnitPrice,
  subscriptionSellingPlanId,
  contactEmail = 'sales@gertlushhoney.co.uk',
  variantId,
  stockCount,
  variants,
  variantGroupLabel = 'Choose an option',
  honeyJarOptions,
  hamperJarCount,
  experienceSessions,
  beekeeper,
}: {
  productName: string
  // The real Shopify product handle — tags the restock-alert signup with
  // restock:<handle> (see RestockAlertForm) so it's specific to this
  // product, not a generic "email me" list.
  productHandle: string
  unitPrice: number
  // What one unit is called in copy ("jar", "item", "bar"...) — honey
  // products default to "jar"; merch products pass their own.
  unitLabel?: string
  // Omit entirely to offer one-time purchase only — e.g. a product with no
  // Sanity-configured subscription price yet.
  subscriptionUnitPrice?: number
  // The real Shopify Selling Plan id for this product, if one exists
  // (see getProductByHandle). Without it, subscriptions still show as an
  // option (if subscriptionUnitPrice is set) but fall back to the mailto
  // flow rather than a real recurring cart.
  subscriptionSellingPlanId?: string | null
  contactEmail?: string
  // Real Shopify variant to check out with a live cart, when available.
  // Ignored when `variants` is passed — see below.
  variantId?: string | null
  // Real Shopify inventory count. null/undefined means "unknown" (Shopify
  // not configured, product not found) — shown as nothing, never a guess.
  // Ignored when `variants` is passed.
  stockCount?: number | null
  // Every real Shopify variant for this product (e.g. a hamper's honey
  // selection). When present, price/variantId/stock are derived from
  // whichever one the customer has selected instead of the flat props
  // above — a picker only renders when there's more than one to choose
  // from, so a single-variant product behaves exactly as it did before
  // this existed.
  variants?: PurchaseOptionsVariant[]
  variantGroupLabel?: string
  // Active honeys (with live stock) to offer when the selected variant is
  // the "Choose your own" one (see HONEY_CHOICE_TRIGGER_LABEL) — fetched
  // live by the caller, never hardcoded, so both the list and the stock
  // numbers stay correct as postcode honeys come and go.
  honeyJarOptions?: HoneyJarOption[]
  // How many jars this hamper contains — one dropdown per jar in "I'll
  // choose" mode. Required alongside honeyJarOptions for the picker to
  // render at all.
  hamperJarCount?: number
  // Real bookable dates for an Experience, with live remaining-places
  // counts — fetched from Sanity by the caller. When present, shows a
  // date picker and gates quantity/checkout on the selected date's
  // places rather than the flat stockCount prop above.
  experienceSessions?: ExperienceSessionOption[]
  // Real beekeeper behind this product, if any — shown as a secondary
  // button right next to Add to basket rather than a separate card
  // elsewhere on the page. Absent for merch products, which have no
  // beekeeper link.
  beekeeper?: { name: string; slug: string } | null
}) {
  const [type, setType] = useState<PurchaseType>('one-time')
  const [quantity, setQuantity] = useState(1)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [honeyPickMode, setHoneyPickMode] = useState<'same' | 'choose'>('same')
  const [sameHoneyChoice, setSameHoneyChoice] = useState(honeyJarOptions?.[0]?.name ?? '')
  const [perJarHoney, setPerJarHoney] = useState<string[]>(() =>
    Array(hamperJarCount ?? 0).fill(honeyJarOptions?.[0]?.name ?? '')
  )
  const [selectedSessionKey, setSelectedSessionKey] = useState(
    () => experienceSessions?.find((s) => s.placesRemaining > 0)?.key ?? experienceSessions?.[0]?.key ?? ''
  )
  const { addItem, isPending, error: cartError } = useCart()

  const hasVariantChoice = Boolean(variants && variants.length > 1)
  const activeVariant = variants?.[selectedVariantIndex]
  const effectivePrice = activeVariant ? activeVariant.price : unitPrice
  const effectiveVariantId = activeVariant ? activeVariant.id : variantId
  const effectiveStockCount = activeVariant ? activeVariant.quantityAvailable : stockCount
  const needsHoneyChoice =
    activeVariant?.label === HONEY_CHOICE_TRIGGER_LABEL &&
    honeyJarOptions !== undefined &&
    honeyJarOptions.length > 0 &&
    Boolean(hamperJarCount)

  const honeyPerJar =
    honeyPickMode === 'same' ? Array(hamperJarCount ?? 0).fill(sameHoneyChoice) : perJarHoney
  const honeyTally = needsHoneyChoice ? tallyJarSelections(honeyPerJar) : []
  const honeyStockShortfalls = honeyTally.filter(({ honeyName, jars }) => {
    const available = honeyJarOptions?.find((o) => o.name === honeyName)?.quantityAvailable ?? 0
    return jars * quantity > available
  })
  const honeyChoiceAttributes =
    needsHoneyChoice && honeyTally.length > 0
      ? [{ key: HONEY_CHOICE_ATTRIBUTE_KEY, value: formatHoneySelection(honeyTally) }]
      : []
  const needsSessionChoice = Boolean(experienceSessions && experienceSessions.length > 0)
  const activeSession = needsSessionChoice
    ? experienceSessions!.find((s) => s.key === selectedSessionKey)
    : undefined
  // The raw ISO date (not the pretty display format) — the order-paid
  // webhook matches this exactly against Sanity's session.date, so it
  // can't be the human-readable string shown elsewhere on this page.
  const sessionAttributes = activeSession
    ? [{ key: SESSION_DATE_ATTRIBUTE_KEY, value: activeSession.date }]
    : []

  const bookingAttributes = [...honeyChoiceAttributes, ...sessionAttributes]

  // A variant with inventory tracking off reports quantityAvailable: 0
  // while still being availableForSale: true (e.g. the hampers, which are
  // always "in stock" by design — see docs/technical-architecture.md).
  // availableForSale is the authoritative signal either way; quantity is
  // only meaningful (and only shown) when it's actually being tracked.
  // An Experience's own Shopify stock is irrelevant too — its real limit
  // is the selected session's remaining places (see hasSessionShortfall).
  const isSoldOut = activeVariant
    ? !activeVariant.availableForSale
    : needsSessionChoice
      ? false
      : effectiveStockCount !== null && effectiveStockCount !== undefined && effectiveStockCount <= 0
  const maxQuantity = needsSessionChoice
    ? Math.max(1, activeSession?.placesRemaining ?? 1)
    : Math.min(12, effectiveStockCount && effectiveStockCount > 0 ? effectiveStockCount : 12)

  const hasSubscription = subscriptionUnitPrice !== undefined
  const isSubscription = hasSubscription && type === 'subscription'
  const hasHoneyStockShortfall = needsHoneyChoice && honeyStockShortfalls.length > 0
  const hasSessionShortfall =
    needsSessionChoice && (!activeSession || activeSession.placesRemaining < quantity)

  function handleAddToBasket() {
    if (!effectiveVariantId || hasHoneyStockShortfall || hasSessionShortfall) return
    if (isSubscription) {
      if (!subscriptionSellingPlanId) return
      addItem(effectiveVariantId, 1, subscriptionSellingPlanId, bookingAttributes)
      return
    }
    addItem(effectiveVariantId, quantity, undefined, bookingAttributes)
  }

  const canCheckoutLive =
    Boolean(effectiveVariantId) &&
    !hasHoneyStockShortfall &&
    !hasSessionShortfall &&
    (isSubscription ? Boolean(subscriptionSellingPlanId) : true)
  const subtotal = effectivePrice * quantity

  const productLabel = activeVariant ? `${productName} — ${activeVariant.label}` : productName
  const honeyChoiceSuffix =
    needsHoneyChoice && honeyTally.length > 0 ? ` (${formatHoneySelection(honeyTally)})` : ''
  const sessionSuffix = activeSession ? ` (${formatSessionDate(activeSession.date)})` : ''
  const subject = isSubscription
    ? `${productLabel} monthly subscription`
    : `${productLabel} order (x${quantity})`
  const body = isSubscription
    ? `I'd like to subscribe to one ${unitLabel} of ${productLabel}${honeyChoiceSuffix} a month, at ${formatGBP(subscriptionUnitPrice)}/${unitLabel} plus delivery (calculated on the actual parcel weight — free over £${FREE_DELIVERY_THRESHOLD_GBP}). I understand I can cancel any time with at least ${CANCELLATION_NOTICE_DAYS} days' notice before my next monthly charge.`
    : `I'd like to order ${quantity} ${unitLabel}${quantity > 1 ? 's' : ''} of ${productLabel}${honeyChoiceSuffix}${sessionSuffix} (${formatGBP(subtotal)} plus delivery, calculated on the actual parcel weight — free over £${FREE_DELIVERY_THRESHOLD_GBP}).`
  const mailtoHref = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  const beekeeperButton = beekeeper && (
    <Link
      href={`/beekeepers/${beekeeper.slug}`}
      className="border-porcelain/40 bg-porcelain/10 text-porcelain hover:bg-porcelain/20 hover:border-porcelain focus-visible:outline-honey-amber rounded-full border px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
    >
      Meet the beekeeper
    </Link>
  )

  return (
    <div className="border-ink-line bg-honeycomb-surface mt-8 rounded-xl border p-5">
      {hasVariantChoice && (
        <fieldset className="mb-4">
          <legend className="text-porcelain text-sm font-semibold">{variantGroupLabel}</legend>
          <div className="mt-3 grid gap-2">
            {variants!.map((variant, index) => (
              <label
                key={variant.id}
                className={`focus-within:outline-honey-amber cursor-pointer rounded-lg border px-4 py-3 text-sm transition focus-within:outline focus-within:outline-offset-2 ${
                  index === selectedVariantIndex
                    ? 'border-comb-gold bg-ink-surface text-porcelain'
                    : 'border-ink-line text-porcelain/70 hover:text-porcelain'
                }`}
              >
                <input
                  type="radio"
                  name="variant-choice"
                  value={variant.id}
                  checked={index === selectedVariantIndex}
                  onChange={() => {
                    setSelectedVariantIndex(index)
                    setQuantity(1)
                  }}
                  className="sr-only"
                />
                <span className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{variant.label}</span>
                  <span className="text-porcelain/70 shrink-0">{formatGBP(variant.price)}</span>
                </span>
                {!variant.availableForSale && (
                  <span className="text-honey-amber mt-0.5 block text-xs">Out of stock</span>
                )}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {needsHoneyChoice && (
        <div className="mb-4">
          <fieldset>
            <legend className="text-porcelain text-sm font-semibold">Which honey?</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label
                className={`focus-within:outline-honey-amber cursor-pointer rounded-lg border px-3 py-2 text-center text-sm transition focus-within:outline focus-within:outline-offset-2 ${
                  honeyPickMode === 'same'
                    ? 'border-comb-gold bg-ink-surface text-porcelain'
                    : 'border-ink-line text-porcelain/70 hover:text-porcelain'
                }`}
              >
                <input
                  type="radio"
                  name="honey-pick-mode"
                  value="same"
                  checked={honeyPickMode === 'same'}
                  onChange={() => setHoneyPickMode('same')}
                  className="sr-only"
                />
                All the same
              </label>
              <label
                className={`focus-within:outline-honey-amber cursor-pointer rounded-lg border px-3 py-2 text-center text-sm transition focus-within:outline focus-within:outline-offset-2 ${
                  honeyPickMode === 'choose'
                    ? 'border-comb-gold bg-ink-surface text-porcelain'
                    : 'border-ink-line text-porcelain/70 hover:text-porcelain'
                }`}
              >
                <input
                  type="radio"
                  name="honey-pick-mode"
                  value="choose"
                  checked={honeyPickMode === 'choose'}
                  onChange={() => setHoneyPickMode('choose')}
                  className="sr-only"
                />
                I&apos;ll choose each jar
              </label>
            </div>
          </fieldset>

          {honeyPickMode === 'same' ? (
            <select
              aria-label="Honey for every jar"
              value={sameHoneyChoice}
              onChange={(e) => setSameHoneyChoice(e.target.value)}
              className="bg-ink border-ink-line text-porcelain focus-visible:outline-honey-amber mt-3 w-full rounded-lg border px-3 py-2 text-sm focus-visible:outline focus-visible:outline-offset-2"
            >
              {honeyJarOptions!.map((option) => (
                <option key={option.name} value={option.name}>
                  {option.name}
                  {option.quantityAvailable <= 0 ? ' — out of stock' : ''}
                </option>
              ))}
            </select>
          ) : (
            <div className="mt-3 space-y-2">
              {perJarHoney.map((jarHoney, jarIndex) => (
                <div key={jarIndex} className="flex items-center gap-2">
                  <span className="text-porcelain/60 w-12 shrink-0 text-sm">
                    Jar {jarIndex + 1}
                  </span>
                  <select
                    aria-label={`Honey for jar ${jarIndex + 1}`}
                    value={jarHoney}
                    onChange={(e) =>
                      setPerJarHoney((prev) =>
                        prev.map((h, i) => (i === jarIndex ? e.target.value : h))
                      )
                    }
                    className="bg-ink border-ink-line text-porcelain focus-visible:outline-honey-amber w-full rounded-lg border px-3 py-2 text-sm focus-visible:outline focus-visible:outline-offset-2"
                  >
                    {honeyJarOptions!.map((option) => (
                      <option key={option.name} value={option.name}>
                        {option.name}
                        {option.quantityAvailable <= 0 ? ' — out of stock' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {hasHoneyStockShortfall && (
            <p className="text-honey-amber mt-2 text-xs" role="alert">
              Not enough {honeyStockShortfalls.map((s) => s.honeyName).join(', ')} in stock for
              this selection — pick something else to check out.
            </p>
          )}
        </div>
      )}

      {needsSessionChoice && (
        <div className="mb-4">
          <label htmlFor="session-choice" className="text-porcelain text-sm font-semibold">
            Which date?
          </label>
          <select
            id="session-choice"
            value={selectedSessionKey}
            onChange={(e) => {
              setSelectedSessionKey(e.target.value)
              setQuantity(1)
            }}
            className="bg-ink border-ink-line text-porcelain focus-visible:outline-honey-amber mt-2 w-full rounded-lg border px-3 py-2 text-sm focus-visible:outline focus-visible:outline-offset-2"
          >
            {experienceSessions!.map((session) => (
              <option key={session.key} value={session.key}>
                {formatSessionDate(session.date)}
                {session.placesRemaining <= 0
                  ? ' — fully booked'
                  : ` — ${session.placesRemaining} place${session.placesRemaining === 1 ? '' : 's'} left`}
              </option>
            ))}
          </select>
          {hasSessionShortfall && (
            <p className="text-honey-amber mt-2 text-xs" role="alert">
              {activeSession && activeSession.placesRemaining > 0
                ? `Only ${activeSession.placesRemaining} place${activeSession.placesRemaining === 1 ? '' : 's'} left on this date — reduce the quantity or pick another date.`
                : 'This date is fully booked — pick another to check out.'}
            </p>
          )}
        </div>
      )}

      {hasSubscription ? (
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
              <span className="block text-xs opacity-70">{formatGBP(effectivePrice)} per {unitLabel}</span>
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
                {formatGBP(subscriptionUnitPrice)}/{unitLabel} &middot; cancel any time
              </span>
            </label>
          </div>
        </fieldset>
      ) : (
        <p className="text-porcelain text-sm font-semibold">{formatGBP(effectivePrice)} per {unitLabel}</p>
      )}

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

      {!needsSessionChoice &&
        effectiveStockCount !== null &&
        effectiveStockCount !== undefined &&
        (isSoldOut || effectiveStockCount > 0) && (
          <p className={`mt-2 text-xs ${isSoldOut ? 'text-honey-amber' : 'text-porcelain/50'}`}>
            {isSoldOut
              ? 'Out of stock — check back soon.'
              : `${effectiveStockCount} ${unitLabel}${effectiveStockCount === 1 ? '' : 's'} in stock`}
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
      </dl>
      <p className="text-porcelain/50 mt-2 text-xs">
        Delivery calculated at checkout by weight &middot; free over £{FREE_DELIVERY_THRESHOLD_GBP}
      </p>
      {isSubscription && (
        <p className="text-porcelain/50 mt-1 text-xs">
          No minimum term &middot; cancel any time, with at least {CANCELLATION_NOTICE_DAYS} days&apos;
          notice before your next monthly charge
        </p>
      )}

      {isSoldOut && !isSubscription ? (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled
              className="bg-ink-line text-porcelain/50 inline-block cursor-not-allowed rounded-full px-6 py-2.5 text-sm font-semibold"
            >
              Sold out
            </button>
            {beekeeperButton}
          </div>
          <RestockAlertForm productName={productName} productHandle={productHandle} />
        </>
      ) : hasHoneyStockShortfall || hasSessionShortfall ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled
            className="bg-ink-line text-porcelain/50 inline-block cursor-not-allowed rounded-full px-6 py-2.5 text-sm font-semibold"
          >
            Add to basket
          </button>
          {beekeeperButton}
        </div>
      ) : canCheckoutLive ? (
        <>
          <p className="text-porcelain/60 mt-3 text-sm">
            Checkout is handled securely by Shopify, once you&apos;re ready.
          </p>
          {cartError && (
            <p className="text-honey-amber mt-2 text-sm" role="alert">
              {cartError}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleAddToBasket}
              disabled={isPending}
              className="bg-honey-amber text-ink focus-visible:outline-porcelain inline-block rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4 disabled:opacity-60"
            >
              {isPending ? 'Adding…' : 'Add to basket'}
            </button>
            {beekeeperButton}
          </div>
        </>
      ) : (
        <>
          <p className="text-porcelain/60 mt-3 text-sm">
            Online ordering isn&apos;t live yet —{' '}
            {isSubscription
              ? `monthly subscriptions are set up by hand for now — cancel any time with at least ${CANCELLATION_NOTICE_DAYS} days' notice before your next charge.`
              : "we're finishing the shop first."}{' '}
            Email us and we&apos;ll sort it directly.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              href={mailtoHref}
              className="bg-honey-amber text-ink focus-visible:outline-porcelain inline-block rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
            >
              {isSubscription ? 'Email to subscribe' : 'Email to order'}
            </a>
            {beekeeperButton}
          </div>
        </>
      )}
    </div>
  )
}
