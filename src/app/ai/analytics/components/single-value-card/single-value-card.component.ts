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
    return {
      maintainAspectRatio: false,
      aspectRatio: 3,
      responsive: true,
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
      layout: { padding: 0 },
      scales: {
        x: {
          display: false,
          ticks: { display: false },
          grid: { display: false, drawBorder: false },
        },
        y: {
          display: false,
          border: { display: false },
          ticks: { display: false },
          grid: { display: false, drawBorder: false },
          min: 0,
          grace: '10%',
        },
      },
    }
  }

  getData(): any {
    this.value = this.useAvg ? calculateAverage(this.data, this.dataProperty) : calculateTotal(this.data, this.dataProperty)
    this.trendValue = calculateTrend(this.data, this.dataProperty)
    // FlowX uses blue-500 (#006bd8) on light surfaces and blue-400
    // (#3389e0) on dark — match so the stroke pops in both modes.
    const isDark = document.documentElement.classList.contains('flowx-dark')
    const strokeHex = isDark ? '#3389e0' : '#006bd8'
    const strokeRgb = isDark ? '51, 137, 224' : '0, 107, 216'
    return {
      labels: this.data?.map((d) => d.date),
      datasets: [
        {
          label: this.title,
          data: this.data?.map((d) => d[this.dataProperty]),
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
            const chart = context.chart
            const { ctx, chartArea } = chart
            if (!chartArea) { return `rgba(${strokeRgb}, 0.25)` }
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
            gradient.addColorStop(0, `rgba(${strokeRgb}, 0.45)`)
            gradient.addColorStop(1, `rgba(${strokeRgb}, 0)`)
            return gradient
          },
        },
      ],
    }
  }

}
