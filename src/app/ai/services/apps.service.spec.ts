import { AppService } from './apps.service'

describe('AppService', () => {
  let service: AppService

  beforeEach(() => {
    service = new AppService()
    spyOn(localStorage, 'getItem').and.returnValue('test-token')
  })

  afterEach(() => {
    (window.fetch as jasmine.Spy)?.and?.callThrough?.()
  })

  describe('createApp', () => {
    it('should POST to /api/project with correct body', async () => {
      const mockResponse = { id: '123', name: 'My App' }
      spyOn(window, 'fetch').and.resolveTo(new Response(JSON.stringify(mockResponse)))

      const result = await service.createApp('My App', 'org-1')

      expect(window.fetch).toHaveBeenCalledTimes(1)
      const [url, options] = (window.fetch as jasmine.Spy).calls.first().args
      expect(url).toContain('/api/project')
      expect(options.method).toBe('POST')
      const body = JSON.parse(options.body)
      expect(body.name).toBe('My App')
      expect(body.org_id).toBe('org-1')
      expect(body.is_default).toBe(false)
      expect(result).toEqual(mockResponse)
    })

    it('should include Bearer token in headers', async () => {
      spyOn(window, 'fetch').and.resolveTo(new Response('{}'))

      await service.createApp('App', 'org-1')

      const [, options] = (window.fetch as jasmine.Spy).calls.first().args
      expect(options.headers.Authorization).toBe('Bearer test-token')
    })
  })

  describe('updateApp', () => {
    it('should PUT to /api/project/{id}', async () => {
      spyOn(window, 'fetch').and.resolveTo(new Response('{}'))

      await service.updateApp({
        id: 'app-1',
        name: 'Updated',
        is_default: true,
        owner: 'owner',
        settings: {},
      })

      const [url, options] = (window.fetch as jasmine.Spy).calls.first().args
      expect(url).toContain('/api/project/app-1')
      expect(options.method).toBe('PUT')
      const body = JSON.parse(options.body)
      expect(body.name).toBe('Updated')
    })
  })

  describe('archiveApp', () => {
    it('should PUT to /api/project/archive/{id}', async () => {
      spyOn(window, 'fetch').and.resolveTo(new Response('{}'))

      await service.archiveApp('app-1')

      const [url, options] = (window.fetch as jasmine.Spy).calls.first().args
      expect(url).toContain('/api/project/archive/app-1')
      expect(options.method).toBe('PUT')
    })
  })

  describe('getAppsByOrg', () => {
    it('should GET /api/project/by_org/{orgId}', async () => {
      const mockApps = [{ id: '1', name: 'App 1' }]
      spyOn(window, 'fetch').and.resolveTo(new Response(JSON.stringify(mockApps)))

      const result = await service.getAppsByOrg('org-1')

      const [url, options] = (window.fetch as jasmine.Spy).calls.first().args
      expect(url).toContain('/api/project/by_org/org-1')
      expect(options.method).toBe('GET')
      expect(result).toEqual(mockApps)
    })
  })

  describe('handleError', () => {
    it('should throw Network error on fetch failure', async () => {
      spyOn(window, 'fetch').and.rejectWith(new TypeError('Failed to fetch'))

      await expectAsync(service.createApp('App', 'org-1'))
        .toBeRejectedWithError('Network error occurred')
    })

    it('should throw Request was aborted on AbortError', async () => {
      spyOn(window, 'fetch').and.rejectWith(new DOMException('aborted', 'AbortError'))

      await expectAsync(service.createApp('App', 'org-1'))
        .toBeRejectedWithError('Request was aborted')
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

    it('should default to 60 for unknown values', () => {
      expect(service.calculateBasedOnDays(999)).toBe(60)
    })
  })
})
