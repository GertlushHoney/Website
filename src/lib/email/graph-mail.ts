// Sends email through the business's own Microsoft 365 tenant via Microsoft
// Graph (POST /users/{mailbox}/sendMail) — added 2026-10-21 for the Become a
// Supplier and Meet the Beekeeper invite forms. No third-party email service:
// mail goes out from the real gertlushhoney.co.uk mailbox, already passes the
// domain's existing SPF/DKIM, and lands in that mailbox's Sent Items like any
// email sent by hand. Never import this file from a client component; every
// caller must be a 'use server' function.
//
// Auth is an Entra ID (Azure AD) app registration with the Microsoft Graph
// *application* permission Mail.Send (admin-consented), exchanged for a
// short-lived token via the OAuth client_credentials grant — the same shape
// as admin-client.ts's Shopify token exchange. See docs/launch-checklist.md
// point 19 for the one-off setup, including the Exchange application access
// policy that restricts the app to the one sending mailbox.
const tenantId = process.env.MS_GRAPH_TENANT_ID
const clientId = process.env.MS_GRAPH_CLIENT_ID
const clientSecret = process.env.MS_GRAPH_CLIENT_SECRET
// The mailbox Graph sends as (its user principal name, e.g. the shared
// inbox's real address). Role addresses like suppliers@/admin@ are aliases
// of it — they go on the email as Reply-To, so replies still land under the
// right alias without needing Exchange's send-from-alias feature.
const senderMailbox = process.env.MS_GRAPH_SENDER_MAILBOX

export function isGraphMailConfigured(): boolean {
  return Boolean(tenantId && clientId && clientSecret && senderMailbox)
}

export class GraphMailError extends Error {}

export type InlineImage = {
  // Referenced from the HTML as src="cid:<contentId>"
  contentId: string
  name: string
  contentType: string
  base64: string
}

export type OutgoingEmail = {
  to: string
  subject: string
  html: string
  replyTo?: string
  inlineImages?: InlineImage[]
}

let cachedToken: string | null = null
let cachedTokenExpiresAt = 0

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedTokenExpiresAt - 60_000) {
    return cachedToken
  }

  const res = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId!,
      client_secret: clientSecret!,
      scope: 'https://graph.microsoft.com/.default',
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new GraphMailError(`Microsoft Graph token exchange failed: ${res.status}`)
  }

  const json = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = json.access_token
  cachedTokenExpiresAt = Date.now() + json.expires_in * 1000
  return cachedToken
}

export async function sendGraphMail(email: OutgoingEmail): Promise<void> {
  if (!isGraphMailConfigured()) {
    throw new GraphMailError('Microsoft Graph mail is not configured')
  }

  const token = await getAccessToken()
  const message = {
    subject: email.subject,
    body: { contentType: 'HTML', content: email.html },
    toRecipients: [{ emailAddress: { address: email.to } }],
    ...(email.replyTo ? { replyTo: [{ emailAddress: { address: email.replyTo } }] } : {}),
    ...(email.inlineImages?.length
      ? {
          attachments: email.inlineImages.map((image) => ({
            '@odata.type': '#microsoft.graph.fileAttachment',
            name: image.name,
            contentType: image.contentType,
            contentBytes: image.base64,
            contentId: image.contentId,
            isInline: true,
          })),
        }
      : {}),
  }

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(senderMailbox!)}/sendMail`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, saveToSentItems: true }),
      cache: 'no-store',
    }
  )

  // Graph answers a successful sendMail with 202 Accepted and an empty body.
  if (res.status !== 202) {
    throw new GraphMailError(`Microsoft Graph sendMail failed: ${res.status}`)
  }
}
