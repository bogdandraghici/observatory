import { Injectable } from '@angular/core'

import moment from 'moment'
import { environment } from 'src/environments/environment'

const API_URL = environment.baseUrl

@Injectable({ providedIn: 'root' })
export class RunService {

  async setCorrectness(requestId: any, correctness: any): Promise<any> {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/run/correctness/${requestId}/${correctness}`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }


    const options = {
      method: 'PUT',
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

  getStartBasedonDays(days: any): any {
    switch (days) {
      case 1:
        return moment().subtract(1, 'day')
      case 7:
        return moment().subtract(7, 'days')
      case 30:
        return moment().subtract(30, 'days')
      case 90:
        return moment().subtract(90, 'days')
      default:
        return moment().subtract(1, 'day')
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
}
