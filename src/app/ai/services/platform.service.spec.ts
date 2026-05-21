import { PlatformService } from './platform.service'

describe('PlatformService', () => {
  let service: PlatformService

  beforeEach(() => {
    service = new PlatformService()
    spyOn(localStorage, 'getItem').and.returnValue('test-token')
  })

  function mockFetch(data: any, status = 'success') {
    return spyOn(window, 'fetch').and.resolveTo(
      new Response(JSON.stringify({ status, data, error: null }))
    )
  }

  describe('getHealth', () => {
    it('should call /api/v1/health', async () => {
      const healthData = { status: 'healthy', k8s_connected: true }
      mockFetch(healthData)

      const result = await service.getHealth()

      const [url] = (window.fetch as jasmine.Spy).calls.first().args
      expect(url).toContain('/api/v1/health')
      expect(result).toEqual(healthData)
    })
  })

  describe('getClusterSummary', () => {
    it('should call /api/v1/cluster/summary', async () => {
      mockFetch({ pods_total: 10 })

      const result = await service.getClusterSummary()

      const [url] = (window.fetch as jasmine.Spy).calls.first().args
      expect(url).toContain('/api/v1/cluster/summary')
      expect(result.pods_total).toBe(10)
    })
  })

  describe('getPods', () => {
    it('should call with namespace', async () => {
      mockFetch([])

      await service.getPods('default')

      const [url] = (window.fetch as jasmine.Spy).calls.first().args
      expect(url).toContain('/api/v1/namespaces/default/pods')
    })

    it('should add status query param when provided', async () => {
      mockFetch([])

      await service.getPods('default', 'Running')

      const [url] = (window.fetch as jasmine.Spy).calls.first().args
      expect(url).toContain('?status=Running')
    })
  })

  describe('getNodes', () => {
    it('should call /api/v1/nodes', async () => {
      mockFetch([])

      await service.getNodes()

      const [url] = (window.fetch as jasmine.Spy).calls.first().args
      expect(url).toContain('/api/v1/nodes')
    })
  })

  describe('getDeployments', () => {
    it('should call /api/v1/deployments/{namespace}', async () => {
      mockFetch([])

      await service.getDeployments('production')

      const [url] = (window.fetch as jasmine.Spy).calls.first().args
      expect(url).toContain('/api/v1/deployments/production')
    })
  })

  describe('getEvents', () => {
    it('should build query params', async () => {
      mockFetch([])

      await service.getEvents('default', 'Warning', 50)

      const [url] = (window.fetch as jasmine.Spy).calls.first().args
      expect(url).toContain('namespace=default')
      expect(url).toContain('type=Warning')
      expect(url).toContain('limit=50')
    })

    it('should omit optional params', async () => {
      mockFetch([])

      await service.getEvents()

      const [url] = (window.fetch as jasmine.Spy).calls.first().args
      expect(url).not.toContain('namespace=')
      expect(url).not.toContain('type=')
      expect(url).toContain('limit=100')
    })
  })

  describe('getPodLogs', () => {
    it('should call correct path with params', async () => {
      mockFetch({ logs: ['line1'] })

      await service.getPodLogs('default', 'my-pod', 'nginx', 200, 3600)

      const [url] = (window.fetch as jasmine.Spy).calls.first().args
      expect(url).toContain('/api/v1/pods/default/my-pod/logs')
      expect(url).toContain('container=nginx')
      expect(url).toContain('tail_lines=200')
      expect(url).toContain('since_seconds=3600')
    })
  })

  describe('error handling', () => {
    it('should throw on API error response', async () => {
      spyOn(window, 'fetch').and.resolveTo(
        new Response(JSON.stringify({ status: 'error', error: 'K8s disconnected', data: null }))
      )

      await expectAsync(service.getHealth()).toBeRejectedWithError('K8s disconnected')
    })

    it('should throw on fetch failure', async () => {
      spyOn(window, 'fetch').and.rejectWith(new TypeError('Failed to fetch'))

      await expectAsync(service.getHealth())
        .toBeRejectedWithError('Network error — is observatory-platform running?')
    })
  })

  describe('auth headers', () => {
    it('should include Bearer token', async () => {
      mockFetch({})

      await service.getHealth()

      const [, options] = (window.fetch as jasmine.Spy).calls.first().args
      expect(options.headers.Authorization).toBe('Bearer test-token')
      expect(options.headers['Content-Type']).toBe('application/json')
    })
  })
})
