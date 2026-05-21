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

  getOptionsRequestsNo(): any {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--text-color')
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary',
    )
    const _____surfaceBorder = documentStyle.getPropertyValue('--surface-border')
    return {
      maintainAspectRatio: false,
      aspectRatio: 2,
      plugins: {
        legend: {
          display: false,
          labels: {
            display: false,
            color: textColor,
          },
          datalabels: {
            display: false
          }
        },
      },
      layout: {
        padding: 0,
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            display: false,
          },
          grid: {
            display: false,
            drawBorder: true,
          },
        },
        y: {
          stacked: true,
          title: {
            display: true,
            text: 'Requests',
            color: textColor,
          },
          ticks: {
            display: true,
            color: textColorSecondary,
          },
          grid: {
            display: false,
            drawBorder: true,
          },
        },
      },
    }
  }

  getDataRequestsNo(): any {
    const documentStyle = getComputedStyle(document.documentElement)
    return {
      labels: this.data?.map((d) => d.date),
      datasets: [
        {
          label: 'Requests',
          data: this.data?.map((d) => d.count_requests),
          fill: true,
          borderColor: documentStyle.getPropertyValue('--primary-500')+ 'cc',
          borderWidth: 3,
          tension: 0.4,
          radius:0,
          backgroundColor: documentStyle.getPropertyValue('--primary-200')+ 'cc',
        },
        {
          label: 'Users',
          data: this.data?.map((d) => d.count_users),
          fill: true,
          borderColor: documentStyle.getPropertyValue('--gray-500')+ 'cc',
          borderWidth: 3,
          tension: 0.4,
          radius:0,
          backgroundColor: documentStyle.getPropertyValue('--gray-200')+ 'cc',
        },
      ],
    }
  }




  getOptionsRequestsTime(): any {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--text-color')
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary',
    )
    const _____surfaceBorder = documentStyle.getPropertyValue('--surface-border')
    return {
      maintainAspectRatio: false,
      aspectRatio: 2,
      plugins: {
        legend: {
          display: false,
          labels: {
            display: false,
            color: textColor,
          },
          datalabels: {
            display: false
          }
        },
      },
      layout: {
        padding: 0,
      },
      scales: {
        x: {
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
            display: true,
            text: 'Response Time (ms)',
            color: textColor,
          },
          ticks: {
            display: true,
            color: textColorSecondary,
          },
          grid: {
            display: false,
            drawBorder: true,
          },
        },
      },
    }
  }

  getDataRequestsTime(): any {
    const documentStyle = getComputedStyle(document.documentElement)
    return {
      labels: this.data?.map((d) => d.date),
      datasets: [
        {
          label: 'Time(ms)',
          data: this.data?.map((d) => d.avg_response),
          fill: true,
          borderColor: documentStyle.getPropertyValue('--gray-500') + 'cc',
          borderWidth: 3,
          tension: 0.4,
          radius:0,
          backgroundColor: documentStyle.getPropertyValue('--gray-200')+ 'cc',
        },
      ],
    }
  }


}
