import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./graph-mail', () => ({
  isGraphMailConfigured: vi.fn(() => true),
  sendGraphMail: vi.fn(async () => {}),
  GraphMailError: class GraphMailError extends Error {},
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

  it('emails sales@ with the postcode, replying to the visitor, and sends nothing to the visitor', async () => {
    const { sendGraphMail } = await import('./graph-mail')
    const { joinPostcodeWaitingList } = await import('./waiting-list')

    expect(await joinPostcodeWaitingList('bs3', '  bee@example.com ')).toEqual({ ok: true })

    expect(sendGraphMail).toHaveBeenCalledTimes(1)
    const [email] = vi.mocked(sendGraphMail).mock.calls[0]
    expect(email.to).toBe('sales@gertlushhoney.co.uk')
    expect(email.replyTo).toBe('bee@example.com')
    expect(email.subject).toBe('Postcode honey waiting list: BS3 (Bristol)')
    expect(email.html).toContain('bee@example.com')
  })

  it.each(['', 'ZZ', '<script>', 'BS3 <b>x</b>'])(
    'rejects the unknown postcode %j without sending anything',
    async (code) => {
      const { sendGraphMail } = await import('./graph-mail')
      const { joinPostcodeWaitingList } = await import('./waiting-list')

      expect((await joinPostcodeWaitingList(code, 'bee@example.com')).ok).toBe(false)
      expect(sendGraphMail).not.toHaveBeenCalled()
    }
  )

  it.each(['not-an-email', 'a@b', 'evil@example.com\nBcc: x@y.com', 'a <b@c.com>'])(
    'rejects %j without rate limiting or sending',
    async (email) => {
      const { sendGraphMail } = await import('./graph-mail')
      const { isRateLimited } = await import('@/lib/rate-limit')
      const { joinPostcodeWaitingList } = await import('./waiting-list')

      expect(await joinPostcodeWaitingList('BS', email)).toEqual({
        ok: false,
        error: 'Enter a valid email address.',
      })
      expect(isRateLimited).not.toHaveBeenCalled()
      expect(sendGraphMail).not.toHaveBeenCalled()
    }
  )

  it('reports success for a filled honeypot without sending anything', async () => {
    const { sendGraphMail } = await import('./graph-mail')
    const { joinPostcodeWaitingList } = await import('./waiting-list')

    expect(await joinPostcodeWaitingList('BS', 'bee@example.com', 'https://spam.example')).toEqual({
      ok: true,
    })
    expect(sendGraphMail).not.toHaveBeenCalled()
  })

  it('checks the IP and lowercased email, and sends nothing when limited', async () => {
    const { isRateLimited } = await import('@/lib/rate-limit')
    vi.mocked(isRateLimited).mockResolvedValueOnce(true)
    const { sendGraphMail } = await import('./graph-mail')
    const { joinPostcodeWaitingList } = await import('./waiting-list')

    expect(await joinPostcodeWaitingList('BS', 'Bee@Example.com')).toEqual({
      ok: false,
      error: 'Too many attempts — please try again later.',
    })
    expect(isRateLimited).toHaveBeenCalledWith([
      expect.objectContaining({ action: 'waitlist-ip', identifier: '203.0.113.1' }),
      expect.objectContaining({ action: 'waitlist-email', identifier: 'bee@example.com' }),
    ])
    expect(sendGraphMail).not.toHaveBeenCalled()
  })

  it('fails gracefully when Microsoft Graph is not configured', async () => {
    const { isGraphMailConfigured, sendGraphMail } = await import('./graph-mail')
    vi.mocked(isGraphMailConfigured).mockReturnValueOnce(false)
    const { joinPostcodeWaitingList } = await import('./waiting-list')

    expect((await joinPostcodeWaitingList('BS', 'bee@example.com')).ok).toBe(false)
    expect(sendGraphMail).not.toHaveBeenCalled()
  })

  it('reports failure if the email cannot be sent', async () => {
    const { sendGraphMail, GraphMailError } = await import('./graph-mail')
    vi.mocked(sendGraphMail).mockRejectedValueOnce(new GraphMailError('boom'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { joinPostcodeWaitingList } = await import('./waiting-list')

    expect(await joinPostcodeWaitingList('BS', 'bee@example.com')).toEqual({
      ok: false,
      error: "Couldn't add you to the list — please try again.",
    })
  })
})
