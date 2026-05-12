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
 * Surfaces FlowX Regulatory Twin verdicts emitted by the Auditor agent.
 *
 * ai-agents writes one `run_type=regulatory_verdict` event per verdict
 * via flowxobservatory; the backend `POST /api/analytics/regulatory-verdicts`
 * aggregates them and this card renders the rollup.
 *
 * Visible pieces:
 *  - total verdict count
 *  - severity tag row (compliant / caution / likely violation, each
 *    with the count)
 *  - top-frameworks bar chart (handles multi-framework verdicts where
 *    the same verdict touches EU AI Act + DORA)
 *  - LLM-assisted indicator (how many verdicts ran the deeper LLM rules)
 *  - top cited articles (links to provenance — the regulator's
 *    "which articles are being touched most" question)
 */
@Component({
  selector: 'regulatory-verdicts-widget',
  templateUrl: './regulatory-verdicts.component.html',
  styleUrl: './regulatory-verdicts.component.scss',
  standalone: false,
})
export class RegulatoryVerdictsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() hours: number = 7 * 24
  @Input() appId: string = null

  totalCount = 0
  compliantCount = 0
  cautionCount = 0
  violationCount = 0
  llmAssistedCount = 0
  topFrameworks: { framework: string; count: number }[] = []
  topCitedArticles: { article_number: number; count: number }[] = []

  chartData: any
  chartOptions: any
  hasData = false

  constructor(
    private analyticsService: DashboardService,
    public el: ElementRef,
  ) {}

  populateData(appId: any, hours: any): void {
    this.analyticsService.getRegulatoryVerdicts(appId, hours).then((data) => {
      const safe = data ?? {}
      this.totalCount = safe.total_count ?? 0
      this.hasData = this.totalCount > 0
      this.llmAssistedCount = safe.llm_assisted_count ?? 0

      // Pull severity counts out of the by_severity list. Defaults to 0 so
      // a missing entry doesn't show as `undefined`.
      const sev: { severity: string; count: number }[] = safe.by_severity ?? []
      this.compliantCount = sev.find((s) => s.severity === 'compliant')?.count ?? 0
      this.cautionCount = sev.find((s) => s.severity === 'caution')?.count ?? 0
      this.violationCount =
        sev.find((s) => s.severity === 'likely_violation')?.count ?? 0

      this.topFrameworks = (safe.by_framework ?? []).slice(0, 5)
      this.topCitedArticles = (safe.top_cited_articles ?? []).slice(0, 6)

      this.chartData = this.getChartData(this.topFrameworks)
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

  private getChartData(rows: { framework: string; count: number }[]): any {
    const documentStyle = getComputedStyle(document.documentElement)
    return {
      labels: rows.map((r) => r.framework),
      datasets: [
        {
          label: 'Verdicts',
          backgroundColor: documentStyle.getPropertyValue('--primary-color'),
          borderColor: documentStyle.getPropertyValue('--primary-color'),
          data: rows.map((r) => r.count),
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
      indexAxis: 'y', // Horizontal bars — better for variable-length framework names.
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (context: any) => ` ${context.raw} verdict(s)`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: textColor, font: { size: 10 }, precision: 0 },
          grid: { color: surfaceBorder },
        },
        y: {
          ticks: { color: textColor, font: { size: 10 } },
          grid: { display: false },
        },
      },
    }
  }
}
