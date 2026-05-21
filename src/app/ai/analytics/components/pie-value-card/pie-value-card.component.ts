import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core'

import { MetricsService } from 'src/app/ai/services/metrics.service'

import * as Chart from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

@Component({
    selector: 'pie-value-widget',
    templateUrl: './pie-value-card.component.html',
    styleUrl: './pie-value-card.component.scss',
    standalone: false
})
export class PieValueCardComponent implements OnInit, OnDestroy, OnChanges {
  @Input() agent: any = null
  @Input() title = 'Requests'
  @Input() days = 30
  @Input() dataSource = 'agent'
  @Input() ratio = 1
  @Input() position = 'left'
  @Input() chartType = 'pie'
  data: any[] = []

  chartData: any
  chartOptionsPie: any
  chartOptionsBar: any

  chartJs = Chart
  chartLabelPlugin = ChartDataLabels

  chartTypes: any[] = [
    { label: 'Pie', value: 'pie' },
    { label: 'Bar', value: 'bar' },
    // { label: 'Details', value: 'details' },
  ]

  // FlowX semantic palette — distinct hue per segment, cycles for >6 versions.
  // Stroke is the saturated palette step; fill is the same hue at ~35% alpha
  // so it reads as a transparent tint over whichever surface is below.
  // The lead blue swaps to flowx-blue-400 in dark mode (matches the rest
  // of the API-calls charts which lift their primary blue).
  get segmentPalette(): { stroke: string; fill: string }[] {
    const isDark = document.documentElement.classList.contains('flowx-dark')
    const leadBlue = isDark
      ? { stroke: '#3389e0', fill: 'rgba(51, 137, 224, 0.35)' }   // blue-400
      : { stroke: '#006bd8', fill: 'rgba(0, 107, 216, 0.35)' }    // blue-500
    return [
      leadBlue,
      { stroke: '#008060', fill: 'rgba(0, 128, 96, 0.35)' },     // flowx-green-500
      { stroke: '#fd6b1c', fill: 'rgba(253, 107, 28, 0.35)' },   // flowx-orange-500
      { stroke: '#e62200', fill: 'rgba(230, 34, 0, 0.35)' },     // flowx-red-500
      { stroke: '#549ce5', fill: 'rgba(84, 156, 229, 0.35)' },   // flowx-blue-300
      { stroke: '#64748b', fill: 'rgba(100, 116, 139, 0.35)' },  // flowx-neutrals-500
    ]
  }

  // Aligned with chartData order; consumed by the template's legend row.
  legend: { label: string; count: number; fill: string; stroke: string }[] = []

  constructor(
    public el: ElementRef,
    private metricsService: MetricsService,
  ) {}

  populateData(): void {
    if (!this.days) {
      return
    }
    if (this.dataSource === 'agent') {
      this.metricsService.getAgents(this.days).then((data) => {
        this.data = data
        this.chartOptionsPie = this.getOptionsPie()
        this.chartOptionsBar = this.getOptionsBar()
        this.chartData = this.getData()
      })
    } else {
      this.metricsService.getVersions(this.days, this.agent).then((data) => {
        this.data = data
        this.chartOptionsPie = this.getOptionsPie()
        this.chartOptionsBar = this.getOptionsBar()
        this.chartData = this.getData()
      })
    }
  }

  onTypeChange(____event: any): void {
  }

  ngOnChanges(____changes: SimpleChanges): void {
    this.populateData()
  }

  ngOnInit(): void {
    this.chartOptionsPie = this.getOptionsPie()
    this.chartData = this.getData()
  }
  ngOnDestroy(): void {}

  private flowxTooltip(): any {
    return {
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
    }
  }

  getOptionsPie(): any {
    return {
      maintainAspectRatio: true,
      aspectRatio: this.ratio,
      plugins: {
        legend: { display: false },        // we render our own legend in the template
        datalabels: { display: false },    // labels live in the legend, not in segments
        tooltip: this.flowxTooltip(),
      },
      layout: { padding: 16 },
    }
  }

  getOptionsBar(): any {
    return {
      maintainAspectRatio: true,
      aspectRatio: this.ratio,
      plugins: {
        legend: { display: false },
        datalabels: { display: false },
        tooltip: this.flowxTooltip(),
      },
      layout: { padding: 0 },
      scales: {
        x: {
          ticks: {
            color: '#64748b',
            font: { size: 10, family: '"Open Sans", system-ui, sans-serif' },
          },
          border: { display: false },
          grid: { display: false, drawBorder: false },
        },
        y: {
          beginAtZero: true,
          border: { display: false },
          ticks: {
            color: '#64748b',
            font: { size: 10, family: '"Open Sans", system-ui, sans-serif' },
            maxTicksLimit: 4,
            padding: 4,
          },
          grid: {
            color: 'rgba(99, 116, 139, 0.10)',
            drawBorder: false,
            drawTicks: false,
          },
        },
      },
    }
  }

  getAgent(value: number): string {
    switch (value) {
      case 0:
        return 'Analyst'
      case 1:
        return 'Architect'
      case 2:
        return 'Assistant'
      case 3:
        return 'Auditor'
      case 4:
        return 'Command'
      case 5:
        return 'Designer'
      case 6:
        return 'Developer'
      case 7:
        return 'Inspector'
      case 8:
        return 'Integrator'
      case 9:
        return 'Optimizer'
      case 10:
        return 'Strategist'
      case 11:
        return 'Supervisor'
      case 12:
        return 'Writer'
      case 13:
        return 'DI-Platform'
      default:
        return 'n/a'
    }
  }

  getData(): any {
    const items = this.data ?? []
    const labels = this.dataSource === 'agent'
      ? items.map((d) => this.getAgent(d.agent))
      : items.map((d) => d.version)
    const counts = items.map((d) => d.count_requests)
    const colors = items.map((_, i) => this.segmentPalette[i % this.segmentPalette.length])

    // Keep the template legend in sync with the dataset order/colors.
    this.legend = items.map((d, i) => ({
      label: labels[i],
      count: counts[i],
      fill: colors[i].fill,
      stroke: colors[i].stroke,
    }))

    return {
      labels,
      datasets: [
        {
          data: counts,
          borderWidth: 1,
          borderColor: colors.map((c) => c.stroke),
          backgroundColor: colors.map((c) => c.fill),
          hoverBackgroundColor: colors.map((c) => c.fill),
          hoverBorderColor: colors.map((c) => c.stroke),
          hoverBorderWidth: 2,
        },
      ],
    }
  }

}
