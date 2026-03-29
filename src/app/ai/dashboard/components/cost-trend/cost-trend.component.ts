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
    const documentStyle = getComputedStyle(document.documentElement)
    return {
      labels,
      datasets: [
        {
          label: 'Cost ($)',
          backgroundColor: documentStyle.getPropertyValue('--primary-color'),
          borderColor: documentStyle.getPropertyValue('--primary-color'),
          data: costs,
          borderWidth: 0,
          borderRadius: 4,
          barPercentage: 0.7,
        },
      ],
    }
  }

  getChartOptions(): any {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--text-color').trim()
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border').trim()

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (context) => '$' + (context.raw || 0).toFixed(4),
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColor,
            font: { size: 10 },
            maxRotation: 45,
          },
          grid: {
            display: false,
          },
        },
        y: {
          ticks: {
            color: textColor,
            font: { size: 10 },
            callback: (value) => '$' + value.toFixed(2),
          },
          grid: {
            color: surfaceBorder,
          },
        },
      },
    }
  }

}
