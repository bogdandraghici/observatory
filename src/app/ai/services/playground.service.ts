import { Injectable } from '@angular/core'

import { environment } from 'src/environments/environment'

const API_URL = environment.playgroundUrl

@Injectable({ providedIn: 'root' })
export class PlaygroundService {


  async run_assistant(prompt: any, params: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/ai-assistant/api/v1/assistant/playground`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      prompt,
      params,
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


  async run_analyst(prompt: any, context: any, params: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/ai-analyst/api/v1/analyst/playground`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      prompt,
      context,
      params,
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

  async run_designer(prompt: any, context: any, params: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/ai-designer/api/v1/designer/playground`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      prompt,
      context,
      params,
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

  async run_developer(prompt: any,context: any, datasource: any, language: any, params: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/ai-developer/api/v1/developer/playground`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      prompt,
      context,
      datasource,
      language,
      params,
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
