import { Injectable } from '@angular/core'
import { environment } from 'src/environments/environment'

const API_URL = environment.platformUrl

@Injectable({ providedIn: 'root' })
export class PlatformService {
  private getHeaders(): any {
    const token = localStorage.getItem('access_token')
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }

  private async request(path: string, options: RequestInit = {}): Promise<any> {
    try {
      const response: Response = await fetch(`${API_URL}${path}`, {
        headers: this.getHeaders(),
        ...options,
      })
      const json = await response.json()
      if (json.status === 'error') {
        throw new Error(json.error || 'Unknown error')
      }
      return json.data
    } catch (error) {
      this.handleError(error)
    }
  }

  // Health
  async getHealth(): Promise<any> {
    return this.request('/api/v1/health')
  }

  // Cluster
  async getClusterSummary(): Promise<any> {
    return this.request('/api/v1/cluster/summary')
  }

  // Namespaces
  async getNamespaces(): Promise<any> {
    return this.request('/api/v1/namespaces')
  }

  // Pods
  async getPods(namespace: string, status?: string): Promise<any> {
    let url = `/api/v1/namespaces/${namespace}/pods`
    if (status) {
      url += `?status=${status}`
    }
    return this.request(url)
  }

  // Nodes
  async getNodes(): Promise<any> {
    return this.request('/api/v1/nodes')
  }

  // Deployments
  async getDeployments(namespace: string): Promise<any> {
    return this.request(`/api/v1/deployments/${namespace}`)
  }

  // Events
  async getEvents(namespace?: string, type?: string, limit: number = 100): Promise<any> {
    const params = new URLSearchParams()
    if (namespace) {params.set('namespace', namespace)}
    if (type) {params.set('type', type)}
    params.set('limit', limit.toString())
    return this.request(`/api/v1/events?${params.toString()}`)
  }

  // Logs
  async getPodLogs(namespace: string, pod: string, container?: string, tailLines: number = 100, sinceSeconds?: number): Promise<any> {
    const params = new URLSearchParams()
    if (container) {params.set('container', container)}
    params.set('tail_lines', tailLines.toString())
    if (sinceSeconds) {params.set('since_seconds', sinceSeconds.toString())}
    return this.request(`/api/v1/pods/${namespace}/${pod}/logs?${params.toString()}`)
  }

  private handleError(error: any): void {
    console.error('PlatformService error:', error)
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request was aborted')
    } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error — is observatory-platform running?')
    }
    throw error
  }
}
