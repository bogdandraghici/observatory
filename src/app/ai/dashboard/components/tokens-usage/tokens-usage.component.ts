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
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--text-color')
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary',
    )
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border')

    const labels = this.models?.map((e) => moment.utc(e.ts).local())
    const data = this.models?.map((e) => +e.cnt)

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Tokens',
          data,
          fill: true,
          backgroundColor: documentStyle.getPropertyValue('--green-300')+ "AA",
          borderColor: documentStyle.getPropertyValue('--green-300')+"FF",
          color: textColor,
          tension: 0.2,
          pointRadius: 1,
          pointHoverRadius: 5,

        },
      ],
    }
    this.chartOptions = {
      tooltips: true,
      responsive: true,
      indexAxis: 'x',
      maintainAspectRatio: true,
      aspectRatio: 6,
      plugins: {
        legend: {
          display:false,

        },
        tooltip: {
          enabled: true, // <-- this option disables tooltips
        },
      },
      scales: {
        x: {
          type: 'timeseries',
          grid: {
            display: false,
          },
          ticks: {
            color: textColorSecondary,
            align: 'center',
            font: {
              size: 10,
              weight:'bold',
              lineHeight: 1.2,
            },
          },
        },
        y: {
          display: true,
          stacked: false,
          grid: {
            display: true,
            color: surfaceBorder,
          },
          ticks: {
            color: textColorSecondary,
            align: 'center',
            font: {
              size: 10,
              weight:'bold',
              lineHeight: 1.2,
            },
          },
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
