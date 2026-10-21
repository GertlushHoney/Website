import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const ENV = {
  MS_GRAPH_TENANT_ID: 'tenant-123',
  MS_GRAPH_CLIENT_ID: 'client-456',
  MS_GRAPH_CLIENT_SECRET: 'secret-789',
  MS_GRAPH_SENDER_MAILBOX: 'inbox@gertlushhoney.co.uk',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status })
}

describe('sendGraphMail', () => {
  beforeEach(() => {
    vi.resetModules()
    for (const [key, value] of Object.entries(ENV)) vi.stubEnv(key, value)
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('is unconfigured, and refuses to send, without every env var', async () => {
    vi.stubEnv('MS_GRAPH_SENDER_MAILBOX', '')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { isGraphMailConfigured, sendGraphMail } = await import('./graph-mail')

    expect(isGraphMailConfigured()).toBe(false)
    await expect(sendGraphMail({ to: 'a@b.com', subject: 's', html: 'h' })).rejects.toThrow()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('exchanges client credentials, then posts the message to the sender mailbox', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ access_token: 'tok', expires_in: 3600 }))
      .mockResolvedValueOnce(new Response(null, { status: 202 }))
    vi.stubGlobal('fetch', fetchMock)
    const { sendGraphMail } = await import('./graph-mail')

    await sendGraphMail({
      to: 'bee@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      replyTo: 'suppliers@gertlushhoney.co.uk',
      inlineImages: [{ contentId: 'logo', name: 'logo.png', contentType: 'image/png', base64: 'AAAA' }],
    })

    const [tokenUrl, tokenInit] = fetchMock.mock.calls[0]
    expect(tokenUrl).toBe('https://login.microsoftonline.com/tenant-123/oauth2/v2.0/token')
    const tokenBody = new URLSearchParams(tokenInit.body)
    expect(tokenBody.get('grant_type')).toBe('client_credentials')
    expect(tokenBody.get('scope')).toBe('https://graph.microsoft.com/.default')

    const [sendUrl, sendInit] = fetchMock.mock.calls[1]
    expect(sendUrl).toBe(
      'https://graph.microsoft.com/v1.0/users/inbox%40gertlushhoney.co.uk/sendMail'
    )
    expect(sendInit.headers.Authorization).toBe('Bearer tok')
    const { message, saveToSentItems } = JSON.parse(sendInit.body)
    expect(saveToSentItems).toBe(true)
    expect(message.toRecipients).toEqual([{ emailAddress: { address: 'bee@example.com' } }])
    expect(message.replyTo).toEqual([{ emailAddress: { address: 'suppliers@gertlushhoney.co.uk' } }])
    expect(message.body).toEqual({ contentType: 'HTML', content: '<p>Hi</p>' })
    expect(message.attachments[0]).toMatchObject({ contentId: 'logo', isInline: true, contentBytes: 'AAAA' })
  })

  it('reuses a still-valid token instead of fetching a new one', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ access_token: 'tok', expires_in: 3600 }))
      .mockResolvedValue(new Response(null, { status: 202 }))
    vi.stubGlobal('fetch', fetchMock)
    const { sendGraphMail } = await import('./graph-mail')

    await sendGraphMail({ to: 'a@b.com', subject: 's', html: 'h' })
    await sendGraphMail({ to: 'a@b.com', subject: 's', html: 'h' })

    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('throws when the token exchange or the send is refused', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(jsonResponse({}, 401)))
    const first = await import('./graph-mail')
    await expect(first.sendGraphMail({ to: 'a@b.com', subject: 's', html: 'h' })).rejects.toThrow(
      'token exchange failed: 401'
    )

    vi.resetModules()
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({ access_token: 'tok', expires_in: 3600 }))
        .mockResolvedValueOnce(jsonResponse({ error: { code: 'ErrorAccessDenied' } }, 403))
    )
    const second = await import('./graph-mail')
    await expect(second.sendGraphMail({ to: 'a@b.com', subject: 's', html: 'h' })).rejects.toThrow(
      'sendMail failed: 403'
    )
  })
})
