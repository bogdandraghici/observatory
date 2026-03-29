import { Injectable } from '@angular/core'
import { environment } from 'src/environments/environment'

const API_URL = environment.baseUrl

@Injectable({ providedIn: 'root' })
export class RoiService {
  private getHeaders(): any {
    const token = localStorage.getItem('access_token')
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }

  private handleError(error: any): void {
    console.error('ROI Service Error:', error)
  }

  // Dashboard
  async getDashboard(orgId: string, body: any): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/api/roi/dashboard/${orgId}`, {
        method: 'POST', headers: this.getHeaders(), body: JSON.stringify(body),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  // Financial ROI
  async computeFinancial(orgId: string, body: any): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/api/roi/financial/compute/${orgId}`, {
        method: 'POST', headers: this.getHeaders(), body: JSON.stringify(body),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  async listFinancial(orgId: string, projectId?: string): Promise<any> {
    try {
      const qs = projectId ? `?project_id=${projectId}` : ''
      const res = await fetch(`${API_URL}/api/roi/financial/${orgId}${qs}`, {
        method: 'GET', headers: this.getHeaders(),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  async saveFinancial(orgId: string, body: any): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/api/roi/financial/${orgId}`, {
        method: 'POST', headers: this.getHeaders(), body: JSON.stringify(body),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  async updateFinancial(orgId: string, id: string, body: any): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/api/roi/financial/${orgId}/${id}`, {
        method: 'PUT', headers: this.getHeaders(), body: JSON.stringify(body),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  async deleteFinancial(orgId: string, id: string): Promise<any> {
    try {
      await fetch(`${API_URL}/api/roi/financial/${orgId}/${id}`, {
        method: 'DELETE', headers: this.getHeaders(),
      })
    } catch (e) { this.handleError(e) }
  }

  // Compliance ROI
  async computeCompliance(orgId: string, body: any): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/api/roi/compliance/compute/${orgId}`, {
        method: 'POST', headers: this.getHeaders(), body: JSON.stringify(body),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  async listCompliance(orgId: string, projectId?: string): Promise<any> {
    try {
      const qs = projectId ? `?project_id=${projectId}` : ''
      const res = await fetch(`${API_URL}/api/roi/compliance/${orgId}${qs}`, {
        method: 'GET', headers: this.getHeaders(),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  async saveCompliance(orgId: string, body: any): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/api/roi/compliance/${orgId}`, {
        method: 'POST', headers: this.getHeaders(), body: JSON.stringify(body),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  // Benchmarks
  async listBenchmarks(orgId: string, projectId?: string): Promise<any> {
    try {
      const qs = projectId ? `?project_id=${projectId}` : ''
      const res = await fetch(`${API_URL}/api/roi/benchmarks/${orgId}${qs}`, {
        method: 'GET', headers: this.getHeaders(),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  async createBenchmark(orgId: string, body: any): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/api/roi/benchmarks/${orgId}`, {
        method: 'POST', headers: this.getHeaders(), body: JSON.stringify(body),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  async updateBenchmark(orgId: string, id: string, body: any): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/api/roi/benchmarks/${orgId}/${id}`, {
        method: 'PUT', headers: this.getHeaders(), body: JSON.stringify(body),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  async deleteBenchmark(orgId: string, id: string): Promise<any> {
    try {
      await fetch(`${API_URL}/api/roi/benchmarks/${orgId}/${id}`, {
        method: 'DELETE', headers: this.getHeaders(),
      })
    } catch (e) { this.handleError(e) }
  }

  async compareBenchmarks(orgId: string, body: any): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/api/roi/benchmarks/${orgId}/compare`, {
        method: 'POST', headers: this.getHeaders(), body: JSON.stringify(body),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  async compare5Year(orgId: string, body: any): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/api/roi/benchmarks/${orgId}/compare-5year`, {
        method: 'POST', headers: this.getHeaders(), body: JSON.stringify(body),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  // Sensitivity
  async runSensitivity(orgId: string, body: any): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/api/roi/sensitivity/run/${orgId}`, {
        method: 'POST', headers: this.getHeaders(), body: JSON.stringify(body),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  async listSensitivity(orgId: string, projectId?: string): Promise<any> {
    try {
      const qs = projectId ? `?project_id=${projectId}` : ''
      const res = await fetch(`${API_URL}/api/roi/sensitivity/${orgId}${qs}`, {
        method: 'GET', headers: this.getHeaders(),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  async getSensitivity(orgId: string, id: string): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/api/roi/sensitivity/${orgId}/${id}`, {
        method: 'GET', headers: this.getHeaders(),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  // Execution ROI
  async computeExecutionRoi(orgId: string, body: any): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/api/roi/execution-roi/compute/${orgId}`, {
        method: 'POST', headers: this.getHeaders(), body: JSON.stringify(body),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  async listExecutionRoi(orgId: string, projectId?: string, page: number = 1, size: number = 20): Promise<any> {
    try {
      let qs = `?page=${page}&size=${size}`
      if (projectId) {qs += `&project_id=${projectId}`}
      const res = await fetch(`${API_URL}/api/roi/execution-roi/${orgId}${qs}`, {
        method: 'GET', headers: this.getHeaders(),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  // Trend
  async getRoiTrend(orgId: string, body: any): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/api/roi/trend/${orgId}`, {
        method: 'POST', headers: this.getHeaders(), body: JSON.stringify(body),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  // Projection
  async getRoiProjection(orgId: string, body: any): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/api/roi/projection/${orgId}`, {
        method: 'POST', headers: this.getHeaders(), body: JSON.stringify(body),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  // Agent Baselines
  async listBaselines(orgId: string, projectId?: string): Promise<any> {
    try {
      const qs = projectId ? `?project_id=${projectId}` : ''
      const res = await fetch(`${API_URL}/api/roi/baselines/${orgId}${qs}`, {
        method: 'GET', headers: this.getHeaders(),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  async createBaseline(orgId: string, body: any): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/api/roi/baselines/${orgId}`, {
        method: 'POST', headers: this.getHeaders(), body: JSON.stringify(body),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  async updateBaseline(orgId: string, id: string, body: any): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/api/roi/baselines/${orgId}/${id}`, {
        method: 'PUT', headers: this.getHeaders(), body: JSON.stringify(body),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  async deleteBaseline(orgId: string, id: string): Promise<any> {
    try {
      await fetch(`${API_URL}/api/roi/baselines/${orgId}/${id}`, {
        method: 'DELETE', headers: this.getHeaders(),
      })
    } catch (e) { this.handleError(e) }
  }

  async computeFinancialByAgents(orgId: string, body: any): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/api/roi/financial/compute-by-agents/${orgId}`, {
        method: 'POST', headers: this.getHeaders(), body: JSON.stringify(body),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }

  // Multi-Agent Comparison
  async compareAgents(orgId: string, body: any): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/api/roi/compare-agents/${orgId}`, {
        method: 'POST', headers: this.getHeaders(), body: JSON.stringify(body),
      })
      return res.json()
    } catch (e) { this.handleError(e) }
  }
}
