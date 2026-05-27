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

/**
 * Surfaces chat-style audits emitted by the Auditor agent — `check_ui`,
 * `check_process`, and `extract_compliance`.
 *
 * ai-agents writes one `run_type=auditor_check_*` event per audit via
 * flowxobservatory; the backend `POST /api/analytics/auditor-checks`
 * aggregates them and this card renders the rollup.
 *
 * Visible pieces:
 *  - total audit count
 *  - by-kind chart (UI vs Process vs Extract)
 *  - severity tag row (high / medium / low findings tally)
 *  - latency stats (p50 / p95)
 *  - findings total + average per run
 */
@Component({
  selector: 'auditor-checks-widget',
  templateUrl: './auditor-checks.component.html',
  styleUrl: './auditor-checks.component.scss',
  standalone: false,
})
export class AuditorChecksComponent implements OnInit, OnDestroy, OnChanges {
  @Input() hours: number = 7 * 24
  @Input() appId: string = null

  totalCount = 0
  uiCount = 0
  processCount = 0
  extractCount = 0
  highCount = 0
  mediumCount = 0
  lowCount = 0
  findingsTotal = 0
  findingsPerRunAvg = 0
  p50Ms = 0
  p95Ms = 0
  avgMs = 0

  chartData: any
  chartOptions: any
  hasData = false

  constructor(
    private analyticsService: DashboardService,
    public el: ElementRef,
  ) {}

  populateData(appId: any, hours: any): void {
    this.analyticsService.getAuditorChecks(appId, hours).then((data) => {
      const safe = data ?? {}
      this.totalCount = safe.total_count ?? 0
      this.hasData = this.totalCount > 0

      const kinds: { kind: string; count: number }[] = safe.by_kind ?? []
      this.uiCount = kinds.find((k) => k.kind === 'check_ui')?.count ?? 0
      this.processCount = kinds.find((k) => k.kind === 'check_process')?.count ?? 0
      this.extractCount = kinds.find((k) => k.kind === 'extract_compliance')?.count ?? 0

      const sev: { severity: string; count: number }[] = safe.by_severity ?? []
      this.highCount = sev.find((s) => s.severity === 'high')?.count ?? 0
      this.mediumCount = sev.find((s) => s.severity === 'medium')?.count ?? 0
      this.lowCount = sev.find((s) => s.severity === 'low')?.count ?? 0

      this.findingsTotal = safe.findings_total ?? 0
      this.findingsPerRunAvg = safe.findings_per_run_avg ?? 0

      const latency = safe.latency ?? {}
      this.avgMs = latency.avg_ms ?? 0
      this.p50Ms = latency.p50_ms ?? 0
      this.p95Ms = latency.p95_ms ?? 0

      this.chartData = this.getChartData()
      this.chartOptions = this.getChartOptions()
    })
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['hours']?.currentValue || this.hours) &&
      (changes['appId']?.currentValue || this.appId)
    ) {
      this.populateData(this.appId, this.hours)
    }
  }

  ngOnDestroy(): void {}

  /** Format milliseconds → human ("420 ms" / "1.4 s" / "12.5 s"). */
  fmtMs(ms: number): string {
    if (!ms || ms < 0) {
      return '—'
    }
    if (ms < 1000) {
      return `${ms} ms`
    }
    return `${(ms / 1000).toFixed(1)} s`
  }

  private getChartData(): any {
    const isDark = document.documentElement.classList.contains('flowx-dark')
    const strokeHex = isDark ? '#feb913' : '#feb913' // flowx-yellow-500 — keeps Auditor identity
    const strokeRgb = '254, 185, 19'
    return {
      labels: ['UI', 'Process', 'Extract'],
      datasets: [
        {
          label: 'Audits',
          data: [this.uiCount, this.processCount, this.extractCount],
          borderColor: strokeHex,
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: 0.7,
          hoverBackgroundColor: strokeHex,
          backgroundColor: (context: any) => {
            const { ctx, chartArea } = context.chart
            if (!chartArea) {
              return `rgba(${strokeRgb}, 0.35)`
            }
            const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0)
            gradient.addColorStop(0, `rgba(${strokeRgb}, 0.55)`)
            gradient.addColorStop(1, `rgba(${strokeRgb}, 0.15)`)
            return gradient
          },
        },
      ],
    }
  }

  private getChartOptions(): any {
    return {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false, axis: 'y' },
      plugins: {
        legend: { display: false },
        datalabels: { display: false },
        tooltip: {
          enabled: true,
          backgroundColor: '#1d232c',
          titleColor: '#f7f8f9',
          bodyColor: '#e3e8ed',
          borderWidth: 0,
          cornerRadius: 6,
          padding: { x: 10, y: 6 },
          displayColors: false,
          titleFont: { size: 11, weight: '600', family: '"Open Sans", system-ui, sans-serif' },
          bodyFont: { size: 12, weight: '400', family: '"Open Sans", system-ui, sans-serif' },
          callbacks: {
            label: (context: any) => ` ${context.raw} audit(s)`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          border: { display: false },
          ticks: {
            color: '#64748b',
            font: { size: 10, family: '"Open Sans", system-ui, sans-serif' },
            precision: 0,
          },
          grid: { color: 'rgba(99, 116, 139, 0.10)', drawBorder: false, drawTicks: false },
        },
        y: {
          border: { display: false },
          ticks: {
            color: '#64748b',
            font: { size: 10, family: '"Open Sans", system-ui, sans-serif' },
          },
          grid: { display: false, drawBorder: false },
        },
      },
    }
  }
}
