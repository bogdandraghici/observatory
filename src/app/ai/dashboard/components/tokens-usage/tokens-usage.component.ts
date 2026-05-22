import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core'
import { calculateTotal } from '../../../utils/calcCosts'
import { DashboardService } from '../../../services/dashboard.service'
import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'
import { Subscription, debounceTime } from 'rxjs'
import moment from 'moment'
import 'chartjs-adapter-moment'

@Component({
    selector: 'tokens-usage-widget',
    templateUrl: './tokens-usage.component.html',
    styleUrl: './tokens-usage.component.scss',
    standalone: false
})
export class TokensUsageComponent implements OnInit, OnDestroy, OnChanges {
  @Input() hours = 1
  @Input() appId: string = null
  models!: any[]
  data: any
  options: any
  totalTokens: any = 0


  chartData: any
  chartOptions: any
  subscription!: Subscription

  constructor(
    private analyticsService: DashboardService,
    public el: ElementRef,
    public layoutService: LayoutService,
  ) {
    this.subscription = this.layoutService.configUpdate$
      .pipe(debounceTime(25))
      .subscribe((_____config) => {
        this.initChart()
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

  populateData(appId: any, hours: any): void {
    this.analyticsService.getTimeSeriesAll(appId, hours).then((data) => {
      this.models = data
      this.totalTokens = calculateTotal(this.models, 'cnt')
      this.initChart()
    })
  }


  initChart(): void {
    const isDark = document.documentElement.classList.contains('flowx-dark')
    const strokeHex = isDark ? '#3389e0' : '#006bd8'        // flowx-blue-400 / -500
    const strokeRgb = isDark ? '51, 137, 224' : '0, 107, 216'

    const labels = this.models?.map((e) => moment.utc(e.ts).local())
    const data = this.models?.map((e) => +e.cnt)

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Tokens',
          data,
          fill: true,
          borderColor: strokeHex,
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: strokeHex,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
          backgroundColor: (context: any) => {
            const { ctx, chartArea } = context.chart
            if (!chartArea) { return `rgba(${strokeRgb}, 0.25)` }
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
            gradient.addColorStop(0, `rgba(${strokeRgb}, 0.45)`)
            gradient.addColorStop(1, `rgba(${strokeRgb}, 0)`)
            return gradient
          },
        },
      ],
    }
    this.chartOptions = {
      responsive: true,
      indexAxis: 'x',
      maintainAspectRatio: true,
      aspectRatio: 6,
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
        },
      },
      scales: {
        x: {
          type: 'timeseries',
          border: { display: false },
          grid: { display: false },
          ticks: {
            color: '#64748b',
            font: { size: 10, family: '"Open Sans", system-ui, sans-serif' },
            maxRotation: 0,
          },
        },
        y: {
          beginAtZero: true,
          border: { display: false },
          grid: {
            color: 'rgba(99, 116, 139, 0.10)',
            drawBorder: false,
            drawTicks: false,
          },
          ticks: {
            color: '#64748b',
            font: { size: 10, family: '"Open Sans", system-ui, sans-serif' },
            maxTicksLimit: 4,
            padding: 4,
          },
          grace: '10%',
        },
      },
    }
  }




  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
