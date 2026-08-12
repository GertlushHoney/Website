'use client'

import { useRouter } from 'next/navigation'

// Picks one of the real honey products at random and navigates there.
// Works honestly even with a single product today — it'll just always
// land on that one, and start actually surprising once there's more than
// one to choose from.
export function SurpriseMeButton({ slugs }: { slugs: string[] }) {
  const router = useRouter()

  if (slugs.length === 0) return null

  function handleClick() {
    const slug = slugs[Math.floor(Math.random() * slugs.length)]
    router.push(`/shop/${slug}`)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="border-porcelain/40 text-porcelain hover:border-porcelain focus-visible:outline-honey-amber rounded-full border px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
    >
      Surprise me
    </button>
  )
}
