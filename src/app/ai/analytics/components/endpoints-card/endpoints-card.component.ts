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
    selector: 'endpoints-widget',
    templateUrl: './endpoints-card.component.html',
    styleUrl: './endpoints-card.component.scss',
    standalone: false
})
export class EndpointsCardComponent implements OnInit, OnDestroy, OnChanges {
  @Input() agent: any = null
  @Input() title = 'Activity'
  @Input() days = 30

  data: any[] = []

  @Input() successRate: any
  @Input() period: any = 'month'

  chartDataEndNo: any
  chartOptionsEndNo: any

  stateTypes: any[] = [
    { label: 'All', value: 'all' },
    { label: 'Success', value: 'success' },
    { label: 'Client', value: 'client' },
    { label: 'Server', value: 'server' },
  ]
  valueType = 'all'

  constructor(
    public el: ElementRef,
    private metricsService: MetricsService,
  ) {}

  populateData(): void {
    if (!this.days) {
      return
    }
    let start,
      end = 0
    if (this.valueType === 'all') {
      start = 0
      end = 1000
    } else if (this.valueType === 'success') {
      start = 200
      end = 299
    } else if (this.valueType === 'client') {
      start = 400
      end = 499
    } else if (this.valueType === 'server') {
      start = 500
      end = 599
    }
    this.metricsService
      .getEndpointsAll(this.days, start, end, this.agent)
      .then((data) => {
        this.data = data
        this.chartOptionsEndNo = this.getOptionsEndpointsNo()
        this.chartDataEndNo = this.getDataEndpointsNo()
      })
  }

  ngOnChanges(_____changes: SimpleChanges): void {
    this.populateData()
  }

  ngOnInit(): void {
    this.chartOptionsEndNo = this.getOptionsEndpointsNo()
    this.chartDataEndNo = this.getDataEndpointsNo()
  }
  ngOnDestroy(): void {}

  getOptionsEndpointsNo(): any {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--text-color').trim()

    return {
      indexAxis: 'y',
      maintainAspectRatio: false,
      aspectRatio: 0.5,
      plugins: {
        legend: {
          display: false,
          labels: {
            display: true,
            color: textColor,
          },
          datalabels: {
            display: true,
          },
        },
      },
      layout: {
        padding: 0,
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            display: false,
          },
          grid: {
            display: false,
            drawBorder: true,
          },
        },
        y: {
          title: {
            display: false,
            text: 'Requests',
          },
          ticks: {
            display: true,
            mirror: true,
            z: 100,
            color: textColor,
          },
          grid: {
            display: false,
            drawBorder: true,
          },
        },
      },
    }
  }

  getMethod(value: number): string {
    switch (value) {
      case 0:
        return 'GET'
      case 1:
        return 'POST'
      case 2:
        return 'PUT'
      case 3:
        return 'PATCH'
      case 4:
        return 'DELETE'
      case 5:
        return 'OPTIONS'
      case 6:
        return 'CONNECT'
      case 7:
        return 'HEAD'
      case 8:
        return 'TRACE'
      default:
        return 'GET'
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


  getDataEndpointsNo(): any {
    const _____documentStyle = getComputedStyle(document.documentElement)
    return {
      labels: this.data.map(
        (d) => `${d.count_requests} ${this.getMethod(d.method)} ${d.path}`,
      ),
      datasets: [
        {
          label: 'Requests',
          data: this.data.map((d) => d.count_requests),
          fill: true,
          borderColor: this.data.map((d) => this.getBorderColor(d.status)),
          borderWidth: 1,
          borderRadius: 4,
          backgroundColor: this.data.map((d) => this.getBackColor(d.status)),
        },
      ],
    }
  }
  onStateChange(_____event: any): void {
    this.populateData()
  }

  getBackColor(value: number): string {
    const documentStyle = getComputedStyle(document.documentElement)
    if (value < 200) {
      return documentStyle.getPropertyValue('--gray-200') + 'cc'
    } else if (value < 300) {
      return documentStyle.getPropertyValue('--green-200') + 'cc'
    } else if (value < 400) {
      return documentStyle.getPropertyValue('--orange-200') + 'cc'
    } else if (value < 500) {
      return documentStyle.getPropertyValue('--yellow-200') + 'cc'
    } else {
      return documentStyle.getPropertyValue('--red-200') + 'cc'
    }
  }

  getBorderColor(value: number): string {
    const documentStyle = getComputedStyle(document.documentElement)
    if (value < 200) {
      return documentStyle.getPropertyValue('--gray-500') + 'cc'
    } else if (value < 300) {
      return documentStyle.getPropertyValue('--green-500') + 'cc'
    } else if (value < 400) {
      return documentStyle.getPropertyValue('--orange-500') + 'cc'
    } else if (value < 500) {
      return documentStyle.getPropertyValue('--yellow-500') + 'cc'
    } else {
      return documentStyle.getPropertyValue('--red-500') + 'cc'
    }
  }

}
