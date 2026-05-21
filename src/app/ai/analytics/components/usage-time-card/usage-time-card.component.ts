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

@Component({
    selector: 'usage-time-widget',
    templateUrl: './usage-time-card.component.html',
    styleUrl: './usage-time-card.component.scss',
    standalone: false
})
export class UsageTimeCardComponent implements OnInit, OnDestroy, OnChanges {
  @Input() agent: any = null
  @Input() title = 'Usage Time'
  @Input() days = 30
  data: any[] = []

  @Input() successRate: any
  @Input() period: any = 'month'

  chartDataUsageTime: any
  chartOptionsUsageTime: any

  constructor(
    public el: ElementRef,
    private metricsService: MetricsService,
  ) {}

  populateData(): void {
    const values = []
    this.metricsService.getHoursAll(this.days, this.agent).then((data) => {
      for (let i = 0; i <= 23; i++) {
        let found = false
        data.forEach((item) => {
          if (item.by_hour === i) {
            values.push({ hour: i, value: item.count_requests })
            found = true
          }
        })
        if (!found) {
          values.push({ hour: i, value: 0 })
        }
      }

      this.data = values
      this.chartOptionsUsageTime = this.getOptionsUsageTime()
      this.chartDataUsageTime = this.getDataUsageTime()
    })
  }

  ngOnChanges(_____changes: SimpleChanges): void {
    this.populateData()
  }

  ngOnInit(): void {
    this.chartOptionsUsageTime = this.getOptionsUsageTime()
    this.chartDataUsageTime = this.getDataUsageTime()
  }
  ngOnDestroy(): void {}

  getOptionsUsageTime(): any {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--text-color').trim()
    const textSecondary = documentStyle.getPropertyValue('--text-color-secondary').trim()
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border').trim()

    return {
      indexAxis: 'y',
      maintainAspectRatio: true,
      aspectRatio: 1,
      plugins: {
        legend: {
          display: false,
          labels: {
            display: true,
            color: textColor,
          },
          datalabels: {
            display: false,
          },
        },
      },
      layout: {
        padding: 0,
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
        r: {
          pointLabels: {
            display: true,
            color: textColor,
          },
          ticks: {
            display: true,
            color: textSecondary,
            backdropColor: 'transparent',
          },
          grid: {
            color: surfaceBorder,
          },
          angleLines: {
            color: surfaceBorder,
          },
        },
        y: {
          title: {
            display: false,
            text: 'Requests',
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

  getDataUsageTime(): any {
    const documentStyle = getComputedStyle(document.documentElement)
    return {
      labels: this.data.map((item) => item.hour),
      datasets: [
        {
          label: 'Requests',
          data: this.data.map((item) => item.value),
          fill: true,
          borderColor: documentStyle.getPropertyValue('--primary-500') + 'cc',
          borderWidth: 3,
          tension: 0.4,
          radius: 0,
          textColor: documentStyle.getPropertyValue('--text-color'),
          backgroundColor:
            documentStyle.getPropertyValue('--primary-200') + 'cc',
        },
      ],
    }
  }

}
