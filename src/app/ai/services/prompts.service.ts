import { Injectable } from '@angular/core'

import { environment } from 'src/environments/environment'

const API_URL = environment.baseUrl

@Injectable({ providedIn: 'root' })
export class PromptService {
  async getPrompts(page: any, size: any, query: any, agent: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/prompt/getFiltered?page=${page}&size=${size}`
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

  async getPromptsByName(name: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/prompt/byName/${encodeURIComponent(name)}`
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

  async createPrompt(
    promtOrgId: any,
    promptName: any,
    promptAgent: any,
    promptLLMProvider: any,
    promptLLMName: any,
    promptContent: any,
    promptType: any,
    defaultValues: any,
    promptTags: any,
    activated: any
  ): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/prompt`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      name: promptName,
      org_id: promtOrgId,
      agent: promptAgent,
      llm_provider: promptLLMProvider,
      llm_name: promptLLMName,
      content: promptContent,
      prompt_type: promptType,
      config: defaultValues,
      tags: promptTags,
      version: 1,
      activated
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

  async updatePrompt(
    id: any,
    promtOrgId: any,
    promptName: any,
    promptAgent: any,
    promptLLMProvider: any,
    promptLLMName: any,
    promptContent: any,
    promptType: any,
    defaultValues: any,
    promptTags: any,
    activated: any,
  ): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/prompt/${id}`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      name: promptName,
      org_id: promtOrgId,
      agent: promptAgent,
      llm_provider: promptLLMProvider,
      llm_name: promptLLMName,
      content: promptContent,
      prompt_type: promptType,
      config: defaultValues,
      tags: promptTags,
      activated
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


  async deletePrompt(
    promptName: any
  ): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/prompt/byName/${promptName}`
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

  async getDetectedPrompts(projectId: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/prompt/detected/${projectId}`
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

  async getDetectedPromptHistory(projectId: any, agent: string, modelName: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const params = new URLSearchParams()
    if (agent) params.set('agent', agent)
    if (modelName) params.set('model_name', modelName)
    const url = `${API_URL}/api/prompt/detected/${projectId}/history?${params.toString()}`
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

  async getDetectedTimeline(projectId: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/prompt/detected/${projectId}/timeline`
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

  async getPromptDiff(id: string, otherId: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/prompt/diff/${id}/${otherId}`
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

  async getAllPrompts(orgId: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/prompt/by_org/${orgId}`
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
