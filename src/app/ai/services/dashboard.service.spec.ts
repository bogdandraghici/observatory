import { DashboardService } from './dashboard.service'

describe('DashboardService', () => {
  let service: DashboardService

  beforeEach(() => {
    service = new DashboardService()
    spyOn(localStorage, 'getItem').and.returnValue('test-token')
  })

  describe('API calls', () => {
    it('should call getUsageRuns with correct params', async () => {
      const mockData = { success: 10, errors: 2 }
      spyOn(window, 'fetch').and.resolveTo(new Response(JSON.stringify(mockData)))

      const result = await service.getUsageRuns('app-1', 24)

      const [url, options] = (window.fetch as jasmine.Spy).calls.first().args
      expect(url).toContain('/api/analytics/usage/runs')
      expect(options.method).toBe('POST')
      const body = JSON.parse(options.body)
      expect(body.projectId).toBe('app-1')
      expect(body.hours).toBe(24)
      expect(result).toEqual(mockData)
    })

    it('should call getTimeSeriesAll with time range', async () => {
      spyOn(window, 'fetch').and.resolveTo(new Response('[]'))

      await service.getTimeSeriesAll('app-1', 24)

      const [url, options] = (window.fetch as jasmine.Spy).calls.first().args
      expect(url).toContain('/api/analytics/timeseries/tokens/all')
      const body = JSON.parse(options.body)
      expect(body.projectId).toBe('app-1')
      expect(body.minutes).toBeDefined()
      expect(body.start).toBeDefined()
      expect(body.end).toBeDefined()
    })

    it('should call getModelPerformance', async () => {
      spyOn(window, 'fetch').and.resolveTo(new Response('[]'))

      await service.getModelPerformance('app-1', 24)

      const [url] = (window.fetch as jasmine.Spy).calls.first().args
      expect(url).toContain('/api/analytics/usage/models')
    })

    it('should call getRegulatoryDrift with correct URL and body', async () => {
      const mockData = {
        total_drift_runs: 5,
        latest_drifted: 2,
        latest_examined: 10,
        latest_worsened: 1,
        latest_improved: 1,
        verdict_drift_count: 2,
        citation_drift_count: 1,
        no_drift_count: 12,
        trend: [],
      }
      spyOn(window, 'fetch').and.resolveTo(new Response(JSON.stringify(mockData)))

      const result = await service.getRegulatoryDrift('app-9', 24 * 7)

      const [url, options] = (window.fetch as jasmine.Spy).calls.first().args
      expect(url).toContain('/api/analytics/regulatory-drift')
      expect(options.method).toBe('POST')
      const body = JSON.parse(options.body)
      expect(body.projectId).toBe('app-9')
      expect(body.hours).toBe(24 * 7)
      expect(options.headers.Authorization).toBe('Bearer test-token')
      expect(result).toEqual(mockData)
    })

    it('should call getRegulatoryVerdicts with correct URL and body', async () => {
      const mockData = {
        total_count: 3,
        by_severity: [
          { severity: 'caution', count: 2 },
          { severity: 'compliant', count: 1 },
        ],
        by_framework: [{ framework: 'EU AI Act', count: 3 }],
        trend: [],
        top_cited_articles: [{ article_number: 14, count: 2 }],
        llm_assisted_count: 1,
      }
      spyOn(window, 'fetch').and.resolveTo(new Response(JSON.stringify(mockData)))

      const result = await service.getRegulatoryVerdicts('app-7', 24 * 7)

      const [url, options] = (window.fetch as jasmine.Spy).calls.first().args
      expect(url).toContain('/api/analytics/regulatory-verdicts')
      expect(options.method).toBe('POST')
      const body = JSON.parse(options.body)
      expect(body.projectId).toBe('app-7')
      expect(body.hours).toBe(24 * 7)
      expect(options.headers.Authorization).toBe('Bearer test-token')
      expect(result).toEqual(mockData)
    })

    it('should include auth headers in all requests', async () => {
      spyOn(window, 'fetch').and.resolveTo(new Response('{}'))

      await service.getUsageRuns('app-1', 24)

      const [, options] = (window.fetch as jasmine.Spy).calls.first().args
      expect(options.headers.Authorization).toBe('Bearer test-token')
      expect(options.headers['Content-Type']).toBe('application/json')
    })
  })

  describe('calculateBasedOnDays', () => {
    it('should return 60 for 1 day', () => {
      expect(service.calculateBasedOnDays(1)).toBe(60)
    })

    it('should return 240 for 7 days', () => {
      expect(service.calculateBasedOnDays(7)).toBe(240)
    })

    it('should return 720 for 30 days', () => {
      expect(service.calculateBasedOnDays(30)).toBe(720)
    })

    it('should return 1440 for 90 days', () => {
      expect(service.calculateBasedOnDays(90)).toBe(1440)
    })

    it('should default to 60 for unknown days', () => {
      expect(service.calculateBasedOnDays(42)).toBe(60)
    })
  })

  describe('calculateBasedOnHours', () => {
    it('should return 15 for 1 hour', () => {
      expect(service.calculateBasedOnHours(1)).toBe(15)
    })

    it('should return 15 for 3 hours', () => {
      expect(service.calculateBasedOnHours(3)).toBe(15)
    })

    it('should return 60 for 24 hours', () => {
      expect(service.calculateBasedOnHours(24)).toBe(60)
    })

    it('should return 360 for 168 hours (7 days)', () => {
      expect(service.calculateBasedOnHours(168)).toBe(360)
    })

    it('should return 1440 for 720 hours (30 days)', () => {
      expect(service.calculateBasedOnHours(720)).toBe(1440)
    })

    it('should return 8640 for 4320 hours (180 days)', () => {
      expect(service.calculateBasedOnHours(4320)).toBe(8640)
    })

    it('should default to 60 for unknown hours', () => {
      expect(service.calculateBasedOnHours(999)).toBe(60)
    })
  })

  describe('getStartBasedonHours', () => {
    it('should return a moment object for each hour value', () => {
      for (const h of [1, 3, 24, 168, 720, 4320]) {
        const result = service.getStartBasedonHours(h)
        expect(result).toBeDefined()
        expect(result.isValid()).toBe(true)
      }
    })

    it('should return earlier time for larger hour values', () => {
      const start1 = service.getStartBasedonHours(1)
      const start24 = service.getStartBasedonHours(24)
      expect(start24.isBefore(start1)).toBe(true)
    })
  })

  describe('getEndBasedonDays', () => {
    it('should return current moment for all values', () => {
      for (const d of [1, 7, 30, 90]) {
        const result = service.getEndBasedonDays(d)
        expect(result).toBeDefined()
        expect(result.isValid()).toBe(true)
      }
    })
  })

  describe('handleError', () => {
    it('should throw Network error on fetch failure', async () => {
      spyOn(window, 'fetch').and.rejectWith(new TypeError('Failed to fetch'))

      await expectAsync(service.getUsageRuns('app-1', 24))
        .toBeRejectedWithError('Network error occurred')
    })

    it('should throw Unknown error for generic errors', async () => {
      spyOn(window, 'fetch').and.rejectWith(new Error('something'))

      await expectAsync(service.getUsageRuns('app-1', 24))
        .toBeRejectedWithError('Unknown error occurred')
    })
  })
})
