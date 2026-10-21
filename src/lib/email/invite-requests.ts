'use server'

import { getClientIp, isRateLimited } from '@/lib/rate-limit'
import { GraphMailError, isGraphMailConfigured, sendGraphMail } from './graph-mail'
import {
  beekeeperInviteEmail,
  inviteRequestedNotification,
  supplierInviteEmail,
} from './invite-emails'

export type InviteKind = 'supplier' | 'beekeeper'
export type InviteRequestResult = { ok: true } | { ok: false; error: string }

// Every request sends a real email to whatever address was typed in, so
// these limits are tighter than the newsletter's: without them the form
// could be used to send our email to someone who never asked for it, over
// and over. Same two independent axes as every other public form (one IP
// rotating emails; one email retried from rotating IPs) — see
// src/lib/rate-limit.ts.
const INVITE_IP_WINDOW_MS = 60 * 60 * 1000
const INVITE_IP_MAX = 5
const INVITE_EMAIL_WINDOW_MS = 24 * 60 * 60 * 1000
const INVITE_EMAIL_MAX = 2

// Deliberately stricter than the other forms' `includes('@')`: the address
// goes straight into a real outgoing email's To and Reply-To, so anything
// with whitespace, angle brackets or quotes is refused outright.
const EMAIL_PATTERN = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]+$/
const EMAIL_MAX_LENGTH = 254

const BUILDERS = { supplier: supplierInviteEmail, beekeeper: beekeeperInviteEmail }

// Emails the visitor the Become a Supplier or Meet the Beekeeper invite
// (each links to its Microsoft Form), then lets the business know. Never
// throws — every failure comes back as a friendly ok:false.
//
// `honeypot` is the visually hidden field real visitors never fill in; a
// filled one reports success without sending anything, so a bot doesn't
// learn it was caught (same pattern as the review and restock forms).
export async function requestInviteEmail(
  kind: InviteKind,
  email: string,
  honeypot = ''
): Promise<InviteRequestResult> {
  if (kind !== 'supplier' && kind !== 'beekeeper') {
    return { ok: false, error: "Couldn't send that email." }
  }
  const trimmed = email.trim()
  if (trimmed.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(trimmed)) {
    return { ok: false, error: 'Enter a valid email address.' }
  }
  if (honeypot.trim()) {
    return { ok: true }
  }
  if (!isGraphMailConfigured()) {
    return { ok: false, error: "This isn't available right now — please email us instead." }
  }
  if (
    await isRateLimited([
      {
        action: `invite-${kind}-ip`,
        identifier: await getClientIp(),
        windowMs: INVITE_IP_WINDOW_MS,
        max: INVITE_IP_MAX,
      },
      {
        action: `invite-${kind}-email`,
        identifier: trimmed.toLowerCase(),
        windowMs: INVITE_EMAIL_WINDOW_MS,
        max: INVITE_EMAIL_MAX,
      },
    ])
  ) {
    return { ok: false, error: 'Too many attempts — please try again later.' }
  }

  try {
    await sendGraphMail(BUILDERS[kind](trimmed))
  } catch (error) {
    console.error(
      `Invite email (${kind}) failed:`,
      error instanceof GraphMailError ? error.message : error
    )
    return { ok: false, error: "Couldn't send the email — please try again." }
  }

  // The visitor already has their email at this point, so a failed heads-up
  // is logged rather than reported back to them as a failure.
  try {
    await sendGraphMail(inviteRequestedNotification(kind, trimmed))
  } catch (error) {
    console.error(
      `Invite notification (${kind}) failed:`,
      error instanceof GraphMailError ? error.message : error
    )
  }

  return { ok: true }
}
