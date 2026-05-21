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
    const data = this.data || []
    const isDark = document.documentElement.classList.contains('flowx-dark')
    const strokeHex = isDark ? '#3389e0' : '#006bd8'   // flowx-blue-400 / -500
    const strokeRgb = isDark ? '51, 137, 224' : '0, 107, 216'
    return {
      labels: data.map((d) => d.date),
      datasets: [
        {
          label: this.title,
          data: data.map((d) => d.avg_response),
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
