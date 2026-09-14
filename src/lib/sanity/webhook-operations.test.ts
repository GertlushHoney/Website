import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/sanity/write-client', () => ({
  isSanityWriteConfigured: vi.fn(() => true),
  getSanityWriteClient: vi.fn(),
}))

describe('buildOperationId', () => {
  it('is deterministic — the same parts always produce the same id', async () => {
    const { buildOperationId } = await import('./webhook-operations')
    const id1 = buildOperationId(['webhook-123', 'hamper', 456, 'Bee S3'])
    const id2 = buildOperationId(['webhook-123', 'hamper', 456, 'Bee S3'])
    expect(id1).toBe(id2)
  })

  it('produces a different id for a different honey on the same line item', async () => {
    const { buildOperationId } = await import('./webhook-operations')
    const bee3 = buildOperationId(['webhook-123', 'hamper', 456, 'Bee S3'])
    const bee4 = buildOperationId(['webhook-123', 'hamper', 456, 'Bee S4'])
    expect(bee3).not.toBe(bee4)
  })

  it('sanitizes free-text parts (spaces, apostrophes, mixed case) into a valid Sanity document id', async () => {
    const { buildOperationId } = await import('./webhook-operations')
    const id = buildOperationId(['webhook-123', 'hamper', 456, "Bee's Best Honey!"])
    expect(id).toMatch(/^[A-Za-z0-9._-]+$/)
  })
})

describe('isOperationCompleted / markOperationCompleted', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('returns false and does not enforce dedup when Sanity write access is not configured, but logs loudly', async () => {
    const { isSanityWriteConfigured } = await import('@/lib/sanity/write-client')
    vi.mocked(isSanityWriteConfigured).mockReturnValue(false)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { isOperationCompleted } = await import('./webhook-operations')
    const result = await isOperationCompleted('webhookOp.w1.hamper.1.bee-s3')

    expect(result).toBe(false)
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('NOT being enforced'))
    errorSpy.mockRestore()
  })

  it('returns true once the operation has been marked completed, false before', async () => {
    const { isSanityWriteConfigured, getSanityWriteClient } = await import('@/lib/sanity/write-client')
    vi.mocked(isSanityWriteConfigured).mockReturnValue(true)
    const docs = new Map<string, unknown>()
    const client = {
      getDocument: vi.fn(async (id: string) => docs.get(id) ?? null),
      createIfNotExists: vi.fn(async (doc: { _id: string }) => {
        docs.set(doc._id, doc)
        return doc
      }),
    }
    vi.mocked(getSanityWriteClient).mockReturnValue(client as never)

    const { isOperationCompleted, markOperationCompleted } = await import('./webhook-operations')
    const operationId = 'webhookOp.w1.hamper.1.bee-s3'

    expect(await isOperationCompleted(operationId)).toBe(false)

    await markOperationCompleted(operationId, {
      operationType: 'hamper-deduction',
      webhookId: 'w1',
      orderId: 1,
      orderName: '#1001',
      lineItemId: '1',
      outcome: 'completed',
      detail: '6 jar(s) of Bee S3',
    })

    expect(await isOperationCompleted(operationId)).toBe(true)
  })
})

describe('isAlreadyExistsConflict', () => {
  it('recognises a Sanity "document already exists" style error', async () => {
    const { isAlreadyExistsConflict } = await import('./webhook-operations')
    const error = Object.assign(new Error('Document with the id "x" already exists'), { statusCode: 409 })
    expect(isAlreadyExistsConflict(error)).toBe(true)
  })

  it('does not mistake a revision conflict for an already-exists conflict', async () => {
    const { isAlreadyExistsConflict } = await import('./webhook-operations')
    const error = Object.assign(new Error('The document has been changed by another client'), {
      statusCode: 409,
    })
    expect(isAlreadyExistsConflict(error)).toBe(false)
  })

  it('does not mistake a genuine network error for a conflict', async () => {
    const { isAlreadyExistsConflict } = await import('./webhook-operations')
    expect(isAlreadyExistsConflict(new Error('socket hang up'))).toBe(false)
  })
})
