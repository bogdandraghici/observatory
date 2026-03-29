import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core'
import { extendWithCosts } from '../../../utils/calcCosts'
import { DashboardService } from '../../../services/dashboard.service'

@Component({
    selector: 'user-usage-widget',
    templateUrl: './user-usage.component.html',
    styleUrl: './user-usage.component.scss',
    standalone: false
})
export class UserUsageComponent implements OnInit, OnDestroy, OnChanges {
  @Input() hours = 1
  @Input() appId: string = null
  models!: any[]
  data: any
  options: any
  totalUsers: any = 0


  constructor(
    private analyticsService: DashboardService,
    public el: ElementRef,
  ) {}

  populateData(appId: any,hours: any): void {
    if (!this.appId) {return}
    this.analyticsService.getUsageUsers(appId,hours).then((data) => {
      this.models = data
      this.models = extendWithCosts(this.models)
      this.models.forEach((item) => {
        item.chartData = this.getData(item)
      })
      this.totalUsers = this.models.length
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

  ngOnInit(): void {

    this.options = {
      tooltips: false,
      responsive: true,
      indexAxis: 'y',
      maintainAspectRatio: false,
      aspectRatio: 6,
      plugins: {
        legend: {
          display: false,
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
            { topLeft: 5, topRight: 0, bottomLeft: 5, bottomRight: 0 },
          ],
          borderSkipped: false,
        },
        {
          label: 'Error',
          backgroundColor: documentStyle.getPropertyValue('--red-300'),
          data: [row.errors],
          borderWidth: 0,
          borderRadius: [
            { topLeft: 5, topRight: 0, bottomLeft: 5, bottomRight: 0 },
          ],
          borderSkipped: false,
        },
      ],
    }

    return returnValue
  }

}
