import { Injectable } from '@angular/core'
import { environment } from 'src/environments/environment'

const API_URL = environment.baseUrl

@Injectable({ providedIn: 'root' })
export class EvaluatorService {

  private getHeaders(): any {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    }
  }

  async listEvaluators(projectId: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/evaluators/${projectId}`, {
      headers: this.getHeaders(),
    })
    return response.json()
  }

  async createEvaluator(body: any): Promise<any> {
    const response = await fetch(`${API_URL}/api/evaluators/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    })
    return response.json()
  }

  async updateEvaluator(id: string, body: any): Promise<any> {
    const response = await fetch(`${API_URL}/api/evaluators/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    })
    return response.json()
  }

  async deleteEvaluator(id: string): Promise<any> {
    await fetch(`${API_URL}/api/evaluators/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
  }

  async toggleEvaluator(id: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/evaluators/${id}/toggle`, {
      method: 'POST',
      headers: this.getHeaders(),
    })
    return response.json()
  }

  async runEvaluator(id: string, numRuns: number = 50, hours: number = 168): Promise<any> {
    const response = await fetch(`${API_URL}/api/evaluators/${id}/run`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ num_runs: numRuns, hours }),
    })
    return response.json()
  }

  async getResults(evaluatorId: string, limit: number = 50): Promise<any> {
    const response = await fetch(`${API_URL}/api/evaluators/${evaluatorId}/results?limit=${limit}`, {
      headers: this.getHeaders(),
    })
    return response.json()
  }

  async getRunResults(runId: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/evaluators/run/${runId}/results`, {
      headers: this.getHeaders(),
    })
    return response.json()
  }

  async getSummary(projectId: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/evaluators/${projectId}/summary`, {
      headers: this.getHeaders(),
    })
    return response.json()
  }

  async suggestEvaluators(projectId: string, provider: string = 'openai', model: string = 'gpt-5.4', agentName?: string): Promise<any> {
    const body: any = {
      project_id: projectId,
      num_samples: 20,
      suggestion_provider: provider,
      suggestion_model: model,
    }
    if (agentName) {
      body.agent_name = agentName
    }
    const response = await fetch(`${API_URL}/api/evaluators/suggest`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    })
    return response.json()
  }
}
