import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core'
import { calculateAverage, calculateTotal, calculateTrend } from '../../../utils/calcCosts'


@Component({
    selector: 'single-value-widget',
    templateUrl: './single-value-card.component.html',
    styleUrl: './single-value-card.component.scss',
    standalone: false
})
export class SingleValueCardComponent implements OnInit, OnDestroy, OnChanges {
  @Input() value: number = 7 * 24
  @Input() title = 'Requests'
  @Input() dataProperty = 'couny'
  @Input() data: any[] = []
  @Input() trendValue = 10
  @Input() showTrend = true
  @Input() useAvg = false

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
            display: false
          }
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
    this.value= this.useAvg ?  calculateAverage(this.data, this.dataProperty):  calculateTotal(this.data, this.dataProperty)
    this.trendValue = calculateTrend(this.data, this.dataProperty)
    return {
      labels: this.data?.map((d) => d.date),
      datasets: [
        {
          label: 'Requests',
          data: this.data?.map((d) => d[this.dataProperty]),
          fill: true,
          borderColor: documentStyle.getPropertyValue('--primary-500')+'cc',
          borderWidth: 3,
          tension: 0.4,
          radius:0,
          backgroundColor: documentStyle.getPropertyValue('--primary-200')+'cc',
        },
      ],
    }
  }

}
