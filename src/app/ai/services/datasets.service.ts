import { Injectable } from '@angular/core'

import { environment } from 'src/environments/environment'

const API_URL = environment.baseUrl

@Injectable({ providedIn: 'root' })
export class DatasetService {

  async createDataset(datasetName: any, orgId: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/dataset`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      name: datasetName,
      org_id: orgId,
      is_default: false
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

  async getDatasets(page: any, size: any, query: any, orgId: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/dataset/getFiltered?page=${page}&size=${size}`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      query,
      org_id: orgId,
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

  async getAllDatasets(orgId: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/dataset/by_org/${orgId}`
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

  async getDatasetItems(datasetId: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/dataset-items/by_dataset/${datasetId}`
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

  async updateDataset(updatedDataset: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/dataset/${updatedDataset.id}`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      name: updatedDataset.name,
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

  async deleteDataset(datasetId: string): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/dataset/${datasetId}`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const options = { method: 'DELETE', headers }
    try {
      const response: Response = await fetch(url, options)
      if (!response.ok) {throw new Error('Delete failed')}
      return response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async archiveDataset(datasetId: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/dataset/archive/${datasetId}`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
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
