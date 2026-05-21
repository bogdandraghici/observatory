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

  // Custom Chart.js plugin: renders each row's label just past the bar's
  // right edge so the bars stay left-aligned and the labels flow into
  // the empty horizontal space on the right.
  chartPlugins: any[] = [
    {
      id: 'endpointInlineLabels',
      afterDatasetsDraw: (chart: any) => {
        const meta = chart.getDatasetMeta?.(0)
        if (!meta?.data?.length) { return }
        const labels = chart.data?.labels ?? []
        const { ctx, chartArea } = chart
        if (!ctx || !chartArea) { return }

        const isDark = document.documentElement.classList.contains('flowx-dark')
        ctx.save()
        ctx.font = '11px "Open Sans", system-ui, sans-serif'
        ctx.fillStyle = isDark ? '#ffffff' : '#000000'
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'left'

        meta.data.forEach((bar: any, i: number) => {
          const raw = labels[i]
          if (raw == null) { return }
          const text = String(raw)

          // 8px gap after the bar's right edge.
          const x = bar.x + 8
          const y = bar.y

          // Truncate if the label would overflow the chart area on the right.
          const maxWidth = Math.max(0, chartArea.right - x - 4)
          let display = text
          if (ctx.measureText(display).width > maxWidth) {
            while (display.length > 1 && ctx.measureText(display + '…').width > maxWidth) {
              display = display.slice(0, -1)
            }
            display += '…'
          }

          ctx.fillText(display, x, y)
        })
        ctx.restore()
      },
    },
  ]

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
        padding: { top: 4, bottom: 4, left: 6, right: 12 },
      },
      scales: {
        x: {
          beginAtZero: true,
          // Reserve roughly half the chart width for inline labels so even
          // the longest bar has room on its right for its label to flow in.
          grace: '120%',
          ticks: { display: false },
          border: { display: false },
          grid: { display: false, drawBorder: false },
        },
        y: {
          title: { display: false, text: 'Requests' },
          ticks: { display: false },              // labels are painted next to each bar by the inline plugin
          border: { display: false },
          grid: { display: false, drawBorder: false, drawTicks: false },
          // Collapse the y-axis gutter so the bars start flush with the
          // canvas left edge (which is the card's 24px content edge).
          afterFit: (scale: any) => {
            scale.width = 0
            scale.paddingLeft = 0
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
          backgroundColor: this.data.map((d) => this.getBackColor(d.status)),
          borderColor: this.data.map((d) => this.getBorderColor(d.status)),
          borderWidth: 1,
          borderRadius: 8,           // fuller pill shape
          borderSkipped: false,      // round all four corners, not just the bar end
          barThickness: 22,          // consistent bar height regardless of category spacing
          categoryPercentage: 0.9,   // slight gap between bars
        },
      ],
    }
  }
  onStateChange(_____event: any): void {
    this.populateData()
  }

  // FlowX palette tints (rgba) for HTTP-status buckets:
  //   1xx informational → neutrals-500
  //   2xx success       → green-500
  //   3xx redirect      → orange-500
  //   4xx client error  → yellow-500
  //   5xx server error  → red-500
  getBackColor(value: number): string {
    if (value < 200) { return 'rgba(100, 116, 139, 0.20)' } // neutrals-500
    if (value < 300) { return 'rgba(0, 128, 96, 0.20)' }    // green-500
    if (value < 400) { return 'rgba(253, 107, 28, 0.20)' }  // orange-500
    if (value < 500) { return 'rgba(254, 185, 19, 0.20)' }  // yellow-500
    return 'rgba(230, 34, 0, 0.20)'                          // red-500
  }

  getBorderColor(value: number): string {
    if (value < 200) { return 'rgba(100, 116, 139, 0.80)' } // neutrals-500
    if (value < 300) { return 'rgba(0, 128, 96, 0.80)' }    // green-500
    if (value < 400) { return 'rgba(253, 107, 28, 0.80)' }  // orange-500
    if (value < 500) { return 'rgba(254, 185, 19, 0.80)' }  // yellow-500
    return 'rgba(230, 34, 0, 0.80)'                          // red-500
  }

}
