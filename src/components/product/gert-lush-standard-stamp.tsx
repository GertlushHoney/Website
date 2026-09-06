import Link from 'next/link'

// Pointy-top hexagon (point at top/bottom, flat sides) — taller than wide,
// so it has room to actually hold stacked lines of text, unlike the
// flat-top orientation used for the shop tiles elsewhere on the site.
const HEX_CLIP = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'

// A gold hexagon "stamp" pinned to the top-right corner of the product
// info column — deliberately outside the heading's own text flow (see
// where this is used) so it never splits the product name/tagline apart,
// carrying its own short wording instead of the old full explanatory
// block (border, paragraph, separate link) that used to sit lower on the
// page. Three-layer hex (dark amber rim, bright highlight ring, radial-lit
// face) plus a shadow that follows the hex silhouette gives it a struck-
// medal look rather than a flat colour chip. Only rendered when
// meetsGertLushStandard is true in Sanity — see that field's own
// description for why this is never a default.
export function GertLushStandardStamp() {
  return (
    <Link
      href="/gert-lush-standard"
      title="Meets the Gert Lush Standard"
      className="focus-visible:outline-honey-amber group relative inline-flex h-[136px] w-[120px] shrink-0 items-center justify-center transition hover:scale-105 focus-visible:outline focus-visible:outline-offset-2"
      style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}
    >
      <span className="sr-only">Meets the Gert Lush Standard — learn what that means</span>
      {/* Rim */}
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          clipPath: HEX_CLIP,
          background: 'linear-gradient(155deg, #b5790f 0%, #7a5008 100%)',
        }}
      />
      {/* Bright bevel ring */}
      <span
        aria-hidden="true"
        className="absolute inset-[4px]"
        style={{
          clipPath: HEX_CLIP,
          background: 'linear-gradient(155deg, #ffe4a3 0%, #f2c35b 60%, #d99614 100%)',
        }}
      />
      {/* Face — inset again so the bevel ring reads as a raised edge */}
      <span
        aria-hidden="true"
        className="absolute inset-[9px]"
        style={{
          clipPath: HEX_CLIP,
          background:
            'radial-gradient(circle at 33% 22%, #ffedc2 0%, #f2c35b 38%, #d99614 74%, #b5790f 100%)',
        }}
      />
      <span className="relative flex flex-col items-center px-4 text-center">
        <span className="text-[9px] font-semibold tracking-wide text-[#3d2a0a] uppercase">
          Meets the
        </span>
        <span className="font-display text-sm leading-tight font-bold text-[#2b1d06] italic">
          Gert Lush
        </span>
        <span className="font-display text-sm leading-tight font-bold text-[#2b1d06] italic">
          Standard
        </span>
        {/* The real brand mark (public/images/brand/hexagon-transparent.png),
            not a hand-drawn approximation — masked to a solid colour so its
            own gold linework stays legible against the gold medal face
            instead of blending into it. */}
        <span
          aria-hidden="true"
          className="mt-1.5 h-6 w-6"
          style={{
            backgroundColor: '#2b1d06',
            WebkitMaskImage: 'url(/images/brand/hexagon-transparent.png)',
            maskImage: 'url(/images/brand/hexagon-transparent.png)',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
          }}
        />
      </span>
    </Link>
  )
}
