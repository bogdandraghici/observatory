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
    selector: 'third-values-widget',
    templateUrl: './third-values-card.component.html',
    styleUrl: './third-values-card.component.scss',
    standalone: false
})
export class ThirdValuesCardComponent implements OnInit, OnDestroy, OnChanges {
  @Input() values: any[] = [
    { label: 'LQ', num: 80.0 },
    { label: 'Median', num: 100.0 },
    { label: 'UQ', num: 120.0 },
  ]
  @Input() appId: string = null
  @Input() title = 'Response times'
  @Input() suffix = '(ms)'
  @Input() data: any[] = []

  chartData: any
  chartOptions: any

  constructor(public el: ElementRef) {}

  ngOnChanges(_____changes: SimpleChanges): void {
    this.chartOptions = this.getOptions()
    this.chartData = this.getData()
  }

  ngOnInit(): void {
    this.chartOptions = this.getOptions()
    this.chartData = this.getData()
  }
  ngOnDestroy(): void {}

  getOptions(): any {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--text-color')
    const _____textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary',
    )
    const _____surfaceBorder = documentStyle.getPropertyValue('--surface-border')
    return {
      maintainAspectRatio: false,
      aspectRatio: 3,
      plugins: {
        legend: {
          display: false,
          labels: {
            display: false,
            color: textColor,
          },
          datalabels: {
            display: false,
          },
        },
      },
      layout: {
        padding: -10,
      },
      scales: {
        x: {
          ticks: {
            display: false,
          },
          grid: {
            display: false,
            drawBorder: false,
          },
        },
        y: {
          border: {
            display: false,
          },
          ticks: {
            display: false,
          },
          grid: {
            display: false,
            drawBorder: false,
          },
        },
      },
    }
  }

  getData(): any {
    const documentStyle = getComputedStyle(document.documentElement)
    const data = this.data || []
    return {
      labels: data.map((d) => d.date),
      datasets: [
        {
          label: 'Requests',
          data: data.map((d) => d.avg_response),
          fill: true,
          borderColor: documentStyle.getPropertyValue('--primary-500') +'cc',
          borderWidth: 3,
          tension: 0.4,
          radius:0,
          backgroundColor: documentStyle.getPropertyValue('--primary-200') +'cc',
        },
      ],
    }
  }

}
