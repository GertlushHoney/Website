// Builds /llms.txt — a short, plain-text (markdown) summary of the site for AI
// assistants and the tools that feed them, following the llms.txt proposal
// (llmstxt.org). There is no proof yet that any given AI product reads it, so
// this is a cheap extra rather than something to rely on; the real work is
// clear, crawlable pages. Everything here comes from the live product data or
// from claims the site already makes elsewhere — nothing invented — and it
// never mentions the Gert Lush Standard's review status, which has its own
// draft/live switch (src/lib/gert-lush-standard.ts) that a static summary
// can't track.

export type LlmsHoney = {
  name: string
  slug: string
  tagline: string
  postcodeCode: string
  areaName: string | null
  beekeeperName: string | null
}

const PAGES: { path: string; label: string; description: string }[] = [
  { path: '/shop/honey', label: 'All honey', description: 'Every honey currently on sale, with live prices.' },
  {
    path: '/postcode-honey',
    label: 'Postcode honey map',
    description: 'Find honey by UK postcode area, or join the waiting list for an area with none yet.',
  },
  { path: '/beekeepers', label: 'Our beekeepers', description: 'The independent beekeepers behind each jar.' },
  { path: '/our-story', label: 'Our story', description: 'Who Gert Lush Honey is and why it exists.' },
  {
    path: '/fake-honey',
    label: 'Is it really honey?',
    description: 'How honey fraud works, what EU testing found, and what to check on a label.',
  },
  { path: '/delivery', label: 'Delivery', description: 'UK delivery by Royal Mail Tracked 48, charges and timings.' },
  { path: '/faqs', label: 'FAQs', description: 'Common questions about sourcing, ordering and delivery.' },
  { path: '/become-a-supplier', label: 'Become a supplier', description: 'For beekeepers with surplus honey.' },
  { path: '/contact', label: 'Contact', description: 'Get in touch.' },
]

export function buildLlmsTxt({
  siteUrl,
  honeys,
  freeDeliveryThresholdGbp,
}: {
  siteUrl: string
  honeys: LlmsHoney[]
  freeDeliveryThresholdGbp: number
}): string {
  const lines: string[] = [
    '# Gert Lush Honey',
    '',
    '> A small, Bristol-based British honey brand. Every jar is single-postcode honey from one named, independent beekeeper, who is credited for it. UK delivery only.',
    '',
    '## Honey on sale now',
    '',
  ]

  if (honeys.length === 0) {
    lines.push('No honey is listed at the moment.')
  } else {
    for (const honey of honeys) {
      const place = honey.areaName ? `${honey.postcodeCode} (${honey.areaName})` : honey.postcodeCode
      const by = honey.beekeeperName ? `, by beekeeper ${honey.beekeeperName}` : ''
      // Taglines are written as free text, so make sure each ends in a full stop.
      const tagline = honey.tagline.trim().replace(/[.!?]*$/, '.')
      lines.push(`- [${honey.name}](${siteUrl}/shop/${honey.slug}): ${tagline} Postcode ${place}${by}.`)
    }
  }

  lines.push('', '## Key pages', '')
  for (const page of PAGES) {
    lines.push(`- [${page.label}](${siteUrl}${page.path}): ${page.description}`)
  }

  lines.push(
    '',
    '## Good to know',
    '',
    `- Delivery is UK only, by Royal Mail Tracked 48, calculated at checkout by parcel weight and free over £${freeDeliveryThresholdGbp}.`,
    '- Checkout and payment are handled by Shopify.',
    '- Honey is sold under the UK definition of honey; the origin of each jar is the beekeeper and postcode shown on its page.',
    ''
  )

  return lines.join('\n')
}
