import { Injectable } from '@angular/core'
import { environment } from 'src/environments/environment'

const API_URL = environment.baseUrl

@Injectable({ providedIn: 'root' })
export class RsiService {

  // ── Dashboard ──────────────────────────────────────────────────────

  async getOverview(agentName?: string, days: number = 30): Promise<any> {
    const params = new URLSearchParams()
    if (agentName) { params.set('agent_name', agentName) }
    params.set('days', days.toString())
    return this.get(`/api/v1/rsi/dashboard/overview?${params}`)
  }

  async getTimeline(agentName?: string, days: number = 30): Promise<any> {
    const params = new URLSearchParams()
    if (agentName) { params.set('agent_name', agentName) }
    params.set('days', days.toString())
    return this.get(`/api/v1/rsi/dashboard/timeline?${params}`)
  }

  async getEnrolledWorkflows(agentName?: string, orgId?: string, projectId?: string): Promise<any> {
    const params = new URLSearchParams()
    if (agentName) { params.set('agent_name', agentName) }
    if (orgId) { params.set('org_id', orgId) }
    if (projectId) { params.set('project_id', projectId) }
    return this.get(`/api/v1/rsi/dashboard/workflows?${params}`)
  }

  async getImprovementBadge(workflowId: string): Promise<any> {
    return this.get(`/api/v1/rsi/dashboard/improvement-badge/${workflowId}`)
  }

  // ── Cycles ─────────────────────────────────────────────────────────

  async getCycles(workflowId?: string, status?: string, limit: number = 20): Promise<any> {
    const params = new URLSearchParams()
    if (workflowId) { params.set('workflow_id', workflowId) }
    if (status) { params.set('status', status) }
    params.set('limit', limit.toString())
    return this.get(`/api/v1/rsi/cycles?${params}`)
  }

  async getCycleDetail(cycleId: string): Promise<any> {
    return this.get(`/api/v1/rsi/cycles/${cycleId}`)
  }

  async triggerCycle(payload: any): Promise<any> {
    return this.post('/api/v1/rsi/cycles', payload)
  }

  async cancelCycle(cycleId: string): Promise<any> {
    return this.post(`/api/v1/rsi/cycles/${cycleId}/cancel`, {})
  }

  // ── Mutations ──────────────────────────────────────────────────────

  async getMutations(cycleId: string): Promise<any> {
    return this.get(`/api/v1/rsi/cycles/${cycleId}/mutations`)
  }

  async getMutationDetail(mutationId: string): Promise<any> {
    return this.get(`/api/v1/rsi/mutations/${mutationId}`)
  }

  // ── Evaluations ────────────────────────────────────────────────────

  async getEvalMatrix(cycleId: string): Promise<any> {
    return this.get(`/api/v1/rsi/cycles/${cycleId}/evaluations`)
  }

  // ── Promotions ─────────────────────────────────────────────────────

  async getPromotion(cycleId: string): Promise<any> {
    return this.get(`/api/v1/rsi/cycles/${cycleId}/promotion`)
  }

  async promoteCycle(cycleId: string, canary = false, trafficPct = 10): Promise<any> {
    return this.post(`/api/v1/rsi/cycles/${cycleId}/promote`, { canary, traffic_pct: trafficPct })
  }

  async rejectCycle(cycleId: string, reason?: string): Promise<any> {
    return this.post(`/api/v1/rsi/cycles/${cycleId}/reject`, { reason })
  }

  // ── Canaries ──────────────────────────────────────────────────────

  async getCanaries(): Promise<any> {
    return this.get('/api/v1/rsi/canaries')
  }

  async getCanary(canaryId: string): Promise<any> {
    return this.get(`/api/v1/rsi/canaries/${canaryId}`)
  }

  async promoteCanary(canaryId: string): Promise<any> {
    return this.post(`/api/v1/rsi/canaries/${canaryId}/promote`, {})
  }

  async rollbackCanary(canaryId: string): Promise<any> {
    return this.post(`/api/v1/rsi/canaries/${canaryId}/rollback`, {})
  }

  async adjustCanaryTraffic(canaryId: string, trafficPct: number): Promise<any> {
    return this.post(`/api/v1/rsi/canaries/${canaryId}/traffic`, { traffic_pct: trafficPct })
  }

  // ── Versions ───────────────────────────────────────────────────────

  async getVersionHistory(workflowId: string): Promise<any> {
    return this.get(`/api/v1/rsi/versions/${workflowId}`)
  }

  async restoreVersion(workflowId: string, version: number): Promise<any> {
    return this.post(`/api/v1/rsi/versions/${workflowId}/${version}/restore`, {})
  }

  // ── Baselines ──────────────────────────────────────────────────────

  async createBaseline(workflowId: string, datasetId?: string, context?: { org_id?: string, workspace_id?: string, project_id?: string, agent_name?: string }): Promise<any> {
    return this.post('/api/v1/rsi/baselines', {
      workflow_id: workflowId,
      dataset_id: datasetId || null,
      ...context,
    })
  }

  // ── HTTP helpers ───────────────────────────────────────────────────

  private async get(path: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}${path}`
    const headers: any = { 'Content-Type': 'application/json' }
    if (token) { headers['Authorization'] = `Bearer ${token}` }
    try {
      const response: Response = await fetch(url, { method: 'GET', headers })
      if (!response.ok) { throw new Error(`HTTP ${response.status}`) }
      return response.json()
    } catch (error) {
      console.error('RSI API error:', error)
      throw error
    }
  }

  private async post(path: string, body: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}${path}`
    const headers: any = { 'Content-Type': 'application/json' }
    if (token) { headers['Authorization'] = `Bearer ${token}` }
    try {
      const response: Response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      if (!response.ok) { throw new Error(`HTTP ${response.status}`) }
      return response.json()
    } catch (error) {
      console.error('RSI API error:', error)
      throw error
    }
  }
}
