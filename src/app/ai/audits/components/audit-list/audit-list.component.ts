import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core'
import { DashboardService } from '../../../services/dashboard.service'

import { formatTime } from 'src/app/ai/utils/time'

/**
 * Surfaces individual audit events emitted by the Auditor agent and the
 * Regulatory Twin. One row per `audit_event` table entry.
 *
 * Same shape/feel as the Agent Executions list (PrimeNG lazy table +
 * filter dropdown + side-drawer detail) — the only differences are the
 * data source and the columns, which match the AuditEvent schema:
 * kind, severity, findings, duration, request id, agent.
 */
@Component({
    selector: 'audit-list-widget',
    templateUrl: './audit-list.component.html',
    styleUrls: ['./audit-list.component.scss'],
    standalone: false
})
export class AuditListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() hours = 1
  @Input() appId: string = null

  audits: any[]
  first = 0
  rows = 10
  totalRecords!: number
  loading = false

  intervalId: any
  formatTime = formatTime

  selectedItem: any
  detailVisible = false

  // Kind filter (UI / Process / Extract / Verdict / Drift). Variable
  // names kept aligned with the executions widget for behavioural parity.
  selectedAgent: any
  agents: { name: string; code: string }[] = [
    { name: 'UI audit', code: 'auditor_check_ui' },
    { name: 'Process audit', code: 'auditor_check_process' },
    { name: 'Extract compliance', code: 'auditor_extract_compliance' },
    { name: 'Regulatory verdict', code: 'regulatory_verdict' },
    { name: 'Regulatory drift', code: 'regulatory_drift' },
  ]

  constructor(
    private dashboardService: DashboardService,
    public el: ElementRef,
  ) {}

  populateTable(event: any, appId: any, hours: any): void {
    let page = 1
    const size = 10

    if (event) {
      page = event?.first / event?.rows + 1
    }
    this.loading = true
    this.dashboardService
      .getAuditEvents(appId, hours, page, size, this.selectedAgent?.code)
      .then((data) => {
        this.audits = (data?.items ?? []).map((item: any) => {
          // Latency severity buckets — same UX as executions
          // (>8s = danger, >4s = warning, else success).
          const durationSecs = (item.duration_ms ?? 0) / 1000
          item.duration = durationSecs
          if (durationSecs > 8) {
            item.latency = 'danger'
          } else if (durationSecs > 4) {
            item.latency = 'warning'
          } else {
            item.latency = 'success'
          }
          // Friendly kind label for the chip.
          item.kind_label = (
            {
              auditor_check_ui: 'UI',
              auditor_check_process: 'Process',
              auditor_extract_compliance: 'Extract',
              regulatory_verdict: 'Verdict',
              regulatory_drift: 'Drift',
            } as Record<string, string>
          )[item.run_type] || item.run_type
          return item
        })
        this.totalRecords = data?.total ?? 0
        this.loading = false
      })
      .catch(() => {
        this.loading = false
      })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['hours']?.currentValue || this.hours) &&
      (changes['appId']?.currentValue || this.appId)
    ) {
      this.populateTable(null, this.appId, this.hours)
    }
  }

  filterByAgent(_event: any): void {
    this.populateTable(null, this.appId, this.hours)
  }

  ngOnInit(): void {
    this.intervalId = window.setInterval(() => {
      if (this.hours && this.appId) {
        this.populateTable(null, this.appId, this.hours)
      }
    }, 600000)
  }

  rowSelect(event: any): void {
    this.selectedItem = event.data
    this.detailVisible = true
  }

  hideDetails(): void {
    this.detailVisible = false
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId)
  }

  /** Severity → PrimeNG tag severity mapping. */
  severityClass(s: string | null | undefined): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (s) {
      case 'compliant':
      case 'low':
        return 'success'
      case 'caution':
      case 'medium':
        return 'warn'
      case 'likely_violation':
      case 'high':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  fmtDuration(ms: number | null | undefined): string {
    if (ms == null || ms < 0) {
      return '—'
    }
    if (ms < 1000) {
      return `${ms} ms`
    }
    return `${(ms / 1000).toFixed(1)} s`
  }
}
