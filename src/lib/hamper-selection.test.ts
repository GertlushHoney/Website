import { describe, expect, it } from 'vitest'
import { parseHoneySelection } from './hamper'
import { validateHamperSelection } from './hamper-selection'

describe('validateHamperSelection', () => {
  it('accepts a selection that adds up to exactly the hamper size', () => {
    expect(validateHamperSelection([{ honeyName: 'Bee S3', jars: 3 }], 3)).toEqual({
      ok: true,
      tally: [{ honeyName: 'Bee S3', jars: 3 }],
    })
    expect(
      validateHamperSelection(
        [
          { honeyName: 'Bee S3', jars: 2 },
          { honeyName: 'Bee S4', jars: 1 },
        ],
        3
      )
    ).toMatchObject({ ok: true })
  })

  it('rejects a crafted "1x Bee S3" against a 3-jar hamper — it would deduct one jar for three', () => {
    const result = validateHamperSelection(parseHoneySelection('1x Bee S3'), 3)
    expect(result.ok).toBe(false)
    expect(result).toMatchObject({ reason: expect.stringContaining('1 jar(s) were selected') })
  })

  it('rejects a selection with too many jars as well as too few', () => {
    expect(validateHamperSelection([{ honeyName: 'Bee S3', jars: 4 }], 3).ok).toBe(false)
    expect(validateHamperSelection(parseHoneySelection('2x Bee S3, 2x Bee S4'), 3).ok).toBe(false)
  })

  it('rejects text that does not parse into a selection at all (e.g. "Bee S3 x1")', () => {
    expect(parseHoneySelection('Bee S3 x1')).toEqual([])
    expect(validateHamperSelection(parseHoneySelection('Bee S3 x1'), 3)).toEqual({
      ok: false,
      reason: 'no honey could be matched to this hamper',
    })
  })

  it('rejects a zero count even when the others make up the total', () => {
    const result = validateHamperSelection(parseHoneySelection('0x Bee S3, 3x Bee S4'), 3)
    expect(result.ok).toBe(false)
  })

  it.each([
    ['negative', -1],
    ['fractional', 1.5],
    ['NaN', Number.NaN],
    ['infinite', Number.POSITIVE_INFINITY],
    ['unsafely large', 1e21],
  ])('rejects a %s count', (_label, jars) => {
    expect(validateHamperSelection([{ honeyName: 'Bee S3', jars }], 3).ok).toBe(false)
    expect(
      validateHamperSelection(
        [
          { honeyName: 'Bee S3', jars },
          { honeyName: 'Bee S4', jars: 3 },
        ],
        3
      ).ok
    ).toBe(false)
  })

  it('merges a honey named twice into one deduction rather than two operations sharing an id', () => {
    const result = validateHamperSelection(parseHoneySelection('1x Bee S3, 2x Bee S3'), 3)
    expect(result).toEqual({ ok: true, tally: [{ honeyName: 'Bee S3', jars: 3 }] })
  })

  it('rejects an empty tally and an invalid hamper size', () => {
    expect(validateHamperSelection([], 3).ok).toBe(false)
    expect(validateHamperSelection([{ honeyName: 'Bee S3', jars: 3 }], 0).ok).toBe(false)
    expect(validateHamperSelection([{ honeyName: 'Bee S3', jars: 3 }], 2.5).ok).toBe(false)
  })

  it('rejects a blank honey name', () => {
    expect(validateHamperSelection([{ honeyName: '  ', jars: 3 }], 3).ok).toBe(false)
  })
})
