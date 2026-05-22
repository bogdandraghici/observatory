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
    selector: 'agent-usage-widget',
    templateUrl: './agent-usage.component.html',
    styleUrl: './agent-usage.component.scss',
    standalone: false
})
export class AgentUsageComponent implements OnInit, OnDestroy, OnChanges {
  @Input() hours = 1
  @Input() appId: string = null
  models!: any[]
  data: any
  options: any
  totalRuns: any = 0
  totalErrors: any = 0

  constructor(
    private analyticsService: DashboardService,
    public el: ElementRef,
  ) {}

  populateData(appId: any, hours: any): void {
    this.analyticsService.getUsageRunAgents(appId, hours).then((data) => {
      this.models = data
      this.models = extendWithCosts(this.models)
      this.models.forEach((item) => {
        item.chartData = this.getData(item)
        item.chartOptions = this.getOptions(item)
      })
      this.totalRuns = calculateTotal(this.models, 'runs')
      this.totalErrors = calculateTotal(this.models, 'errors')
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
            weight: 'bold',
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
    // Semantic green / red for the success-vs-errors split, lifted in
    // dark mode so the pastel doesn't disappear against the dark card.
    // (Following the dark-mode rule in CLAUDE.md.)
    const isDark = document.documentElement.classList.contains('flowx-dark')
    const successFill = isDark ? '#54aa94' : '#008060'   // flowx-green-300 / -500
    const errorFill   = isDark ? '#ee6b54' : '#e62200'   // flowx-red-400 / -500
    const returnValue = {
      labels: [row.name],
      datasets: [
        {
          label: 'Success',
          backgroundColor: successFill,
          data: [row.success],
          borderWidth: 0,
          borderRadius: [
            { topLeft: 5, topRight: 0, bottomLeft: 5, bottomRight: 0 },
          ],
          borderSkipped: false,
        },
        {
          label: 'Error',
          backgroundColor: errorFill,
          data: [row.errors],
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
