'use client'

import { useEffect, useState } from 'react'

type Candidate = { handle: string; title: string; imageUrl: string | null; weightGrams: number | null }
type Beekeeper = { _id: string; name: string }
type CreateResult = {
  slug: string
  active: boolean
  links: { label: string; href: string }[]
  warnings: string[]
}

const CATEGORIES = [
  { value: 'candles', label: 'Candles' },
  { value: 'hamper', label: 'Gift Hampers' },
  { value: 'soap', label: 'Soap' },
  { value: 'lip-balm', label: 'Lip Balm' },
]

const inputClass =
  'bg-ink border-ink-line text-porcelain placeholder:text-porcelain/40 focus-visible:outline-honey-amber mt-1 w-full rounded-lg border px-3 py-2 text-sm focus-visible:outline focus-visible:outline-offset-2'
const labelClass = 'text-porcelain/60 block text-sm'

// Front end for /api/new-product — the one-step version of
// docs/product-creation-sop.md steps 2-4. Create the product in Shopify as
// usual (price, stock, photo, Headless channel); then pick it here, fill in
// the few things only this site needs, and the Sanity entry is created
// (photo, handle and weight included) with nothing to copy across by hand.
export function NewProductTool() {
  const [candidates, setCandidates] = useState<Candidate[] | null>(null)
  const [beekeepers, setBeekeepers] = useState<Beekeeper[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  const [handle, setHandle] = useState('')
  const [kind, setKind] = useState<'honey' | 'merch'>('honey')
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [description, setDescription] = useState('')
  const [weight, setWeight] = useState('')
  const [grams, setGrams] = useState('')
  const [postcodeCode, setPostcodeCode] = useState('')
  const [beekeeperId, setBeekeeperId] = useState('')
  const [category, setCategory] = useState('candles')
  const [active, setActive] = useState(true)
  const [feather, setFeather] = useState(false)

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CreateResult | null>(null)

  async function load() {
    setLoadError(null)
    try {
      const res = await fetch('/api/new-product')
      const body = await res.json()
      if (!res.ok) throw new Error(body?.error ?? 'Something went wrong.')
      setCandidates(body.candidates)
      setBeekeepers(body.beekeepers)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [])

  const selected = candidates?.find((c) => c.handle === handle) ?? null

  function choose(newHandle: string) {
    setHandle(newHandle)
    const c = candidates?.find((x) => x.handle === newHandle)
    setName(c?.title ?? '')
    setGrams(c?.weightGrams ? String(c.weightGrams) : '')
  }

  function chooseKind(next: 'honey' | 'merch') {
    setKind(next)
    // Same defaults as the Sanity schemas: honey live, merch off until ready.
    setActive(next === 'honey')
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSaving(true)
    try {
      const res = await fetch('/api/new-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          shopifyHandle: handle,
          name,
          tagline,
          description,
          weight,
          shippingWeightGrams: grams.trim() ? Number(grams) : null,
          active,
          feather,
          postcodeCode,
          beekeeperId,
          category,
        }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body?.error ?? 'Something went wrong.')
      setResult(body)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsSaving(false)
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-porcelain text-2xl font-bold tracking-tight">Product added</h1>
        <p className="text-porcelain/70 mt-2 text-sm" role="status">
          {name} is in Sanity
          {result.active ? ' and live on the site.' : ', but switched off — it will not show on the site until you turn on Active in Studio.'}
        </p>
        {result.warnings.map((w) => (
          <p key={w} className="text-honey-amber mt-3 text-sm">
            {w}
          </p>
        ))}
        <p className="text-porcelain/60 mt-6 text-sm">
          Have a look at it (prices and stock come straight from Shopify):
        </p>
        <ul className="mt-2 space-y-1 text-sm">
          {result.links.map((l) => (
            <li key={l.href}>
              <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-comb-gold underline underline-offset-2">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => {
            setResult(null)
            setHandle('')
            setName('')
            setTagline('')
            setDescription('')
            setWeight('')
            setGrams('')
            setPostcodeCode('')
            void load()
          }}
          className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-8 rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
        >
          Add another
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-porcelain text-2xl font-bold tracking-tight">Add a new product</h1>
      <p className="text-porcelain/60 mt-2 text-sm">
        First create the product in Shopify as usual (title, price, stock, a photo, and published to
        the <strong>Headless</strong> sales channel). Then pick it here, fill in the few things only
        the website needs, and it&apos;s added to the site — no copying the handle or re-uploading the
        photo.
      </p>

      {loadError && (
        <p className="text-red-400 mt-4 text-sm" role="alert">
          {loadError}
        </p>
      )}
      {candidates === null && !loadError && <p className="text-porcelain/50 mt-6 text-sm">Loading…</p>}

      {candidates && candidates.length === 0 && (
        <p className="border-ink-line bg-honeycomb-surface text-porcelain/70 mt-6 rounded-xl border p-5 text-sm">
          Every product in Shopify is already on the site. If you&apos;ve just created one and it isn&apos;t
          listed, check it&apos;s published to the Headless sales channel.
        </p>
      )}

      {candidates && candidates.length > 0 && (
        <form onSubmit={save} className="border-ink-line bg-honeycomb-surface mt-6 rounded-xl border p-5">
          <div>
            <label htmlFor="np-product" className={labelClass}>
              Shopify product
            </label>
            <select id="np-product" required value={handle} onChange={(e) => choose(e.target.value)} className={inputClass}>
              <option value="">Choose a product…</option>
              {candidates.map((c) => (
                <option key={c.handle} value={c.handle}>
                  {c.title}
                </option>
              ))}
            </select>
            {selected && !selected.imageUrl && (
              <p className="text-honey-amber mt-2 text-sm">
                This product has no photo in Shopify yet — add one there first.
              </p>
            )}
            {selected?.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selected.imageUrl} alt="" className="mt-3 h-28 w-28 rounded-lg object-contain" />
            )}
          </div>

          <fieldset className="mt-4">
            <legend className={labelClass}>What is it?</legend>
            <div className="mt-1 flex gap-6 text-sm">
              <label className="text-porcelain flex items-center gap-2">
                <input type="radio" name="kind" checked={kind === 'honey'} onChange={() => chooseKind('honey')} />
                A postcode honey
              </label>
              <label className="text-porcelain flex items-center gap-2">
                <input type="radio" name="kind" checked={kind === 'merch'} onChange={() => chooseKind('merch')} />
                Candles, soap, lip balm or a hamper
              </label>
            </div>
          </fieldset>

          <div className="mt-4">
            <label htmlFor="np-name" className={labelClass}>
              Name on the site
            </label>
            <input id="np-name" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>

          <div className="mt-4">
            <label htmlFor="np-tagline" className={labelClass}>
              Tagline (one line)
            </label>
            <input id="np-tagline" required maxLength={200} value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputClass} />
          </div>

          {kind === 'honey' ? (
            <>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="np-postcode" className={labelClass}>
                    Postcode area or district (e.g. M, or BS4)
                  </label>
                  <input
                    id="np-postcode"
                    required
                    maxLength={6}
                    value={postcodeCode}
                    onChange={(e) => setPostcodeCode(e.target.value.toUpperCase())}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="np-beekeeper" className={labelClass}>
                    Beekeeper
                  </label>
                  <select id="np-beekeeper" required value={beekeeperId} onChange={(e) => setBeekeeperId(e.target.value)} className={inputClass}>
                    <option value="">Choose…</option>
                    {beekeepers.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-porcelain/50 mt-1 text-xs">Not listed? Add them in Studio first.</p>
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="np-weight" className={labelClass}>
                  Jar size on the site (e.g. 12oz / 280ml)
                </label>
                <input id="np-weight" required maxLength={60} value={weight} onChange={(e) => setWeight(e.target.value)} className={inputClass} />
              </div>
            </>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="np-category" className={labelClass}>
                  Category
                </label>
                <select id="np-category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="np-size" className={labelClass}>
                  Size on the site (optional, e.g. 50g)
                </label>
                <input id="np-size" maxLength={60} value={weight} onChange={(e) => setWeight(e.target.value)} className={inputClass} />
              </div>
            </div>
          )}

          <div className="mt-4">
            <label htmlFor="np-description" className={labelClass}>
              {kind === 'honey' ? 'Where it’s from (the story)' : 'Description'}
            </label>
            <textarea
              id="np-description"
              required
              rows={6}
              maxLength={5000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
            <p className="text-porcelain/50 mt-1 text-xs">Leave a blank line between paragraphs.</p>
          </div>

          <div className="mt-4">
            <label htmlFor="np-grams" className={labelClass}>
              Packed weight in grams (as posted)
            </label>
            <input
              id="np-grams"
              type="number"
              min={1}
              inputMode="numeric"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              className={`${inputClass} w-40`}
            />
            <p className="text-porcelain/50 mt-1 text-xs">
              Also sent to Shopify so postage is calculated correctly. Leave blank if you don&apos;t know yet.
            </p>
          </div>

          <label className="text-porcelain mt-5 flex items-start gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="mt-0.5" />
            <span>Show it on the site straight away</span>
          </label>
          <label className="text-porcelain mt-2 flex items-start gap-2 text-sm">
            <input type="checkbox" checked={feather} onChange={(e) => setFeather(e.target.checked)} className="mt-0.5" />
            <span>
              Soften the photo&apos;s edges (leave off if the photo in Shopify is already softened —
              the existing ones are)
            </span>
          </label>

          {error && (
            <p className="text-red-400 mt-4 text-sm" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSaving || !selected?.imageUrl}
            className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-6 rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4 disabled:opacity-50"
          >
            {isSaving ? 'Adding…' : 'Add to the site'}
          </button>
        </form>
      )}
    </div>
  )
}
