import { Injectable } from '@angular/core'
import { environment } from '../../environments/environment'

export interface ServiceStatus {
  name: string
  status: 'operational' | 'down'
  latency_ms: number
  description: string
  last_checked: string
}

export interface PlatformStatus {
  overall_status: 'operational' | 'partial_outage' | 'major_outage'
  services: ServiceStatus[]
  checked_at: string
}

@Injectable({ providedIn: 'root' })
export class StatusService {
  private baseUrl = environment.baseUrl + '/api/v1/observatory'

  async getStatus(): Promise<PlatformStatus> {
    const resp = await fetch(`${this.baseUrl}/status`)
    if (!resp.ok) {throw new Error(`Status check failed: ${resp.status}`)}
    return resp.json()
  }
}
