import { Injectable } from '@angular/core'
import { environment } from 'src/environments/environment'

const API_URL = environment.baseUrl

@Injectable({ providedIn: 'root' })
export class TestsService {

  // ── Datasets ─────────────────────────────────────────────────────────

  async getDatasets(workflowId: string): Promise<any> {
    return this.get(`/${workflowId}/datasets`)
  }

  async createDataset(workflowId: string, name: string, description?: string): Promise<any> {
    return this.post(`/${workflowId}/datasets`, { name, description: description || null })
  }

  async deleteDataset(datasetId: string): Promise<any> {
    return this.delete(`/datasets/${datasetId}`)
  }

  // ── Test Cases ───────────────────────────────────────────────────────

  async getTestCases(datasetId: string): Promise<any> {
    return this.get(`/datasets/${datasetId}/cases`)
  }

  async saveExecutionAsTestCase(datasetId: string, executionId: string, name: string): Promise<any> {
    return this.post(`/datasets/${datasetId}/cases/from-execution/${executionId}`, { name })
  }

  async deleteTestCase(caseId: string): Promise<any> {
    return this.delete(`/cases/${caseId}`)
  }

  // ── Test Runs ────────────────────────────────────────────────────────

  async runAllTests(datasetId: string): Promise<any> {
    return this.post(`/datasets/${datasetId}/run`, {})
  }

  async runSingleTest(caseId: string): Promise<any> {
    return this.post(`/cases/${caseId}/run`, {})
  }

  async getTestRuns(datasetId: string): Promise<any> {
    return this.get(`/datasets/${datasetId}/runs`)
  }

  async getTestRun(runId: string): Promise<any> {
    return this.get(`/runs/${runId}`)
  }

  // ── HTTP helpers ─────────────────────────────────────────────────────

  private async get(path: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/v1/tests${path}`
    const headers: any = { 'Content-Type': 'application/json' }
    if (token) { headers['Authorization'] = `Bearer ${token}` }
    try {
      const response: Response = await fetch(url, { method: 'GET', headers })
      if (!response.ok) { throw new Error(`HTTP ${response.status}`) }
      return response.json()
    } catch (error) {
      console.error('Tests API error:', error)
      throw error
    }
  }

  private async post(path: string, body: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/v1/tests${path}`
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
      console.error('Tests API error:', error)
      throw error
    }
  }

  private async delete(path: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/v1/tests${path}`
    const headers: any = { 'Content-Type': 'application/json' }
    if (token) { headers['Authorization'] = `Bearer ${token}` }
    try {
      const response: Response = await fetch(url, { method: 'DELETE', headers })
      if (!response.ok) { throw new Error(`HTTP ${response.status}`) }
      return response.json()
    } catch (error) {
      console.error('Tests API error:', error)
      throw error
    }
  }
}
