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

const valid = {
  name: ' Alex ',
  email: ' alex@example.com ',
  topic: 'An order or subscription',
  message: 'Where is my <order>?',
}

describe('sendContactMessage', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('emails hello@ replying to the visitor, with their text escaped', async () => {
    const { sendGraphMail } = await import('./graph-mail')
    const { sendContactMessage } = await import('./contact')

    expect(await sendContactMessage(valid)).toEqual({ ok: true })

    expect(sendGraphMail).toHaveBeenCalledTimes(1)
    const [email] = vi.mocked(sendGraphMail).mock.calls[0]
    expect(email.to).toBe('hello@gertlushhoney.co.uk')
    expect(email.replyTo).toBe('alex@example.com')
    expect(email.subject).toBe('An order or subscription — via gertlushhoney.co.uk')
    expect(email.html).toContain('Where is my &lt;order&gt;?')
    expect(email.html).not.toContain('<order>')
  })

  it.each([
    [{ name: '  ' }, 'Fill in your name and a message.'],
    [{ message: '' }, 'Fill in your name and a message.'],
    [{ email: 'not-an-email' }, 'Enter a valid email address so we can reply.'],
    [{ email: 'a@b.com\nBcc: x@y.com' }, 'Enter a valid email address so we can reply.'],
    [{ topic: 'Free money' }, 'Choose what your message is about.'],
  ])('rejects %j without sending', async (override, error) => {
    const { sendGraphMail } = await import('./graph-mail')
    const { isRateLimited } = await import('@/lib/rate-limit')
    const { sendContactMessage } = await import('./contact')

    expect(await sendContactMessage({ ...valid, ...override })).toEqual({ ok: false, error })
    expect(isRateLimited).not.toHaveBeenCalled()
    expect(sendGraphMail).not.toHaveBeenCalled()
  })

  it('rejects an over-long name or message', async () => {
    const { sendContactMessage } = await import('./contact')

    expect((await sendContactMessage({ ...valid, name: 'a'.repeat(101) })).ok).toBe(false)
    expect((await sendContactMessage({ ...valid, message: 'a'.repeat(5001) })).ok).toBe(false)
  })

  it('reports success for a filled honeypot without sending anything', async () => {
    const { sendGraphMail } = await import('./graph-mail')
    const { sendContactMessage } = await import('./contact')

    expect(await sendContactMessage({ ...valid, honeypot: 'https://spam.example' })).toEqual({
      ok: true,
    })
    expect(sendGraphMail).not.toHaveBeenCalled()
  })

  it('checks the IP and lowercased email, and sends nothing when limited', async () => {
    const { isRateLimited } = await import('@/lib/rate-limit')
    vi.mocked(isRateLimited).mockResolvedValueOnce(true)
    const { sendGraphMail } = await import('./graph-mail')
    const { sendContactMessage } = await import('./contact')

    expect(await sendContactMessage({ ...valid, email: 'Alex@Example.com' })).toEqual({
      ok: false,
      error: 'Too many attempts — please try again later.',
    })
    expect(isRateLimited).toHaveBeenCalledWith([
      expect.objectContaining({ action: 'contact-ip', identifier: '203.0.113.1' }),
      expect.objectContaining({ action: 'contact-email', identifier: 'alex@example.com' }),
    ])
    expect(sendGraphMail).not.toHaveBeenCalled()
  })

  it('fails gracefully when Microsoft Graph is not configured', async () => {
    const { isGraphMailConfigured, sendGraphMail } = await import('./graph-mail')
    vi.mocked(isGraphMailConfigured).mockReturnValueOnce(false)
    const { sendContactMessage } = await import('./contact')

    expect((await sendContactMessage(valid)).ok).toBe(false)
    expect(sendGraphMail).not.toHaveBeenCalled()
  })

  it('reports failure if the email cannot be sent', async () => {
    const { sendGraphMail, GraphMailError } = await import('./graph-mail')
    vi.mocked(sendGraphMail).mockRejectedValueOnce(new GraphMailError('boom'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { sendContactMessage } = await import('./contact')

    expect(await sendContactMessage(valid)).toEqual({
      ok: false,
      error: "Couldn't send your message — please try again.",
    })
  })
})
