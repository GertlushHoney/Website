import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./graph-mail', () => ({
  isGraphMailConfigured: vi.fn(() => true),
  sendGraphMail: vi.fn(async () => {}),
  GraphMailError: class GraphMailError extends Error {},
}))
vi.mock('@/lib/shopify/admin-client', () => ({
  isShopifyAdminConfigured: vi.fn(() => true),
}))
vi.mock('@/lib/shopify/waitlist', () => ({
  addToPostcodeWaitlist: vi.fn(async () => true),
  waitlistTag: (code: string) => `waitlist:${code}`,
}))
vi.mock('@/lib/rate-limit', () => ({
  getClientIp: vi.fn(async () => '203.0.113.1'),
  isRateLimited: vi.fn(async () => false),
}))

describe('joinPostcodeWaitingList', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('saves the visitor in Shopify and emails sales@, replying to the visitor, with nothing sent to the visitor', async () => {
    const { sendGraphMail } = await import('./graph-mail')
    const { addToPostcodeWaitlist } = await import('@/lib/shopify/waitlist')
    const { joinPostcodeWaitingList } = await import('./waiting-list')

    expect(await joinPostcodeWaitingList('bs3', '  bee@example.com ')).toEqual({ ok: true })

    expect(addToPostcodeWaitlist).toHaveBeenCalledWith('bee@example.com', 'BS3', false)
    expect(sendGraphMail).toHaveBeenCalledTimes(1)
    const [email] = vi.mocked(sendGraphMail).mock.calls[0]
    expect(email.to).toBe('sales@gertlushhoney.co.uk')
    expect(email.replyTo).toBe('bee@example.com')
    expect(email.subject).toBe('Postcode honey waiting list: BS3 (Bristol)')
    expect(email.html).toContain('bee@example.com')
    expect(email.html).toContain('waitlist:BS3')
    expect(email.html).toContain('did not tick')
  })

  it('subscribes to marketing only when the box is ticked, and says so in the email', async () => {
    const { sendGraphMail } = await import('./graph-mail')
    const { addToPostcodeWaitlist } = await import('@/lib/shopify/waitlist')
    const { joinPostcodeWaitingList } = await import('./waiting-list')

    await joinPostcodeWaitingList('BS3', 'bee@example.com', '', true)
    expect(addToPostcodeWaitlist).toHaveBeenCalledWith('bee@example.com', 'BS3', true)
    expect(vi.mocked(sendGraphMail).mock.calls[0][0].html).toContain('subscribed to your marketing')

    vi.clearAllMocks()
    // @ts-expect-error — a direct caller could send any type
    await joinPostcodeWaitingList('BS3', 'bee@example.com', '', 'yes')
    expect(addToPostcodeWaitlist).toHaveBeenCalledWith('bee@example.com', 'BS3', false)
  })

  it('still succeeds, and tells sales@ to add them by hand, if only the Shopify save fails', async () => {
    const { sendGraphMail } = await import('./graph-mail')
    const { addToPostcodeWaitlist } = await import('@/lib/shopify/waitlist')
    vi.mocked(addToPostcodeWaitlist).mockResolvedValueOnce(false)
    const { joinPostcodeWaitingList } = await import('./waiting-list')

    expect(await joinPostcodeWaitingList('BS3', 'bee@example.com')).toEqual({ ok: true })
    expect(vi.mocked(sendGraphMail).mock.calls[0][0].html).toContain('Could not be saved to Shopify')
  })

  it('still succeeds if only the notification email fails, since they are saved in Shopify', async () => {
    const { sendGraphMail, GraphMailError } = await import('./graph-mail')
    vi.mocked(sendGraphMail).mockRejectedValueOnce(new GraphMailError('boom'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { joinPostcodeWaitingList } = await import('./waiting-list')

    expect(await joinPostcodeWaitingList('BS3', 'bee@example.com')).toEqual({ ok: true })
  })

  it('works with only Shopify configured', async () => {
    const { isGraphMailConfigured, sendGraphMail } = await import('./graph-mail')
    vi.mocked(isGraphMailConfigured).mockReturnValueOnce(false)
    const { joinPostcodeWaitingList } = await import('./waiting-list')

    expect(await joinPostcodeWaitingList('BS3', 'bee@example.com')).toEqual({ ok: true })
    expect(sendGraphMail).not.toHaveBeenCalled()
  })

  it.each(['', 'ZZ', '<script>', 'BS3 <b>x</b>'])(
    'rejects the unknown postcode %j without saving or sending anything',
    async (code) => {
      const { sendGraphMail } = await import('./graph-mail')
      const { addToPostcodeWaitlist } = await import('@/lib/shopify/waitlist')
      const { joinPostcodeWaitingList } = await import('./waiting-list')

      expect((await joinPostcodeWaitingList(code, 'bee@example.com')).ok).toBe(false)
      expect(addToPostcodeWaitlist).not.toHaveBeenCalled()
      expect(sendGraphMail).not.toHaveBeenCalled()
    }
  )

  it.each(['not-an-email', 'a@b', 'evil@example.com\nBcc: x@y.com', 'a <b@c.com>'])(
    'rejects %j without rate limiting, saving or sending',
    async (email) => {
      const { sendGraphMail } = await import('./graph-mail')
      const { isRateLimited } = await import('@/lib/rate-limit')
      const { addToPostcodeWaitlist } = await import('@/lib/shopify/waitlist')
      const { joinPostcodeWaitingList } = await import('./waiting-list')

      expect(await joinPostcodeWaitingList('BS', email)).toEqual({
        ok: false,
        error: 'Enter a valid email address.',
      })
      expect(isRateLimited).not.toHaveBeenCalled()
      expect(addToPostcodeWaitlist).not.toHaveBeenCalled()
      expect(sendGraphMail).not.toHaveBeenCalled()
    }
  )

  it('reports success for a filled honeypot without saving or sending anything', async () => {
    const { sendGraphMail } = await import('./graph-mail')
    const { addToPostcodeWaitlist } = await import('@/lib/shopify/waitlist')
    const { joinPostcodeWaitingList } = await import('./waiting-list')

    expect(await joinPostcodeWaitingList('BS', 'bee@example.com', 'https://spam.example')).toEqual({
      ok: true,
    })
    expect(addToPostcodeWaitlist).not.toHaveBeenCalled()
    expect(sendGraphMail).not.toHaveBeenCalled()
  })

  it('checks the IP and lowercased email, and does nothing when limited', async () => {
    const { isRateLimited } = await import('@/lib/rate-limit')
    vi.mocked(isRateLimited).mockResolvedValueOnce(true)
    const { sendGraphMail } = await import('./graph-mail')
    const { addToPostcodeWaitlist } = await import('@/lib/shopify/waitlist')
    const { joinPostcodeWaitingList } = await import('./waiting-list')

    expect(await joinPostcodeWaitingList('BS', 'Bee@Example.com')).toEqual({
      ok: false,
      error: 'Too many attempts — please try again later.',
    })
    expect(isRateLimited).toHaveBeenCalledWith([
      expect.objectContaining({ action: 'waitlist-ip', identifier: '203.0.113.1' }),
      expect.objectContaining({ action: 'waitlist-email', identifier: 'bee@example.com' }),
    ])
    expect(addToPostcodeWaitlist).not.toHaveBeenCalled()
    expect(sendGraphMail).not.toHaveBeenCalled()
  })

  it('fails gracefully when neither Microsoft Graph nor Shopify is configured', async () => {
    const { isGraphMailConfigured, sendGraphMail } = await import('./graph-mail')
    const { isShopifyAdminConfigured } = await import('@/lib/shopify/admin-client')
    vi.mocked(isGraphMailConfigured).mockReturnValueOnce(false)
    vi.mocked(isShopifyAdminConfigured).mockReturnValueOnce(false)
    const { joinPostcodeWaitingList } = await import('./waiting-list')

    expect((await joinPostcodeWaitingList('BS', 'bee@example.com')).ok).toBe(false)
    expect(sendGraphMail).not.toHaveBeenCalled()
  })

  it('reports failure only if both the Shopify save and the email fail', async () => {
    const { sendGraphMail, GraphMailError } = await import('./graph-mail')
    const { addToPostcodeWaitlist } = await import('@/lib/shopify/waitlist')
    vi.mocked(addToPostcodeWaitlist).mockResolvedValueOnce(false)
    vi.mocked(sendGraphMail).mockRejectedValueOnce(new GraphMailError('boom'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { joinPostcodeWaitingList } = await import('./waiting-list')

    expect(await joinPostcodeWaitingList('BS', 'bee@example.com')).toEqual({
      ok: false,
      error: "Couldn't add you to the list — please try again.",
    })
  })
})
