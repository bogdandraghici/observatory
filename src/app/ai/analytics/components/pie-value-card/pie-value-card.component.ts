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
  @Input() appId: string = null
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


  constructor(
    public el: ElementRef,
    private metricsService: MetricsService,
  ) {}

  populateData(): void {
    if (!this.appId || !this.days) {
      return
    }
    if (this.dataSource === 'agent') {
      this.metricsService.getAgents(this.appId, this.days).then((data) => {
        this.data = data
        this.chartOptionsPie = this.getOptionsPie()
        this.chartOptionsBar = this.getOptionsBar()
        this.chartData = this.getData()
      })
    } else {
      this.metricsService.getVersions(this.appId, this.days).then((data) => {
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

  getOptionsPie(): any {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--text-color').trim()

    return {
      maintainAspectRatio: true,
      aspectRatio: this.ratio,
      plugins: {
        legend: {
          display: false,
          position: this.position,
          z: 100,
          labels: {
            display: true,
            color: textColor,
          },
          datalabels: {
            display: true,
          },
        },
        datalabels: {
          color: textColor,
        },
      },
      layout: {
        padding: 50,
      },
      scales: {
        x: {
          ticks: {
            display: false,
          },
          grid: {
            display: false,
            drawBorder: false,
          },
        },
        y: {
          border: {
            display: false,
          },
          ticks: {
            display: false,
          },
          grid: {
            display: false,
            drawBorder: false,
          },
        },
      },
    }
  }

  getOptionsBar(): any {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--text-color').trim()
    const textSecondary = documentStyle.getPropertyValue('--text-color-secondary').trim()
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border').trim()

    return {
      maintainAspectRatio: true,
      aspectRatio: this.ratio,
      plugins: {
        legend: {
          display: false,
          position: this.position,
          z: 100,
          labels: {
            display: true,
            color: textColor,
          },
          datalabels: {
            display: true,
          },
        },
        datalabels: {
          color: textColor,
        },
      },
      layout: {
        padding: 50,
      },
      scales: {
        x: {
          ticks: {
            display: true,
            color: textSecondary,
          },
          grid: {
            display: true,
            drawBorder: false,
            color: surfaceBorder,
          },
        },
        y: {
          border: {
            display: false,
          },
          ticks: {
            display: true,
            color: textSecondary,
          },
          grid: {
            display: true,
            drawBorder: false,
            color: surfaceBorder,
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
    const documentStyle = getComputedStyle(document.documentElement)

    return {
      labels:
        this.dataSource === 'agent'
          ? this.data?.map((d) => this.getAgent(d.agent))
          : this.data?.map((d) => d.version),
      datasets: [
        {
          data: this.data?.map((d) => d.count_requests),
          fill: true,
          border: 1,
          borderColor: this.data?.map((d, i) =>
            i % 2 === 0
              ? documentStyle.getPropertyValue('--primary-500') + 'cc'
              : documentStyle.getPropertyValue('--gray-500') + 'cc',
          ),
          backgroundColor: this.data?.map((d, i) =>
            i % 2 === 0
              ? documentStyle.getPropertyValue('--primary-200') + 'cc'
              : documentStyle.getPropertyValue('--gray-200') + 'cc',
          ),
        },
      ],
    }
  }

}
