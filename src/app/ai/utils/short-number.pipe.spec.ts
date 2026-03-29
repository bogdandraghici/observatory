import { ShortNumberPipe } from './short-number.pipe'

describe('ShortNumberPipe', () => {
  let pipe: ShortNumberPipe

  beforeEach(() => {
    pipe = new ShortNumberPipe()
  })

  it('should return 0 for NaN', () => {
    expect(pipe.transform(NaN)).toBe(0)
  })

  it('should return 0 for null', () => {
    expect(pipe.transform(null as any)).toBe(0)
  })

  it('should return 0 for 0', () => {
    expect(pipe.transform(0)).toBe(0)
  })

  it('should return small numbers unchanged', () => {
    expect(pipe.transform(500)).toBe('500')
    expect(pipe.transform(99)).toBe('99')
  })

  it('should abbreviate thousands with K', () => {
    expect(pipe.transform(1000)).toBe('1K')
    expect(pipe.transform(1500)).toBe('1.5K')
    expect(pipe.transform(45000)).toBe('45K')
  })

  it('should abbreviate millions with M', () => {
    expect(pipe.transform(1000000)).toBe('1M')
    expect(pipe.transform(2500000)).toBe('2.5M')
  })

  it('should abbreviate billions with B', () => {
    expect(pipe.transform(1000000000)).toBe('1B')
  })

  it('should abbreviate trillions with T', () => {
    expect(pipe.transform(1000000000000)).toBe('1T')
  })

  it('should abbreviate quadrillions with Q', () => {
    expect(pipe.transform(1000000000000000)).toBe('1Q')
  })

  it('should handle negative numbers', () => {
    expect(pipe.transform(-1500)).toBe('-1.5K')
    expect(pipe.transform(-1000000)).toBe('-1M')
  })

  it('should round to one decimal', () => {
    expect(pipe.transform(1234)).toBe('1.2K')
    expect(pipe.transform(1250)).toBe('1.3K') // rounded
  })
})
