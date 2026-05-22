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

@Component({
    selector: 'cost-trend-widget',
    templateUrl: './cost-trend.component.html',
    styleUrl: './cost-trend.component.scss',
    standalone: false
})
export class CostTrendComponent implements OnInit, OnDestroy, OnChanges {
  @Input() hours: number = 7 * 24
  @Input() appId: string = null
  totalCost = 0
  chartData: any
  chartOptions: any
  hasData = false

  constructor(
    private analyticsService: DashboardService,
    public el: ElementRef,
  ) {}

  populateData(appId: any, hours: any): void {
    this.analyticsService.getCostAnalytics(appId, hours, 'day').then((data) => {
      const items = Array.isArray(data) ? data : []
      this.totalCost = items.reduce((sum, item) => sum + (item.total_cost || 0), 0)
      this.hasData = items.length > 0

      const sorted = items.sort((a, b) => a.name.localeCompare(b.name))
      const labels = sorted.map(item => item.name)
      const costs = sorted.map(item => item.total_cost || 0)

      this.chartData = this.getChartData(labels, costs)
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

  getChartData(labels: string[], costs: number[]): any {
    const isDark = document.documentElement.classList.contains('flowx-dark')
    const strokeHex = isDark ? '#3389e0' : '#006bd8'         // flowx-blue-400 / -500
    const strokeRgb = isDark ? '51, 137, 224' : '0, 107, 216'
    return {
      labels,
      datasets: [
        {
          label: 'Cost ($)',
          data: costs,
          borderColor: strokeHex,
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: 0.7,
          hoverBackgroundColor: strokeHex,
          backgroundColor: (context: any) => {
            const { ctx, chartArea } = context.chart
            if (!chartArea) { return `rgba(${strokeRgb}, 0.35)` }
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
            gradient.addColorStop(0, `rgba(${strokeRgb}, 0.55)`)
            gradient.addColorStop(1, `rgba(${strokeRgb}, 0.10)`)
            return gradient
          },
        },
      ],
    }
  }

  getChartOptions(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false, axis: 'x' },
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
            label: (context: any) => '$' + (context.raw || 0).toFixed(4),
          },
        },
      },
      scales: {
        x: {
          border: { display: false },
          ticks: {
            color: '#64748b',
            font: { size: 10, family: '"Open Sans", system-ui, sans-serif' },
            maxRotation: 45,
          },
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
            callback: (value: any) => '$' + value.toFixed(2),
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

}
