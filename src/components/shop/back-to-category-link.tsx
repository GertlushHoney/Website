import Link from 'next/link'

// Every product page needs a way back to where it came from — there was
// no route back to the category listing at all before this existed.
export function BackToCategoryLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="border-porcelain/40 bg-porcelain/10 text-porcelain hover:bg-porcelain/20 hover:border-porcelain focus-visible:outline-honey-amber inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-offset-2"
    >
      <span aria-hidden="true">&larr;</span> Back to {label}
    </Link>
  )
}
