import Link from 'next/link'

// Every product page needs a way back to where it came from — there was
// no route back to the category listing at all before this existed.
export function BackToCategoryLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-porcelain/60 hover:text-porcelain focus-visible:outline-honey-amber inline-flex items-center gap-1.5 text-sm focus-visible:outline focus-visible:outline-offset-2"
    >
      <span aria-hidden="true">&larr;</span> Back to {label}
    </Link>
  )
}
