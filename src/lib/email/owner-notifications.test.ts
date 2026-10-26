import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./graph-mail', () => ({
  isGraphMailConfigured: vi.fn(() => true),
  sendGraphMail: vi.fn(async () => {}),
  GraphMailError: class GraphMailError extends Error {},
}))

describe('owner notifications', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('emails the review to admin@ with the text escaped and how to approve it', async () => {
    const { sendGraphMail } = await import('./graph-mail')
    const { notifyNewReview } = await import('./owner-notifications')

    expect(
      await notifyNewReview({
        productName: 'Bee S3',
        reviewerName: '<b>Alex</b>',
        rating: 4,
        body: 'Lovely <script>alert(1)</script> honey',
      })
    ).toBe(true)

    const [email] = vi.mocked(sendGraphMail).mock.calls[0]
    expect(email.to).toBe('admin@gertlushhoney.co.uk')
    expect(email.subject).toBe('New 4/5 review for Bee S3 — needs approving')
    expect(email.html).not.toContain('<script>')
    expect(email.html).toContain('&lt;script&gt;')
    expect(email.html).toContain('/studio/structure/productReview')
  })

  it('emails an overbooking to admin@ saying what to do and where to tick Resolved', async () => {
    const { sendGraphMail } = await import('./graph-mail')
    const { notifyBookingConflict } = await import('./owner-notifications')

    await notifyBookingConflict({
      orderName: '#1042',
      productTitle: 'Bee Day Experience',
      sessionDate: '2027-04-24',
      placesRequested: 2,
      placesRemaining: 1,
    })

    const [email] = vi.mocked(sendGraphMail).mock.calls[0]
    expect(email.to).toBe('admin@gertlushhoney.co.uk')
    expect(email.subject).toContain('#1042')
    expect(email.html).toContain('refund')
    expect(email.html).toContain('/studio/structure/experienceBookingConflict')
  })

  it('emails a bad hamper selection to admin@ with the customer text escaped and stock-not-deducted made clear', async () => {
    const { sendGraphMail } = await import('./graph-mail')
    const { notifyHamperSelectionProblem } = await import('./owner-notifications')

    await notifyHamperSelectionProblem({
      orderName: '#1300',
      productTitle: 'Hamper - 3 Jar Honey',
      variantTitle: 'Choose your own',
      selectionText: '1x <b>Bee S3</b>',
      reason: '1 jar(s) were selected but this hamper holds exactly 3',
    })

    const [email] = vi.mocked(sendGraphMail).mock.calls[0]
    expect(email.to).toBe('admin@gertlushhoney.co.uk')
    expect(email.subject).toContain('#1300')
    expect(email.html).toContain('no honey stock was deducted')
    expect(email.html).toContain('holds exactly 3')
    expect(email.html).not.toContain('<b>Bee S3</b>')
    expect(email.html).toContain('&lt;b&gt;Bee S3&lt;/b&gt;')
  })

  it('does nothing and reports false when Microsoft Graph is not configured', async () => {
    const { isGraphMailConfigured, sendGraphMail } = await import('./graph-mail')
    vi.mocked(isGraphMailConfigured).mockReturnValueOnce(false)
    const { sendOwnerNotification } = await import('./owner-notifications')

    expect(await sendOwnerNotification({ subject: 's', html: 'h' })).toBe(false)
    expect(sendGraphMail).not.toHaveBeenCalled()
  })

  it('never throws when sending fails', async () => {
    const { sendGraphMail, GraphMailError } = await import('./graph-mail')
    vi.mocked(sendGraphMail).mockRejectedValueOnce(new GraphMailError('boom'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { sendOwnerNotification } = await import('./owner-notifications')

    expect(await sendOwnerNotification({ subject: 's', html: 'h' })).toBe(false)
  })
})
