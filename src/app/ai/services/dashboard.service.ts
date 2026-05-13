import { Injectable } from '@angular/core'

import moment from 'moment'
import { environment } from 'src/environments/environment'

const API_URL = environment.baseUrl

@Injectable({ providedIn: 'root' })
export class DashboardService {
  async getUsageRuns(app_id: any, hours: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/analytics/usage/runs`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      projectId: app_id,
      hours,
      userId: null,
    }

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getTimeSeriesAll(app_id: any, hours: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/analytics/timeseries/tokens/all`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }

    const body = {
      projectId: app_id,
      minutes: this.calculateBasedOnHours(hours),
      start: this.getStartBasedonHours(hours)
        .utc()
        .format('YYYY-MM-DD HH:mm:ss'),
      end: this.getEndBasedonHours(hours).utc().format('YYYY-MM-DD HH:mm:ss'),
    }

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getUsageRunAgents(app_id: any, hours: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/analytics/usage/runs/agents`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      projectId: app_id,
      hours,
      userId: null,
    }

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }


  async getModelPerformance(app_id: any, hours: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/analytics/usage/models`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      projectId: app_id,
      hours,
    }

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getRegulatoryDrift(app_id: any, hours: any): Promise<any> {
    // Surfaces drift-detection runs emitted by ai-agents whenever the
    // regulatory ontology is re-imported / changed. Aggregates per-kind
    // and per-day counts so the dashboard widget can show whether the
    // corpus update made verdicts worse or better.
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/analytics/regulatory-drift`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = { projectId: app_id, hours }
    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getRegulatoryVerdicts(app_id: any, hours: any): Promise<any> {
    // Surfaces FlowX Regulatory Twin verdicts emitted by ai-agents.
    // Backend aggregates runs with `type='regulatory_verdict'` over the
    // configured window and returns severity / framework / trend rollup.
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/analytics/regulatory-verdicts`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = { projectId: app_id, hours }
    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getCostAnalytics(app_id: any, hours: any, group_by = 'model'): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/analytics/usage/costs`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      projectId: app_id,
      hours,
      group_by,
    }

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getCorrectnessStats(app_id: any, hours: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/analytics/usage/correctness`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      projectId: app_id,
      hours,
    }

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getUsageFrustration(app_id: any, hours: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/run/usage/frustration`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      projectId: app_id,
      hours,
      userId: null,
    }

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }


  async getUsageDocuments(app_id: any, hours: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/run/usage/documents`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      projectId: app_id,
      hours,
      userId: null,
    }

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getUsageActions(app_id: any, hours: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/run/usage/actions`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      projectId: app_id,
      hours,
      userId: null,
    }

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }



  async getUsageUsers(app_id: any, hours: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/analytics/usage/runs_by_user`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      projectId: app_id,
      hours,
      userId: null
    }

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getLLMsCalls(app_id: any, hours: any, page: any, size: any, query: any, agent: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/run/usage/llms?page=${page}&size=${size}`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      projectId: app_id,
      hours,
      query,
      agent,
    }

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getTracesCalls(app_id: any, hours: any, page: any, size: any, query: any, agent: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/run/usage/traces?page=${page}&size=${size}`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      projectId: app_id,
      hours,
      query,
      agent,
    }

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getDistinctAgents(app_id: any, hours: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/run/usage/agents`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      projectId: app_id,
      hours,
    }

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getExecutions(app_id: any, hours: any, page: any, size: any, agent: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/run/usage/executions?page=${page}&size=${size}`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      projectId: app_id,
      hours,
      agent,
    }

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getDeveloperExecutions(app_id: any, hours: any, page: any, size: any, agent: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/run/usage/executions?page=${page}&size=${size}`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      projectId: app_id,
      hours,
      agent,
      developer: true,
    }

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getDeveloperAgents(app_id: any, hours: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/run/usage/agents`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      projectId: app_id,
      hours,
      developer: true,
    }

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getUsersCalls(app_id: any, hours: any, page: any, size: any, query: any, agent: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/run/usage/users?page=${page}&size=${size}`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      projectId: app_id,
      hours,
      query,
      agent
    }

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getRunsByRequestId(request_id: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/run/by_request/${request_id}`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }

    const options = {
      method: 'GET',
      headers,
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getExecutionTrace(request_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/run/execution/${request_id}`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }

    const options = {
      method: 'GET',
      headers,
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getNodePerformance(app_id: string, hours: number): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/analytics/usage/nodes`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      projectId: app_id,
      hours,
    }

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  // ── Audit Trail ──────────────────────────────────────────

  async getAuditLogs(org_id: string, query: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/audit/query`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = { org_id, ...query }
    const options = { method: 'POST', headers, body: JSON.stringify(body) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getAuditStats(org_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/audit/stats/${org_id}`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  // ── RBAC ────────────────────────────────────────────────

  async getRoles(org_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/rbac/${org_id}/roles`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async createRole(org_id: string, role: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/rbac/${org_id}/roles`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers, body: JSON.stringify(role) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async updateRole(org_id: string, role_id: string, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/rbac/${org_id}/roles/${role_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'PUT', headers, body: JSON.stringify(data) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async deleteRole(org_id: string, role_id: string): Promise<void> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/rbac/${org_id}/roles/${role_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'DELETE', headers }
    try {
      await fetch(url, options)
    } catch (error) {
      this.handleError(error)
    }
  }

  async getMembers(org_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/rbac/${org_id}/members`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async addMember(org_id: string, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/rbac/${org_id}/members`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers, body: JSON.stringify(data) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async updateMember(org_id: string, member_id: string, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/rbac/${org_id}/members/${member_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'PUT', headers, body: JSON.stringify(data) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async removeMember(org_id: string, member_id: string): Promise<void> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/rbac/${org_id}/members/${member_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'DELETE', headers }
    try {
      await fetch(url, options)
    } catch (error) {
      this.handleError(error)
    }
  }

  // ── Webhooks ────────────────────────────────────────────

  async getWebhooks(org_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/webhooks/${org_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async createWebhook(org_id: string, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/webhooks/${org_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers, body: JSON.stringify(data) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async updateWebhook(org_id: string, webhook_id: string, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/webhooks/${org_id}/${webhook_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'PUT', headers, body: JSON.stringify(data) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async deleteWebhook(org_id: string, webhook_id: string): Promise<void> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/webhooks/${org_id}/${webhook_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'DELETE', headers }
    try {
      await fetch(url, options)
    } catch (error) {
      this.handleError(error)
    }
  }

  async testWebhook(org_id: string, webhook_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/webhooks/${org_id}/${webhook_id}/test`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getDeliveries(org_id: string, webhook_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/webhooks/${org_id}/${webhook_id}/deliveries`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  // ── Registry ─────────────────────────────────────────────

  async getVendors(org_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/registry/vendors/${org_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async createVendor(org_id: string, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/registry/vendors/${org_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers, body: JSON.stringify(data) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async updateVendor(org_id: string, vendor_id: string, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/registry/vendors/${org_id}/${vendor_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'PUT', headers, body: JSON.stringify(data) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async deleteVendor(org_id: string, vendor_id: string): Promise<void> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/registry/vendors/${org_id}/${vendor_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'DELETE', headers }
    try {
      await fetch(url, options)
    } catch (error) {
      this.handleError(error)
    }
  }

  async getModelCatalog(org_id: string, params?: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const queryParams = new URLSearchParams()
    if (params?.provider) {queryParams.set('provider', params.provider)}
    if (params?.capability) {queryParams.set('capability', params.capability)}
    if (params?.is_approved !== undefined) {queryParams.set('is_approved', params.is_approved)}
    if (params?.query) {queryParams.set('query', params.query)}
    const qs = queryParams.toString()
    const url = `${API_URL}/api/registry/models/${org_id}${qs ? '?' + qs : ''}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async syncModelCatalog(org_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/registry/models/${org_id}/sync`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async syncModelCatalogFromProviders(org_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/registry/models/${org_id}/sync-providers`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers }
    try {
      const response: Response = await fetch(url, options)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.detail || `Sync failed (${response.status})`)
      }
      return data
    } catch (error) {
      this.handleError(error)
    }
  }

  async updateModelCatalogEntry(org_id: string, entry_id: string, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const queryParams = new URLSearchParams()
    if (data.is_approved !== undefined) {queryParams.set('is_approved', data.is_approved)}
    if (data.is_active !== undefined) {queryParams.set('is_active', data.is_active)}
    const qs = queryParams.toString()
    const url = `${API_URL}/api/registry/models/${org_id}/${entry_id}${qs ? '?' + qs : ''}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'PUT', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getModelsByProvider(org_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/registry/models/${org_id}/by-provider`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getVendorSummary(org_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/registry/vendors/${org_id}/summary`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  // ── Risk ────────────────────────────────────────────────

  async getRiskProfile(app_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/risk/profile/${app_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getRiskHeatmap(org_id: string, hours: number = 720): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/risk/dashboard/heatmap`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const body = { org_id, hours }
    const options = { method: 'POST', headers, body: JSON.stringify(body) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getRiskTrending(org_id: string, project_id?: string, hours: number = 720): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/risk/dashboard/trending`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const body: any = { org_id, hours }
    if (project_id) {body.project_id = project_id}
    const options = { method: 'POST', headers, body: JSON.stringify(body) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getRiskRanking(org_id: string, hours: number = 720): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/risk/dashboard/ranking`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const body = { org_id, hours }
    const options = { method: 'POST', headers, body: JSON.stringify(body) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async computeRisk(app_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/risk/compute/${app_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  // ── Insights ────────────────────────────────────────────

  async getInsightsAgents(project_id?: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const qs = project_id ? `?project_id=${project_id}` : ''
    const url = `${API_URL}/api/insights/agents${qs}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  private _insightsQs(params?: any): string {
    const qp = new URLSearchParams()
    if (params?.hours) {qp.set('hours', params.hours)}
    if (params?.environment) {qp.set('environment', params.environment)}
    if (params?.project_id) {qp.set('project_id', params.project_id)}
    if (params?.granularity) {qp.set('granularity', params.granularity)}
    const qs = qp.toString()
    return qs ? `?${qs}` : ''
  }

  async getInsightsAgentSummary(agent_id: string, params?: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/insights/agents/${agent_id}/dashboard/summary${this._insightsQs(params)}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getInsightsAgentMetrics(agent_id: string, params?: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/insights/agents/${agent_id}/dashboard/metrics${this._insightsQs(params)}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getInsightsAgentTimeseries(agent_id: string, params?: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/insights/agents/${agent_id}/dashboard/timeseries${this._insightsQs(params)}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getInsightsAgentAlerts(agent_id: string, params?: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/insights/agents/${agent_id}/dashboard/alerts${this._insightsQs(params)}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getInsightsAgentCost(agent_id: string, params?: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/insights/agents/${agent_id}/dashboard/cost${this._insightsQs(params)}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getInsightsAgentExecutions(agent_id: string, params?: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/insights/agents/${agent_id}/dashboard/executions${this._insightsQs(params)}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async triggerEvaluation(execution_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/insights/executions/${execution_id}/evaluate`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getInsightsRunDetail(run_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/insights/runs/${run_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getInsightsAgentEvalRuns(agent_id: string, params?: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/insights/agents/${agent_id}/eval-runs${this._insightsQs(params)}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getInsightsAgentOverallScore(agent_id: string, params?: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/insights/agents/${agent_id}/overall-score${this._insightsQs(params)}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  // ── Eval Model Config ────────────────────────────────

  async getEvalModels(): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/insights/config/eval-models`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async updateEvalModels(data: { default?: string; overrides?: Record<string, string | null> }): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/insights/config/eval-models`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'PUT', headers, body: JSON.stringify(data) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async deleteEvalModelOverride(metricName: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/insights/config/eval-models/${metricName}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'DELETE', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getResolvedEvalModels(): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/insights/config/eval-models/resolved`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  // ── Alerts ────────────────────────────────────────────

  async getAlertRules(org_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/alerts/${org_id}/rules`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async createAlertRule(org_id: string, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/alerts/${org_id}/rules`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers, body: JSON.stringify(data) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async updateAlertRule(org_id: string, rule_id: string, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/alerts/${org_id}/rules/${rule_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'PUT', headers, body: JSON.stringify(data) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async deleteAlertRule(org_id: string, rule_id: string): Promise<void> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/alerts/${org_id}/rules/${rule_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'DELETE', headers }
    try {
      await fetch(url, options)
    } catch (error) {
      this.handleError(error)
    }
  }

  async getAlertHistory(query: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/alerts/history`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers, body: JSON.stringify(query) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async evaluateAlerts(org_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/alerts/evaluate`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers, body: JSON.stringify({ org_id }) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async acknowledgeAlert(event_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/alerts/acknowledge/${event_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async resolveAlert(event_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/alerts/resolve/${event_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getSlaStatus(app_id: string, org_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/alerts/sla/${app_id}?org_id=${org_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  // ── Drift ────────────────────────────────────────────

  async computeDrift(app_id: string, params?: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/drift/compute/${app_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const body = params || {}
    const options = { method: 'POST', headers, body: JSON.stringify(body) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getDriftSnapshots(app_id: string, metric?: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const qs = metric ? `?metric=${metric}` : ''
    const url = `${API_URL}/api/drift/snapshots/${app_id}${qs}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getDriftResults(app_id: string, params?: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const queryParams = new URLSearchParams()
    if (params?.metric) {queryParams.set('metric', params.metric)}
    if (params?.hours) {queryParams.set('hours', params.hours)}
    const qs = queryParams.toString()
    const url = `${API_URL}/api/drift/results/${app_id}${qs ? '?' + qs : ''}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getDriftDashboard(org_id: string, hours: number = 720): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/drift/dashboard`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const body = { org_id, hours }
    const options = { method: 'POST', headers, body: JSON.stringify(body) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  // ── Policies ────────────────────────────────────────────

  async getPolicies(org_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/policies/${org_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async createPolicy(org_id: string, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/policies/${org_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers, body: JSON.stringify(data) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async updatePolicy(org_id: string, policy_id: string, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/policies/${org_id}/${policy_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'PUT', headers, body: JSON.stringify(data) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async deletePolicy(org_id: string, policy_id: string): Promise<void> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/policies/${org_id}/${policy_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'DELETE', headers }
    try {
      await fetch(url, options)
    } catch (error) {
      this.handleError(error)
    }
  }

  async getPolicyPacks(org_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/policies/${org_id}/packs`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async createPackFromTemplate(org_id: string, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/policies/${org_id}/packs/from-template`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers, body: JSON.stringify(data) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async createPolicyPack(org_id: string, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/policies/${org_id}/packs`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers, body: JSON.stringify(data) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async updatePolicyPack(org_id: string, pack_id: string, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/policies/${org_id}/packs/${pack_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'PUT', headers, body: JSON.stringify(data) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async deletePolicyPack(org_id: string, pack_id: string): Promise<void> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/policies/${org_id}/packs/${pack_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'DELETE', headers }
    try {
      await fetch(url, options)
    } catch (error) {
      this.handleError(error)
    }
  }

  async getPolicyAssignments(org_id: string, project_id?: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const qs = project_id ? `?project_id=${project_id}` : ''
    const url = `${API_URL}/api/policies/${org_id}/assignments${qs}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async createPolicyAssignment(org_id: string, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/policies/${org_id}/assignments`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers, body: JSON.stringify(data) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async deletePolicyAssignment(org_id: string, id: string): Promise<void> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/policies/${org_id}/assignments/${id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'DELETE', headers }
    try {
      await fetch(url, options)
    } catch (error) {
      this.handleError(error)
    }
  }

  async evaluatePolicies(request: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/policies/evaluate`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers, body: JSON.stringify(request) }
    try {
      const response: Response = await fetch(url, options)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.detail || `Evaluation failed (${response.status})`)
      }
      return data
    } catch (error) {
      this.handleError(error)
    }
  }

  async getPolicyEvaluations(app_id: string, hours: number = 720): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/policies/evaluations/${app_id}?hours=${hours}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getComplianceDashboard(query: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/policies/dashboard/compliance`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers, body: JSON.stringify(query) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  // ── Evidence ────────────────────────────────────────────

  async getEvidence(org_id: string, params?: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const queryParams = new URLSearchParams()
    if (params?.project_id) {queryParams.set('project_id', params.project_id)}
    if (params?.policy_id) {queryParams.set('policy_id', params.policy_id)}
    if (params?.evidence_status) {queryParams.set('evidence_status', params.evidence_status)}
    const qs = queryParams.toString()
    const url = `${API_URL}/api/evidence/${org_id}${qs ? '?' + qs : ''}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async createEvidence(org_id: string, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/evidence/${org_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers, body: JSON.stringify(data) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async updateEvidence(org_id: string, evidence_id: string, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/evidence/${org_id}/${evidence_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'PUT', headers, body: JSON.stringify(data) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async reviewEvidence(org_id: string, evidence_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/evidence/${org_id}/review/${evidence_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async approveEvidence(org_id: string, evidence_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/evidence/${org_id}/approve/${evidence_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async collectEvidence(request: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/evidence/collect`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers, body: JSON.stringify(request) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getEvidenceGaps(query: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/evidence/gaps`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers, body: JSON.stringify(query) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  // ── Assessments ────────────────────────────────────────

  async getAssessmentTemplates(org_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/assessments/${org_id}/templates`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async createAssessmentTemplate(org_id: string, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/assessments/${org_id}/templates`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers, body: JSON.stringify(data) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async updateAssessmentTemplate(org_id: string, id: string, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/assessments/${org_id}/templates/${id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'PUT', headers, body: JSON.stringify(data) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async deleteAssessmentTemplate(org_id: string, id: string): Promise<void> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/assessments/${org_id}/templates/${id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'DELETE', headers }
    try {
      await fetch(url, options)
    } catch (error) {
      this.handleError(error)
    }
  }

  async getAssessments(org_id: string, params?: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const queryParams = new URLSearchParams()
    if (params?.project_id) {queryParams.set('project_id', params.project_id)}
    if (params?.assessment_status) {queryParams.set('assessment_status', params.assessment_status)}
    const qs = queryParams.toString()
    const url = `${API_URL}/api/assessments/${org_id}${qs ? '?' + qs : ''}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async createAssessment(org_id: string, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/assessments/${org_id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers, body: JSON.stringify(data) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async submitAssessment(org_id: string, id: string, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/assessments/${org_id}/${id}/submit`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers, body: JSON.stringify(data) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getAssessment(org_id: string, id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/assessments/${org_id}/${id}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getPredefinedAssessmentTemplates(): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/assessments/predefined-templates`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async createTemplateFromPredefined(org_id: string, framework: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/assessments/${org_id}/templates/from-predefined`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'POST', headers, body: JSON.stringify({ framework }) }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async verifyAssessmentSignature(org_id: string, assessment_id: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/assessments/${org_id}/${assessment_id}/verify-signature`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getInsightsAlerts(): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/insights/alerts`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const options = { method: 'GET', headers }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  // ── Regulatory Compliance ─────────────────────────────

  async getFrameworks(orgId?: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const qs = orgId ? `?org_id=${orgId}` : ''
    const url = `${API_URL}/api/regulatory/frameworks${qs}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    try {
      const response: Response = await fetch(url, { method: 'GET', headers })
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getFramework(frameworkId: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/regulatory/frameworks/${frameworkId}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    try {
      const response: Response = await fetch(url, { method: 'GET', headers })
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async createFramework(orgId: any, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/regulatory/frameworks/${orgId}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    try {
      const response: Response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(data) })
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async updateFramework(orgId: any, frameworkId: any, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/regulatory/frameworks/${orgId}/${frameworkId}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    try {
      const response: Response = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(data) })
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async deleteFramework(orgId: any, frameworkId: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/regulatory/frameworks/${orgId}/${frameworkId}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const response: Response = await fetch(url, { method: 'DELETE', headers })
    return response.ok
  }

  async getFrameworkRequirements(frameworkId: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/regulatory/frameworks/${frameworkId}/requirements`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    try {
      const response: Response = await fetch(url, { method: 'GET', headers })
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async addRequirement(frameworkId: any, orgId: any, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/regulatory/frameworks/${frameworkId}/requirements/${orgId}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    try {
      const response: Response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(data) })
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async updateRequirement(frameworkId: any, orgId: any, requirementId: any, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/regulatory/frameworks/${frameworkId}/requirements/${orgId}/${requirementId}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    try {
      const response: Response = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(data) })
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async deleteRequirement(frameworkId: any, orgId: any, requirementId: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/regulatory/frameworks/${frameworkId}/requirements/${orgId}/${requirementId}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const response: Response = await fetch(url, { method: 'DELETE', headers })
    return response.ok
  }

  async getComplianceMappings(orgId: any, projectId: any, frameworkId?: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const path = frameworkId
      ? `/api/regulatory/compliance/${orgId}/${projectId}/${frameworkId}`
      : `/api/regulatory/compliance/${orgId}/${projectId}`
    const url = `${API_URL}${path}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    try {
      const response: Response = await fetch(url, { method: 'GET', headers })
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async updateComplianceMapping(orgId: any, projectId: any, requirementId: any, data: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/regulatory/compliance/${orgId}/${projectId}/${requirementId}`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    try {
      const response: Response = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(data) })
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async autoMapCompliance(orgId: any, projectId: any, frameworkId: any, hours = 720): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/regulatory/compliance/${orgId}/${projectId}/${frameworkId}/auto-map`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    try {
      const response: Response = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ hours }) })
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getComplianceReport(orgId: any, projectId: any, frameworkId: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/regulatory/compliance/${orgId}/${projectId}/${frameworkId}/report`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    try {
      const response: Response = await fetch(url, { method: 'GET', headers })
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getComplianceOverview(orgId: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/regulatory/compliance/${orgId}/overview`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    try {
      const response: Response = await fetch(url, { method: 'GET', headers })
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async seedFrameworks(): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/regulatory/seed`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    try {
      const response: Response = await fetch(url, { method: 'POST', headers })
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * Handles any errors that occur during the chat completion request process.
   *
   * u/param {any} error - The error object to handle.
   */
  private handleError(error: any): void {
    console.error(error)
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request was aborted')
    } else if (
      error instanceof TypeError &&
      error.message === 'Failed to fetch'
    ) {
      throw new Error('Network error occurred')
    } else if (
      error instanceof TypeError &&
      error.message === 'Failed to decode'
    ) {
      throw new Error('Error decoding response from server')
    } else if (
      error instanceof TypeError &&
      error.message ===
        'JSON.parse: unexpected end of data at line 1 column 1 of the JSON data'
    ) {
      throw new Error('Invalid JSON response from server')
    } else if (
      error instanceof TypeError &&
      error.message ===
        'response.body?.pipeThrough(...).getReader is not a function'
    ) {
      throw new Error('Invalid response from server')
    } else {
      throw new Error('Unknown error occurred')
    }
  }

  /*

  UTILS

  */

  calculateBasedOnDays(days: any): any {
    switch (days) {
      case 1:
        return 60
      case 7:
        return 60 * 4
      case 30:
        return 60 * 12
      case 90:
        return 60 * 24
      default:
        return 60
    }
  }

  calculateBasedOnHours(hours: any): any {
    switch (hours) {
      case 1:
        return 15
      case 3:
        return 15
      case 24:
        return 60
      case 168:
        return 6 * 60
      case 720:
        return 24 * 60
      case 4320:
        return 6 * 24 * 60
      default:
        return 60
    }
  }

  getStartBasedonDays(days: any): any {
    switch (days) {
      case 1:
        return moment().subtract(1, 'd')
      case 7:
        return moment().subtract(7, 'd')
      case 30:
        return moment().subtract(30, 'd')
      case 90:
        return moment().subtract(90, 'd')
      default:
        return moment().subtract(1, 'd')
    }
  }

  getEndBasedonDays(days: any): any {
    switch (days) {
      case 1:
        return moment()
      case 7:
        return moment()
      case 30:
        return moment()
      case 90:
        return moment()
      default:
        return moment()
    }
  }

  getStartBasedonHours(hours: any): any {
    switch (hours) {
      case 1:
        return moment().subtract(1, 'h')
      case 3:
        return moment().subtract(3, 'h')
      case 24:
        return moment().subtract(24, 'h')
      case 168:
        return moment().subtract(7 * 24, 'h')
      case 720:
        return moment().subtract(30 * 24, 'h')
      case 4320:
        return moment().subtract(180 * 24, 'h')
      default:
        return moment().subtract(1, 'h')
    }
  }

  getEndBasedonHours(days: any): any {
    switch (days) {
      case 1:
        return moment()
      case 3:
        return moment()
      case 24:
        return moment()
      case 168:
        return moment()
      case 720:
        return moment()
      case 4320:
        return moment()
      default:
        return moment()
    }
  }
}
