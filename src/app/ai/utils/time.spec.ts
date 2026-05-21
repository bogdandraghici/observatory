import { getDuration, getDurationLLM, formatTime, processDuration } from './time'

describe('time utils', () => {

  describe('getDuration', () => {
    it('should calculate seconds between created_at and ended_at', () => {
      const call = {
        created_at: '2024-01-01T12:00:00Z',
        ended_at: '2024-01-01T12:00:03Z',
      }
      expect(getDuration(call)).toBe('3.00')
    })

    it('should handle sub-second durations', () => {
      const call = {
        created_at: '2024-01-01T12:00:00.000Z',
        ended_at: '2024-01-01T12:00:00.500Z',
      }
      expect(getDuration(call)).toBe('0.50')
    })

    it('should return 2 decimal places', () => {
      const call = {
        created_at: '2024-01-01T12:00:00Z',
        ended_at: '2024-01-01T12:00:01Z',
      }
      expect(getDuration(call)).toBe('1.00')
    })
  })

  describe('getDurationLLM', () => {
    it('should use time and ended fields', () => {
      const call = {
        time: '2024-01-01T12:00:00Z',
        ended: '2024-01-01T12:00:05Z',
      }
      expect(getDurationLLM(call)).toBe('5.00')
    })
  })

  describe('formatTime', () => {
    it('should format UTC time to local readable format', () => {
      const result = formatTime('2024-06-15T10:30:00Z')
      // Format is 'DD MMM, HH:mm:ss' in local time
      expect(result).toMatch(/^\d{2} \w{3}, \d{2}:\d{2}:\d{2}$/)
    })
  })

  describe('processDuration', () => {
    it('should process ISO 8601 duration', () => {
      expect(processDuration('PT1M30S')).toBe(90)
    })

    it('should process seconds-only duration', () => {
      expect(processDuration('PT5S')).toBe(5)
    })

    it('should round to 2 decimal places', () => {
      expect(processDuration('PT1.123S')).toBe(1.12)
    })

    it('should handle zero duration', () => {
      expect(processDuration('PT0S')).toBe(0)
    })
  })
})
