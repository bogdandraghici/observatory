import { Injectable } from '@angular/core'

import { environment } from 'src/environments/environment'

const API_URL = environment.baseUrl

@Injectable({ providedIn: 'root' })
export class EvalService {
  async getEvals(page: any, size: any, query: any, agent: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/eval/getFiltered?page=${page}&size=${size}`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
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

  async getEvalsByName(name: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/eval/byName/${name}`
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

  async getOllamaModels(): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/ollama/getModels`
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



  async createEval(
    evalOrgId: any,
    evalName: any,
    evalDatasetId: any,
    evalPromptId: any,
    evalNoOfRuns: any,
    evalExpType: any,
    evalLLMProvider: any,
    evalLLMName: any,
    evaluators: any
  ): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/eval`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      name: evalName,
      org_id: evalOrgId,
      dataset_id: evalDatasetId,
      prompt_id: evalPromptId,
      no_of_runs: evalNoOfRuns,
      experiment_type: evalExpType,
      llm_provider: evalLLMProvider,
      llm_name: evalLLMName,
      associated_evaluators: evaluators,
      status: 'CREATED',
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

  async updateEval(
    id: any,
    evalOrgId: any,
    evalName: any,
    evalDatasetId: any,
    evalPromptId: any,
    evalNoOfRuns: any,
    evalExpType: any,
    evalLLMProvider: any,
    evalLLMName: any,
    evaluators: any
  ): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/eval/${id}`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      name: evalName,
      org_id: evalOrgId,
      dataset_id: evalDatasetId,
      prompt_id: evalPromptId,
      no_of_runs: evalNoOfRuns,
      experiment_type: evalExpType,
      llm_provider: evalLLMProvider,
      llm_name: evalLLMName,
      associated_evaluators: evaluators,
      status: 'UPDATED',
    }
    const options = {
      method: 'PUT',
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


  async deleteEval(
    evalName: any
  ): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/eval/byName/${evalName}`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }

    const options = {
      method: 'DELETE',
      headers
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async runExperiment(experimentId: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/eval/${experimentId}/run`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }

    const options = {
      method: 'POST',
      headers,
    }
    try {
      const response: Response = await fetch(url, options)
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async getExperimentResults(experimentId: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/eval/${experimentId}/results`
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

  async getEvaluatorCatalog(): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/eval/catalog`
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

  async getAllEvals(orgId: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/eval/by_org/${orgId}`
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
}
