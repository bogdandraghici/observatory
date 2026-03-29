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
    selector: 'action-usage-widget',
    templateUrl: './action-usage.component.html',
    styleUrl: './action-usage.component.scss',
    standalone: false
})
export class ActionUsageComponent implements OnInit, OnDestroy, OnChanges {
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
    this.analyticsService.getUsageActions(appId, hours).then((data) => {
      this.models = data?.items
      this.models = extendWithCosts(this.models)
      this.models.forEach((item) => {
        item.chartData = this.getData(item)
        item.chartOptions = this.getOptions(item)
      })
      this.totalRuns = calculateTotal(this.models, 'total_cnt')
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['hours']?.currentValue || this.hours) &&
      (changes['appId']?.currentValue || this.appId)
    ) {
      this.populateData(this.appId, this.hours)
    }
  }

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
          stacked: false,
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
    const documentStyle = getComputedStyle(document.documentElement)
    const returnValue = {
      labels: [row.name],
      datasets: [
        {
          label: 'Success',
          backgroundColor: documentStyle.getPropertyValue('--green-300'),
          data: [row.success],
          borderWidth: 0,
          borderRadius: [
            { topLeft: 5, topRight: 5, bottomLeft: 5, bottomRight: 5 },
          ],
          borderSkipped: false,
        },
        {
          label: 'Error',
          backgroundColor: documentStyle.getPropertyValue('--red-300'),
          data: [row.errors],
          borderWidth: 0,
          borderRadius: [
            { topLeft: 5, topRight: 5, bottomLeft: 5, bottomRight: 5 },
          ],
          borderSkipped: false,
        },
      ],
    }

    return returnValue
  }

}
