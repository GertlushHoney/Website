import { describe, expect, it } from 'vitest'
import {
  beekeeperInviteEmail,
  escapeHtml,
  inviteRequestedNotification,
  supplierInviteEmail,
} from './invite-emails'

describe('invite emails', () => {
  it.each([
    ['supplier', supplierInviteEmail],
    ['beekeeper', beekeeperInviteEmail],
  ] as const)('the %s invite references both inline images it attaches', (_, build) => {
    const email = build('bee@example.com')
    const ids = email.inlineImages!.map((image) => image.contentId)

    expect(ids).toEqual(['gert-lush-logo', 'honeycomb-bg'])
    for (const id of ids) expect(email.html).toContain(`cid:${id}`)
    for (const image of email.inlineImages!) expect(image.base64.length).toBeGreaterThan(1000)
  })

  it('escapes the form link ampersands in the button href', () => {
    const html = supplierInviteEmail('bee@example.com').html
    expect(html).toContain('&amp;origin=Invitation&amp;channel=0')
  })

  it('escapes the visitor email in the heads-up body', () => {
    const notice = inviteRequestedNotification('supplier', 'a&b@example.com')
    expect(notice.html).toContain('a&amp;b@example.com')
    expect(notice.html).not.toContain('a&b@example.com')
  })

  it('escapeHtml covers every HTML-significant character', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;')
  })
})
