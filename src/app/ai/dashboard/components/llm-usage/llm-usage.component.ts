import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core'
import { calculateTotal, extendWithCosts } from '../../../utils/calcCosts'
import { DashboardService } from '../../../services/dashboard.service'

@Component({
    selector: 'llm-usage-widget',
    templateUrl: './llm-usage.component.html',
    styleUrl: './llm-usage.component.scss',
    standalone: false
})
export class LLMUsageComponent implements OnInit, OnDestroy, OnChanges {
  @Input() hours: number = 7*24
  @Input() appId: string = null
  models!: any[]

  totalTokens: any
  totalCost: any

  constructor(
    private analyticsService: DashboardService,
    public el: ElementRef,
  ) {}

  populateData(appId: any, hours: any): void {
    if (!this.appId && hours) {return}
    this.analyticsService.getUsageRuns(appId, hours).then((data) => {
      this.models = data.filter((u) => u.type === 'llm')
      this.models = extendWithCosts(this.models)
      this.models.forEach((item) => {
        item.chartData = this.getData(item)
        item.chartOptions = this.getOptions(item)
      })
      this.totalTokens = calculateTotal(this.models, 'tokens')
      this.totalCost = calculateTotal(this.models, 'cost')
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

  ngOnDestroy(): void {}

  getOptions(row: any): any {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--text-color').trim()
    return {
      tooltips: true,
      responsive: true,
      indexAxis: 'y',
      maintainAspectRatio: false,
      aspectRatio: 2,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          fullSize: true,
          text: row.name,
          align: 'start',
          color: textColor,
          padding: {
            top: 0,
            bottom: 0,
          },
          font: {
            size: 10,
            weight:'bold'
          },
        },
        tooltip: {
          enabled: true, // <-- this option disables tooltips
        },
      },
      scales: {
        x: {
          display: false,
          stacked: true,
          grid: {
            display: false,
          },
        },
        y: {
          display: false, // <-- this option disables title
          stacked: true,
          grid: {
            display: false,
          },
          ticks: {
            align: 'center',
            font: {
              size: 12,
              lineHeight: 1.2,
            },
          },
        },
      },
    }
  }
  getData(row: any): any {
    // Two stacked-bar shades from the FlowX blue palette — saturated
    // blue-500 (light) / blue-400 (dark) for the completion half, a
    // softer blue-300 / blue-200 for the prompt half. Same scheme in
    // both modes; only the absolute shade lifts in dark mode.
    const isDark = document.documentElement.classList.contains('flowx-dark')
    const completionFill = isDark ? '#3389e0' : '#006bd8'  // blue-400 / -500
    const promptFill     = isDark ? '#8abbed' : '#549ce5'  // blue-200 / -300
    const returnValue = {
      labels: [row.name],
      datasets: [
        {
          label: 'Completion',
          backgroundColor: completionFill,
          data: [row.completion_tokens],
          borderWidth: 0,
          borderRadius: [
            { topLeft: 5, topRight: 0, bottomLeft: 5, bottomRight: 0 },
          ],
          borderSkipped: false,
        },
        {
          label: 'Prompt',
          backgroundColor: promptFill,
          data: [row.prompt_tokens],
          borderWidth: 0,
          borderRadius: [
            { topLeft: 0, topRight: 5, bottomLeft: 0, bottomRight: 5 },
          ],
          borderSkipped: false,
        },
      ],
    }

    return returnValue
  }

}
