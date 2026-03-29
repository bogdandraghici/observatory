import { Injectable } from '@angular/core'

import moment from 'moment'
import { environment } from 'src/environments/environment'

const API_URL = environment.baseUrl

@Injectable({ providedIn: 'root' })
export class MetricsService {
  async getMetricsAll(app_id: any, days: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/metrics/usage/all`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      projectId: app_id,
      days
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

  async getEndpointsAll(app_id: any, days: any, start: any, end: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/metrics/usage/endpoints`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      projectId: app_id,
      days,
      status_start: start,
      status_end: end
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


  async getHoursAll(app_id: any, days: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/metrics/usage/hours`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      projectId: app_id,
      days
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


  async getVersions(app_id: any, days: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/metrics/usage/version`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      projectId: app_id,
      days
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

  async getAgents(app_id: any, days: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/metrics/usage/agents`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const body = {
      projectId: app_id,
      days
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
