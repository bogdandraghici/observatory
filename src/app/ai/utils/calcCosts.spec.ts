import { calcRunCost, extendWithCosts, calculateTotal, calculateAverage, calculateTrend, calculateQuartiles } from './calcCosts'

describe('calcCosts', () => {

  describe('calcRunCost', () => {
    const baseRun = (name: string, promptTokens: number, completionTokens: number) => ({
      name,
      type: 'llm',
      created_at: '2024-01-01T00:00:00Z',
      ended_at: '2024-01-01T00:00:01Z',
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
    })

    it('should calculate cost for gpt-3.5-turbo', () => {
      const run = baseRun('gpt-3.5-turbo', 1000, 1000)
      // input: 0.001 * 1000 / 1000 = 0.001, output: 0.002 * 1000 / 1000 = 0.002
      expect(calcRunCost(run)).toBeCloseTo(0.003, 6)
    })

    it('should calculate cost for gpt-4', () => {
      const run = baseRun('gpt-4', 1000, 500)
      // input: 0.03 * 1000 / 1000 = 0.03, output: 0.06 * 500 / 1000 = 0.03
      expect(calcRunCost(run)).toBeCloseTo(0.06, 6)
    })

    it('should handle Azure gpt-35 naming', () => {
      const run = baseRun('gpt-35-turbo', 1000, 1000)
      // replaceAll("gpt-35", "gpt-3.5") => matches gpt-3.5-turbo
      expect(calcRunCost(run)).toBeCloseTo(0.003, 6)
    })

    it('should return 0 for non-llm type', () => {
      const run = { ...baseRun('gpt-4', 1000, 500), type: 'chain' }
      expect(calcRunCost(run)).toBe(0)
    })

    it('should return 0 for unknown model', () => {
      const run = baseRun('llama-3-70b', 1000, 500)
      expect(calcRunCost(run)).toBe(0)
    })

    it('should return 0 for very short duration', () => {
      const run = {
        ...baseRun('gpt-4', 1000, 500),
        created_at: '2024-01-01T00:00:00.000Z',
        ended_at: '2024-01-01T00:00:00.005Z', // 5ms < 10ms threshold
      }
      expect(calcRunCost(run)).toBe(0)
    })

    it('should return 0 when name is null', () => {
      const run = { ...baseRun('gpt-4', 1000, 500), name: null }
      expect(calcRunCost(run)).toBe(0)
    })

    it('should handle promptTokens alias', () => {
      const run = {
        name: 'gpt-4',
        type: 'llm',
        created_at: '2024-01-01T00:00:00Z',
        ended_at: '2024-01-01T00:00:01Z',
        promptTokens: 1000,
        completionTokens: 500,
      }
      expect(calcRunCost(run)).toBeCloseTo(0.06, 6)
    })

    it('should return 0 cost with zero tokens', () => {
      const run = baseRun('gpt-4', 0, 0)
      expect(calcRunCost(run)).toBe(0)
    })

    it('should calculate cost for claude-2', () => {
      const run = baseRun('claude-2', 1000, 1000)
      // input: 0.01102 * 1000 / 1000 = 0.01102, output: 0.03268 * 1000 / 1000 = 0.03268
      expect(calcRunCost(run)).toBeCloseTo(0.0437, 4)
    })
  })

  describe('extendWithCosts', () => {
    it('should add tokens and runs fields', () => {
      const data = [
        { completion_tokens: 100, prompt_tokens: 200, success: 5, errors: 1, cost: 0.01 },
      ]
      const result = extendWithCosts(data)
      expect(result[0].tokens).toBe(300)
      expect(result[0].runs).toBe(6)
      expect(result[0].cost).toBe(0.01)
    })

    it('should default cost to 0', () => {
      const data = [
        { completion_tokens: 100, prompt_tokens: 200, success: 5, errors: 0 },
      ]
      const result = extendWithCosts(data)
      expect(result[0].cost).toBe(0)
    })

    it('should handle null/undefined data', () => {
      expect(extendWithCosts(null as any)).toBeUndefined()
      expect(extendWithCosts(undefined as any)).toBeUndefined()
    })
  })

  describe('calculateTotal', () => {
    it('should sum values by key', () => {
      const data = [{ val: 10 }, { val: 20 }, { val: 30 }]
      expect(calculateTotal(data, 'val')).toBe(60)
    })

    it('should treat missing keys as 0', () => {
      const data = [{ val: 10 }, { other: 20 }]
      expect(calculateTotal(data, 'val')).toBe(10)
    })
  })

  describe('calculateAverage', () => {
    it('should compute rounded average', () => {
      const data = [{ val: 10 }, { val: 20 }, { val: 33 }]
      expect(calculateAverage(data, 'val')).toBe(21) // 63/3 = 21
    })

    it('should round to nearest integer', () => {
      const data = [{ val: 1 }, { val: 2 }]
      expect(calculateAverage(data, 'val')).toBe(2) // 1.5 rounds to 2
    })
  })

  describe('calculateTrend', () => {
    it('should return positive slope for increasing data', () => {
      const data = [{ val: 1 }, { val: 2 }, { val: 3 }, { val: 4 }]
      expect(calculateTrend(data, 'val')).toBe(1)
    })

    it('should return negative slope for decreasing data', () => {
      const data = [{ val: 4 }, { val: 3 }, { val: 2 }, { val: 1 }]
      expect(calculateTrend(data, 'val')).toBe(-1)
    })

    it('should return 0 for flat data', () => {
      const data = [{ val: 5 }, { val: 5 }, { val: 5 }]
      expect(calculateTrend(data, 'val')).toBe(0)
    })
  })

  describe('calculateQuartiles', () => {
    it('should return zeros for empty array', () => {
      expect(calculateQuartiles([], 'val')).toEqual({ lq: 0, median: 0, uq: 0 })
    })

    it('should return zeros for null', () => {
      expect(calculateQuartiles(null as any, 'val')).toEqual({ lq: 0, median: 0, uq: 0 })
    })

    it('should calculate quartiles for odd-length array', () => {
      const data = [{ v: 1 }, { v: 2 }, { v: 3 }, { v: 4 }, { v: 5 }]
      const result = calculateQuartiles(data, 'v')
      expect(result.median).toBe(3)
      expect(result.lq).toBe(1.5)
      expect(result.uq).toBe(4.5)
    })

    it('should calculate quartiles for even-length array', () => {
      const data = [{ v: 1 }, { v: 2 }, { v: 3 }, { v: 4 }]
      const result = calculateQuartiles(data, 'v')
      expect(result.median).toBe(2.5)
      expect(result.lq).toBe(1.5)
      expect(result.uq).toBe(3.5)
    })

    it('should sort data before computing', () => {
      const data = [{ v: 5 }, { v: 1 }, { v: 3 }]
      const result = calculateQuartiles(data, 'v')
      expect(result.median).toBe(3)
    })

    it('should handle single element', () => {
      const data = [{ v: 42 }]
      const result = calculateQuartiles(data, 'v')
      expect(result.median).toBe(42)
    })
  })
})
