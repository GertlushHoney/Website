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

describe('requestInviteEmail', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('sends the supplier invite to the visitor, then the heads-up to suppliers@', async () => {
    const { sendGraphMail } = await import('./graph-mail')
    const { requestInviteEmail } = await import('./invite-requests')

    expect(await requestInviteEmail('supplier', '  bee@example.com ')).toEqual({ ok: true })

    const [invite, notice] = vi.mocked(sendGraphMail).mock.calls.map(([email]) => email)
    expect(invite.to).toBe('bee@example.com')
    expect(invite.subject).toBe('Become a Supplier - Gert Lush Honey')
    expect(invite.replyTo).toBe('suppliers@gertlushhoney.co.uk')
    expect(invite.html).toContain('VURDlVNlFURVBIR1lESFRMN0pIRUEzMFMyUi4u')
    expect(notice.to).toBe('suppliers@gertlushhoney.co.uk')
    expect(notice.replyTo).toBe('bee@example.com')
  })

  it('sends the beekeeper invite with its own form link, notifying admin@', async () => {
    const { sendGraphMail } = await import('./graph-mail')
    const { requestInviteEmail } = await import('./invite-requests')

    expect(await requestInviteEmail('beekeeper', 'bee@example.com')).toEqual({ ok: true })

    const [invite, notice] = vi.mocked(sendGraphMail).mock.calls.map(([email]) => email)
    expect(invite.subject).toBe('Meet the Beekeeper: help us tell your story')
    expect(invite.html).toContain('VUM1ZCWUlVQU5FVUJBU1A0SlNZRExYUFFLRy4u')
    expect(invite.html).not.toContain('VURDlVNlFURVBIR1lESFRMN0pIRUEzMFMyUi4u')
    expect(notice.to).toBe('admin@gertlushhoney.co.uk')
  })

  it.each(['not-an-email', 'a@b', 'evil@example.com\nBcc: x@y.com', '"a"@example.com', 'a <b@c.com>'])(
    'rejects %j without sending anything',
    async (email) => {
      const { sendGraphMail } = await import('./graph-mail')
      const { isRateLimited } = await import('@/lib/rate-limit')
      const { requestInviteEmail } = await import('./invite-requests')

      expect(await requestInviteEmail('supplier', email)).toEqual({
        ok: false,
        error: 'Enter a valid email address.',
      })
      expect(isRateLimited).not.toHaveBeenCalled()
      expect(sendGraphMail).not.toHaveBeenCalled()
    }
  )

  it('rejects an unknown kind sent by calling the action directly', async () => {
    const { sendGraphMail } = await import('./graph-mail')
    const { requestInviteEmail } = await import('./invite-requests')

    // @ts-expect-error — deliberately not a real InviteKind
    const result = await requestInviteEmail('newsletter', 'bee@example.com')

    expect(result.ok).toBe(false)
    expect(sendGraphMail).not.toHaveBeenCalled()
  })

  it('reports success for a filled honeypot without sending anything', async () => {
    const { sendGraphMail } = await import('./graph-mail')
    const { requestInviteEmail } = await import('./invite-requests')

    expect(await requestInviteEmail('supplier', 'bee@example.com', 'https://spam.example')).toEqual({
      ok: true,
    })
    expect(sendGraphMail).not.toHaveBeenCalled()
  })

  it('checks the IP and lowercased email per kind, and sends nothing when limited', async () => {
    const { isRateLimited } = await import('@/lib/rate-limit')
    vi.mocked(isRateLimited).mockResolvedValueOnce(true)
    const { sendGraphMail } = await import('./graph-mail')
    const { requestInviteEmail } = await import('./invite-requests')

    const result = await requestInviteEmail('beekeeper', 'Bee@Example.com')

    expect(result).toEqual({ ok: false, error: 'Too many attempts — please try again later.' })
    expect(isRateLimited).toHaveBeenCalledWith([
      expect.objectContaining({ action: 'invite-beekeeper-ip', identifier: '203.0.113.1' }),
      expect.objectContaining({ action: 'invite-beekeeper-email', identifier: 'bee@example.com' }),
    ])
    expect(sendGraphMail).not.toHaveBeenCalled()
  })

  it('fails gracefully when Microsoft Graph is not configured', async () => {
    const { isGraphMailConfigured, sendGraphMail } = await import('./graph-mail')
    vi.mocked(isGraphMailConfigured).mockReturnValueOnce(false)
    const { requestInviteEmail } = await import('./invite-requests')

    const result = await requestInviteEmail('supplier', 'bee@example.com')

    expect(result.ok).toBe(false)
    expect(sendGraphMail).not.toHaveBeenCalled()
  })

  it('reports failure if the invite itself cannot be sent', async () => {
    const { sendGraphMail, GraphMailError } = await import('./graph-mail')
    vi.mocked(sendGraphMail).mockRejectedValueOnce(new GraphMailError('boom'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { requestInviteEmail } = await import('./invite-requests')

    expect(await requestInviteEmail('supplier', 'bee@example.com')).toEqual({
      ok: false,
      error: "Couldn't send the email — please try again.",
    })
    expect(sendGraphMail).toHaveBeenCalledTimes(1)
  })

  it('still reports success if only the heads-up fails, since the visitor got their email', async () => {
    const { sendGraphMail, GraphMailError } = await import('./graph-mail')
    vi.mocked(sendGraphMail)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new GraphMailError('boom'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { requestInviteEmail } = await import('./invite-requests')

    expect(await requestInviteEmail('supplier', 'bee@example.com')).toEqual({ ok: true })
  })
})
