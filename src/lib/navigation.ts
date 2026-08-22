// Primary IA per /docs/requirements-matrix.md, sourced from the Project Pack
// (section 06, Information architecture).
export const primaryNav = [
  { label: 'Shop', href: '/shop' },
  { label: 'Postcode Honey', href: '/postcode-honey' },
  { label: 'Our Beekeepers', href: '/beekeepers' },
  { label: 'Our Story', href: '/our-story' },
  { label: 'Stockists', href: '/stockists' },
  { label: 'Information', href: '/information' },
] as const

// Some footer links intentionally point at the same page as a related item
// (e.g. Wholesale -> /stockists) rather than a separate near-duplicate stub —
// see docs/requirements-matrix.md for what's genuinely still missing.
// Journal and Batch Passports were removed here (2026-08-12, journey audit)
// after a link crawl found both 404ing — neither page exists yet and
// neither is on the near-term roadmap. Re-add once they're real.
export const footerNav = {
  Shop: [
    { label: 'Latest Harvest', href: '/shop/honey' },
    { label: 'All Honey', href: '/shop/honey' },
    { label: 'Experiences', href: '/shop/experiences' },
  ],
  Discover: [
    { label: 'Postcode Honey', href: '/postcode-honey' },
    { label: 'Our Story', href: '/our-story' },
    { label: 'Sustainability', href: '/sustainability' },
    { label: 'Stockists', href: '/stockists' },
    { label: 'Becoming a Beekeeper', href: '/becoming-a-beekeeper' },
    { label: 'Asian Hornets', href: '/asian-hornets' },
  ],
  Help: [
    { label: 'Contact', href: '/contact' },
    { label: 'FAQs', href: '/faqs' },
    { label: 'Delivery and Collection', href: '/delivery' },
    { label: 'Returns', href: '/legal/refund-policy' },
  ],
  Trade: [
    { label: 'Wholesale', href: '/stockists' },
    { label: 'Corporate Gifts', href: '/stockists' },
    { label: 'Weddings and Events', href: '/stockists' },
    { label: 'Become a Stockist', href: '/stockists' },
    { label: 'Become a Supplier', href: '/become-a-supplier' },
  ],
  Legal: [
    { label: 'Privacy Notice', href: '/legal/privacy' },
    { label: 'Cookie Settings', href: '/legal/cookies' },
    { label: 'Terms and Conditions', href: '/legal/terms' },
    { label: 'Refund Policy', href: '/legal/refund-policy' },
    { label: 'Accessibility', href: '/legal/accessibility' },
  ],
} as const
