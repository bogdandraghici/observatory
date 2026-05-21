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
 * Drift detection rollup card.
 *
 * ai-agents emits one `run_type=regulatory_drift` event per call to its
 * drift endpoint; the backend `POST /api/analytics/regulatory-drift`
 * aggregates them. This card surfaces:
 *
 *  - the **latest** drift run's drifted-vs-examined counts (right-now state)
 *  - **worsened vs improved** tally (did the corpus update make things
 *    better or worse for the persisted verdicts)
 *  - **per-day trend** of how many verdicts drifted
 *
 * Reads as a sibling to the regulatory-verdicts card. Both share the
 * same severity palette and stat-card shell.
 */
@Component({
  selector: 'regulatory-drift-widget',
  templateUrl: './regulatory-drift.component.html',
  styleUrl: './regulatory-drift.component.scss',
  standalone: false,
})
export class RegulatoryDriftComponent implements OnInit, OnDestroy, OnChanges {
  @Input() hours: number = 7 * 24
  @Input() appId: string = null

  totalDriftRuns = 0
  latestExamined = 0
  latestDrifted = 0
  latestWorsened = 0
  latestImproved = 0
  verdictDriftCount = 0
  citationDriftCount = 0
  noDriftCount = 0

  chartData: any
  chartOptions: any
  hasData = false

  constructor(
    private analyticsService: DashboardService,
    public el: ElementRef,
  ) {}

  populateData(appId: any, hours: any): void {
    this.analyticsService.getRegulatoryDrift(appId, hours).then((data) => {
      const safe = data ?? {}
      this.totalDriftRuns = safe.total_drift_runs ?? 0
      this.latestExamined = safe.latest_examined ?? 0
      this.latestDrifted = safe.latest_drifted ?? 0
      this.latestWorsened = safe.latest_worsened ?? 0
      this.latestImproved = safe.latest_improved ?? 0
      this.verdictDriftCount = safe.verdict_drift_count ?? 0
      this.citationDriftCount = safe.citation_drift_count ?? 0
      this.noDriftCount = safe.no_drift_count ?? 0
      this.hasData = this.totalDriftRuns > 0

      const trend: { date: string; verdicts_drifted: number; verdicts_examined: number }[] =
        safe.trend ?? []
      this.chartData = this.getChartData(trend)
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

  /** Ratio "drifted / examined" for the latest run. Displayed as a percent. */
  get latestDriftedPercent(): number {
    if (!this.latestExamined) return 0
    return Math.round((this.latestDrifted / this.latestExamined) * 100)
  }

  private getChartData(
    trend: { date: string; verdicts_drifted: number; verdicts_examined: number }[],
  ): any {
    const documentStyle = getComputedStyle(document.documentElement)
    const labels = trend.map((t) => new Date(t.date).toLocaleDateString())
    return {
      labels,
      datasets: [
        {
          label: 'Drifted',
          backgroundColor: 'rgba(239, 68, 68, 0.55)', // red @ 55%
          borderColor: 'rgba(239, 68, 68, 1)',
          data: trend.map((t) => t.verdicts_drifted),
          borderWidth: 0,
          borderRadius: 4,
          barPercentage: 0.7,
        },
        {
          label: 'Stable',
          backgroundColor: documentStyle.getPropertyValue('--surface-200'),
          borderColor: documentStyle.getPropertyValue('--surface-200'),
          data: trend.map(
            (t) => Math.max(0, (t.verdicts_examined || 0) - (t.verdicts_drifted || 0)),
          ),
          borderWidth: 0,
          borderRadius: 4,
          barPercentage: 0.7,
        },
      ],
    }
  }

  private getChartOptions(): any {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--text-color').trim()
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border').trim()
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { color: textColor, font: { size: 10 } },
        },
        tooltip: { enabled: true },
      },
      scales: {
        x: {
          stacked: true,
          ticks: { color: textColor, font: { size: 10 } },
          grid: { display: false },
        },
        y: {
          stacked: true,
          ticks: { color: textColor, font: { size: 10 }, precision: 0 },
          grid: { color: surfaceBorder },
        },
      },
    }
  }
}
