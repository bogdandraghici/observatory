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

  // FlowX uses blue-500 on light and blue-400 on dark so the stroke
  // and the translucent fill both read against the surface.
  private bluePrimary(): { hex: string; rgb: string } {
    const isDark = document.documentElement.classList.contains('flowx-dark')
    return isDark
      ? { hex: '#3389e0', rgb: '51, 137, 224' }
      : { hex: '#006bd8', rgb: '0, 107, 216' }
  }

  getOptionsUsageTime(): any {
    return {
      indexAxis: 'y',
      maintainAspectRatio: true,
      aspectRatio: 1,
      responsive: true,
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
            title: (items: any[]) => items.length ? `${items[0].label}:00` : '',
          },
        },
      },
      layout: { padding: 8 },
      scales: {
        r: {
          beginAtZero: true,
          pointLabels: {
            display: true,
            color: '#64748b',
            font: { size: 10, family: '"Open Sans", system-ui, sans-serif' },
          },
          ticks: {
            display: false,
            backdropColor: 'transparent',
          },
          grid: { color: 'rgba(99, 116, 139, 0.10)' },
          angleLines: { color: 'rgba(99, 116, 139, 0.15)' },
        },
      },
    }
  }

  getDataUsageTime(): any {
    return {
      labels: this.data.map((item) => item.hour),
      datasets: [
        {
          label: 'Requests',
          data: this.data.map((item) => item.value),
          fill: true,
          borderColor: this.bluePrimary().hex,
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: this.bluePrimary().hex,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
          backgroundColor: `rgba(${this.bluePrimary().rgb}, 0.25)`,
        },
      ],
    }
  }

}
