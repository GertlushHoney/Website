import type { InlineImage, OutgoingEmail } from './graph-mail'
import { HONEYCOMB_TILE_PNG_BASE64, LOGO_PNG_BASE64 } from './email-images'

// The two invite emails a visitor can request from the site (Become a
// Supplier, Meet the Beekeeper), plus the short heads-up the business gets
// each time. Wording is the business's own final copy (Emails folder,
// 2026-10-21) — change it here, not by rebuilding the layout.
//
// Built for email clients, not browsers: table layout, inline styles,
// bgcolor attributes and a VML background so Outlook desktop (Word's
// rendering engine) still paints the honeycomb. Colours are the site's own
// tokens (globals.css): ink #14110D, ink-surface #211B14, ink-line #33291D,
// honey-amber #D99614, comb-gold #F2C35B, porcelain #F7F5EF,
// soft-stone #E8E4DB.

export const SUPPLIER_FORM_URL =
  'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=pZ8ppJhjuUShi37mBNfJxrmrawl211tCtlea9_OOesVURDlVNlFURVBIR1lESFRMN0pIRUEzMFMyUi4u&origin=Invitation&channel=0'
export const BEEKEEPER_FORM_URL =
  'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=pZ8ppJhjuUShi37mBNfJxrmrawl211tCtlea9_OOesVUM1ZCWUlVQU5FVUJBU1A0SlNZRExYUFFLRy4u&origin=Invitation&channel=0'

export const SUPPLIERS_ADDRESS = 'suppliers@gertlushhoney.co.uk'
export const ADMIN_ADDRESS = 'admin@gertlushhoney.co.uk'

const INLINE_IMAGES: InlineImage[] = [
  { contentId: 'gert-lush-logo', name: 'gert-lush-logo.png', contentType: 'image/png', base64: LOGO_PNG_BASE64 },
  { contentId: 'honeycomb-bg', name: 'honeycomb-tile.png', contentType: 'image/png', base64: HONEYCOMB_TILE_PNG_BASE64 },
]

const SANS = "font-family:'Segoe UI',Arial,sans-serif;"
const BODY_TEXT = `${SANS}font-size:15px;line-height:1.65;color:#E8E4DB;`

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

type InviteLayout = {
  heading: string
  // Trusted, fixed copy from this file only — never visitor input.
  introHtml: string
  panelTitle: string
  panelItems: string[]
  leadIn: string
  buttonLabel: string
  buttonHref: string
  closingHtml: string
  footerAddress: string
}

function renderInviteLayout(layout: InviteLayout): string {
  const items = layout.panelItems.map((item) => `&bull;&nbsp; ${item}`).join('<br>\n')
  return `<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body bgcolor="#14110D" background="cid:honeycomb-bg" style="margin:0;padding:0;background:#14110D url(cid:honeycomb-bg) repeat;">
<!--[if gte mso 9]><v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"><v:fill type="tile" src="cid:honeycomb-bg" color="#14110D"/></v:background><![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;"><tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:560px;">
<tr><td bgcolor="#D99614" style="background:#D99614;height:6px;line-height:6px;font-size:0;">&nbsp;</td></tr>
<tr><td bgcolor="#211B14" style="background:#211B14;border:1px solid #33291D;border-top:0;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr><td align="center" style="padding:36px 32px 8px;"><img src="cid:gert-lush-logo" width="200" height="96" alt="Gert Lush Honey" style="display:block;width:200px;height:96px;border:0;"></td></tr>
<tr><td align="center" style="padding:20px 40px 0;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.3;font-weight:bold;color:#F2C35B;">${layout.heading}</td></tr>
<tr><td style="padding:22px 40px 0;${BODY_TEXT}">${layout.introHtml}</td></tr>
<tr><td style="padding:26px 40px 0;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td bgcolor="#14110D" style="background:#14110D;border:1px solid #33291D;border-left:3px solid #D99614;padding:20px 24px;">
<div style="${SANS}font-size:15px;font-weight:bold;color:#D99614;padding-bottom:8px;">${layout.panelTitle}</div>
<div style="${SANS}font-size:14px;line-height:1.85;color:#E8E4DB;">${items}</div>
</td></tr></table>
</td></tr>
<tr><td align="center" style="padding:28px 40px 0;${SANS}font-size:15px;line-height:1.6;color:#E8E4DB;">${layout.leadIn}</td></tr>
<tr><td align="center" style="padding:20px 40px 4px;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td bgcolor="#D99614" style="background:#D99614;border-radius:999px;padding:12px 34px;">
<a href="${escapeHtml(layout.buttonHref)}" target="_blank" style="${SANS}font-size:16px;font-weight:bold;color:#14110D;text-decoration:none;"><span style="color:#14110D;">${layout.buttonLabel} &rarr;</span></a>
</td></tr></table>
</td></tr>
<tr><td style="padding:28px 40px 32px;${BODY_TEXT}">${layout.closingHtml}<br><br>Best<br><span style="color:#F7F5EF;font-weight:bold;">Adam Evans</span><br><span style="color:#F2C35B;">Gert Lush Honey</span></td></tr>
<tr><td align="center" style="border-top:1px solid #33291D;padding:24px 40px 30px;${SANS}font-size:13px;line-height:1.7;color:#A89F8E;">
Gert Lush Honey Ltd &middot; Registered in England and Wales, company number 17554119<br>
14 Beckington Road, Bristol, BS3 5EB<br>
<a href="mailto:${layout.footerAddress}" style="color:#D99614;text-decoration:none;"><span style="color:#D99614;">${layout.footerAddress}</span></a>
</td></tr>
</table>
</td></tr>
</table>
</td></tr></table>
</body>
</html>`
}

export function supplierInviteEmail(to: string): OutgoingEmail {
  return {
    to,
    subject: 'Become a Supplier - Gert Lush Honey',
    replyTo: SUPPLIERS_ADDRESS,
    inlineImages: INLINE_IMAGES,
    html: renderInviteLayout({
      heading: "Love beekeeping. Don't love selling honey?",
      introHtml: `Hi<br><br>
I'm Adam from <b style="color:#F7F5EF;">Gert Lush Honey</b>&nbsp;&mdash; a small, Bristol-based honey brand. We buy bulk honey from independent beekeepers right across Britain and sell it as single-postcode jars, each one credited to the beekeeper who produced it.<br><br>
Most people get into beekeeping for the bees, not for the retail side &mdash; sourcing jars and labels, working out pricing, finding buyers, sorting food-safety paperwork. That's exactly the bit we exist to take off your hands.<br><br>
You keep doing what you already do &mdash; managing your bees, harvesting your honey. We handle the rest: intake, quality checks, jarring, branding and sale &mdash; and you stay credited as the beekeeper behind the batch. No stall to run, no customers to chase. Just a fair price for your surplus.`,
      panelTitle: 'It would help to know',
      panelItems: [
        'Your general apiary area (a postcode is enough for now)',
        'Roughly how many colonies you keep',
        'Your typical surplus per season',
        'How your honey is extracted and stored before collection',
        'Any current beekeeping association registration and insurance',
        "When you'd expect to have honey ready to supply",
      ],
      leadIn: 'If you can fill in our short form below.',
      buttonLabel: 'Start now',
      buttonHref: SUPPLIER_FORM_URL,
      closingHtml:
        "Thank you for the work you put into looking after your bees. We'd love the chance to put your postcode on a jar.",
      footerAddress: SUPPLIERS_ADDRESS,
    }),
  }
}

export function beekeeperInviteEmail(to: string): OutgoingEmail {
  return {
    to,
    subject: 'Meet the Beekeeper: help us tell your story',
    replyTo: ADMIN_ADDRESS,
    inlineImages: INLINE_IMAGES,
    html: renderInviteLayout({
      heading: 'Every jar has a beekeeper behind it.',
      introHtml: `Hi<br><br>
At <b style="color:#F7F5EF;">Gert Lush Honey</b> we think the best thing about proper local honey is knowing exactly where it came from &mdash; the postcode, the hives, and the person who looks after them. That's why every jar we sell is credited to the beekeeper who produced it.<br><br>
We're putting together a <b style="color:#F7F5EF;">Meet the Beekeeper</b> profile for the website, so that anyone who picks up one of your jars can find out who you are, how you got started, and what makes your bees and your patch special.<br><br>
To help us tell your story properly, we've put together some questions to get you talking. There are no right or wrong answers, and rough notes are absolutely fine &mdash; the more of you that comes through, the better.`,
      panelTitle: "What we'll ask about",
      panelItems: [
        'How you first got into beekeeping',
        'Your bees, your apiary and the land around it',
        'What makes your honey different',
        'Your best moments &mdash; and your biggest disasters',
        'Who helps out, and what keeps you doing it',
        'A couple of quick-fire questions to finish',
      ],
      leadIn: "Answer as much or as little as you like &mdash; you can skip anything you'd rather not share.",
      buttonLabel: 'Tell us your story',
      buttonHref: BEEKEEPER_FORM_URL,
      closingHtml:
        "Once we've written your profile, we'll send it over for you to check before anything goes on the website.<br><br>Thank you for the care you put into your bees &mdash; we can't wait to share your story.",
      footerAddress: ADMIN_ADDRESS,
    }),
  }
}

// The heads-up to the business. The visitor's email is the only untrusted
// value anywhere in these templates, so it's escaped (it also goes in as
// Reply-To, so hitting Reply goes straight to them).
export function inviteRequestedNotification(
  kind: 'supplier' | 'beekeeper',
  visitorEmail: string
): OutgoingEmail {
  const label = kind === 'supplier' ? 'Become a Supplier' : 'Meet the Beekeeper'
  const to = kind === 'supplier' ? SUPPLIERS_ADDRESS : ADMIN_ADDRESS
  const safeEmail = escapeHtml(visitorEmail)
  return {
    to,
    subject: `New ${label} request: ${visitorEmail}`,
    replyTo: visitorEmail,
    html: `<p style="${SANS}font-size:15px;">${safeEmail} asked for the <b>${label}</b> email on the website, and it's been sent to them.</p>
<p style="${SANS}font-size:15px;">Reply to this email to contact them directly. Their form answers will arrive in Microsoft Forms as usual.</p>`,
  }
}
