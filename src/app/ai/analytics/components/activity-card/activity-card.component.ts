import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core'



@Component({
    selector: 'activity-widget',
    templateUrl: './activity-card.component.html',
    styleUrl: './activity-card.component.scss',
    standalone: false
})
export class ActivityCardComponent implements OnInit, OnDestroy, OnChanges {
  @Input() title = 'Activity'
  @Input() data: any[] = []

  @Input() successRate: any
  @Input() period: any = 30

  chartDataReqNo: any
  chartOptionsReqNo: any

  chartDataReqTime: any
  chartOptionsReqTime: any


  constructor(public el: ElementRef) {}

  ngOnChanges(_____changes: SimpleChanges): void {
    this.chartOptionsReqNo = this.getOptionsRequestsNo()
    this.chartDataReqNo = this.getDataRequestsNo()
    this.chartOptionsReqTime = this.getOptionsRequestsTime()
    this.chartDataReqTime = this.getDataRequestsTime()
  }

  ngOnInit(): void {
    this.chartOptionsReqNo = this.getOptionsRequestsNo()
    this.chartDataReqNo = this.getDataRequestsNo()
    this.chartOptionsReqTime = this.getOptionsRequestsTime()
    this.chartDataReqTime = this.getDataRequestsTime()
  }
  ngOnDestroy(): void {}

  // Primary blue — light mode uses flowx-blue-500, dark mode lifts to
  // flowx-blue-400 (the FlowX dark-mode interactive token) so the
  // stroke and the translucent fill both pop on a dark surface.
  private bluePrimary(): { hex: string; rgb: string } {
    const isDark = document.documentElement.classList.contains('flowx-dark')
    return isDark
      ? { hex: '#3389e0', rgb: '51, 137, 224' }
      : { hex: '#006bd8', rgb: '0, 107, 216' }
  }

  // Secondary blue (for the second stacked chart). One step deeper in
  // light mode (blue-700) and a paler counterpart in dark mode (blue-300)
  // so the two stacked charts remain distinct.
  private blueSecondary(): { hex: string; rgb: string } {
    const isDark = document.documentElement.classList.contains('flowx-dark')
    return isDark
      ? { hex: '#8abbed', rgb: '138, 187, 237' }   // blue-200
      : { hex: '#004c99', rgb: '0, 76, 153' }      // blue-700
  }

  private flowxTooltip(): any {
    return {
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
    }
  }

  getOptionsRequestsNo(): any {
    return {
      maintainAspectRatio: false,
      aspectRatio: 2,
      responsive: true,
      interaction: { mode: 'nearest', intersect: false, axis: 'x' },
      plugins: {
        legend: { display: false },
        datalabels: { display: false },
        tooltip: this.flowxTooltip(),
      },
      layout: { padding: 0 },
      scales: {
        x: {
          ticks: { display: false },
          border: { display: false },
          grid: { display: false, drawBorder: false },
        },
        y: {
          beginAtZero: true,
          border: { display: false },
          ticks: {
            color: '#64748b',
            font: { size: 10, family: '"Open Sans", system-ui, sans-serif' },
            maxTicksLimit: 3,
            padding: 4,
          },
          grid: {
            color: 'rgba(99, 116, 139, 0.10)',
            drawBorder: false,
            drawTicks: false,
          },
          grace: '10%',
        },
      },
    }
  }

  getDataRequestsNo(): any {
    return {
      labels: this.data?.map((d) => d.date),
      datasets: [
        {
          label: 'Requests',
          data: this.data?.map((d) => d.count_requests),
          fill: true,
          borderColor: this.bluePrimary().hex,
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: this.bluePrimary().hex,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
          backgroundColor: (context: any) => {
            const chart = context.chart
            const { ctx, chartArea } = chart
            const rgb = this.bluePrimary().rgb
            if (!chartArea) { return `rgba(${rgb}, 0.25)` }
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
            gradient.addColorStop(0, `rgba(${rgb}, 0.45)`)
            gradient.addColorStop(1, `rgba(${rgb}, 0)`)
            return gradient
          },
        },
      ],
    }
  }




  getOptionsRequestsTime(): any {
    return {
      maintainAspectRatio: false,
      aspectRatio: 2,
      responsive: true,
      interaction: { mode: 'nearest', intersect: false, axis: 'x' },
      plugins: {
        legend: { display: false },
        datalabels: { display: false },
        tooltip: this.flowxTooltip(),
      },
      layout: { padding: 0 },
      scales: {
        x: {
          ticks: { display: false },
          border: { display: false },
          grid: { display: false, drawBorder: false },
        },
        y: {
          beginAtZero: true,
          border: { display: false },
          ticks: {
            color: '#64748b',
            font: { size: 10, family: '"Open Sans", system-ui, sans-serif' },
            maxTicksLimit: 3,
            padding: 4,
          },
          grid: {
            color: 'rgba(99, 116, 139, 0.10)',
            drawBorder: false,
            drawTicks: false,
          },
          grace: '10%',
        },
      },
    }
  }

  getDataRequestsTime(): any {
    return {
      labels: this.data?.map((d) => d.date),
      datasets: [
        {
          label: 'Response time (ms)',
          data: this.data?.map((d) => d.avg_response),
          fill: true,
          borderColor: this.blueSecondary().hex,
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: this.blueSecondary().hex,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
          backgroundColor: (context: any) => {
            const chart = context.chart
            const { ctx, chartArea } = chart
            const rgb = this.blueSecondary().rgb
            if (!chartArea) { return `rgba(${rgb}, 0.25)` }
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
            gradient.addColorStop(0, `rgba(${rgb}, 0.45)`)
            gradient.addColorStop(1, `rgba(${rgb}, 0)`)
            return gradient
          },
        },
      ],
    }
  }


}
