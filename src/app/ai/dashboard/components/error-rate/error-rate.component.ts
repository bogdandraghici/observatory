import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core'
import { calculateTotal, extendWithCosts } from '../../../utils/calcCosts'
import { DashboardService } from '../../../services/dashboard.service'

@Component({
    selector: 'error-rate-widget',
    templateUrl: './error-rate.component.html',
    styleUrl: './error-rate.component.scss',
    standalone: false
})
export class ErrorRateComponent implements OnInit, OnDestroy, OnChanges {
  @Input() hours: number = 7 * 24
  @Input() appId: string = null
  totalRuns = 0
  totalErrors = 0
  totalSuccess = 0
  errorRate = 0
  chartData: any
  chartOptions: any

  constructor(
    private analyticsService: DashboardService,
    public el: ElementRef,
  ) {}

  populateData(appId: any, hours: any): void {
    this.analyticsService.getUsageRunAgents(appId, hours).then((data) => {
      const models = Array.isArray(data) ? extendWithCosts(data) : []
      this.totalRuns = calculateTotal(models, 'runs')
      this.totalErrors = calculateTotal(models, 'errors')
      this.totalSuccess = calculateTotal(models, 'success')
      this.errorRate = this.totalRuns > 0
        ? Math.round((this.totalErrors / this.totalRuns) * 1000) / 10
        : 0
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

  getChartData(): any {
    const documentStyle = getComputedStyle(document.documentElement)
    return {
      labels: ['Success', 'Errors'],
      datasets: [
        {
          data: [this.totalSuccess, this.totalErrors],
          backgroundColor: [
            documentStyle.getPropertyValue('--green-400'),
            documentStyle.getPropertyValue('--red-400'),
          ],
          borderWidth: 0,
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--green-300'),
            documentStyle.getPropertyValue('--red-300'),
          ],
        },
      ],
    }
  }

  getChartOptions(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: getComputedStyle(document.documentElement)
              .getPropertyValue('--text-color')
              .trim(),
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 16,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          enabled: true,
        },
      },
    }
  }

}
