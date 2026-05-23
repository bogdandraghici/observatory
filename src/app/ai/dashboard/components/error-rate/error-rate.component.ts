import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core'
import { Subscription, debounceTime } from 'rxjs'

import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'
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

  private themeSubscription?: Subscription

  constructor(
    private analyticsService: DashboardService,
    public el: ElementRef,
    private layoutService: LayoutService,
  ) {
    this.themeSubscription = this.layoutService.configUpdate$
      .pipe(debounceTime(25))
      .subscribe(() => {
        if (this.totalRuns > 0) {
          this.chartData = this.getChartData()
          this.chartOptions = this.getChartOptions()
        }
      })
  }

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

  ngOnDestroy(): void {
    this.themeSubscription?.unsubscribe()
  }

  getChartData(): any {
    const isDark = document.documentElement.classList.contains('flowx-dark')

    // Matches agent-usage so the two cards read as the same metric.
    //   Light: green-400 #339980, red-500 #e62200
    //   Dark:  green-300 #54aa94, red-300 #ee6b54
    const successFill = isDark ? '#54aa94' : '#339980'
    const errorFill   = isDark ? '#ee6b54' : '#e62200'
    const successHover = isDark ? '#339980' : '#008060'  // one step deeper
    const errorHover   = isDark ? '#eb4e33' : '#d11f00'  // one step deeper

    return {
      labels: ['Success', 'Errors'],
      datasets: [
        {
          data: [this.totalSuccess, this.totalErrors],
          backgroundColor: [successFill, errorFill],
          borderWidth: 0,
          hoverBackgroundColor: [successHover, errorHover],
        },
      ],
    }
  }

  getChartOptions(): any {
    const isDark = document.documentElement.classList.contains('flowx-dark')
    // FlowX text-primary: neutrals-900 in light, neutrals-50 in dark.
    // Resolve to literal hex here because --flowx-* tokens are scoped to
    // .layout-wrapper/.ai-page and Chart.js needs a concrete color.
    const textColor = isDark ? '#f7f8f9' : '#1d232c'

    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: textColor,
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
