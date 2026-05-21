import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core'
import { calculateTotal } from '../../../utils/calcCosts'
import { DashboardService } from '../../../services/dashboard.service'

@Component({
    selector: 'frustration-usage-widget',
    templateUrl: './frustration-usage.component.html',
    styleUrl: './frustration-usage.component.scss',
    standalone: false
})
export class FrustrationUsageComponent implements OnInit, OnDestroy, OnChanges {
  @Input() hours = 1
  @Input() appId: string = null
  models!: any
  data: any
  options: any
  totalRuns: any = 0
  totalErrors: any = 0

  constructor(
    private analyticsService: DashboardService,
    public el: ElementRef,
  ) {}

  populateData(appId: any, hours: any): void {
    this.analyticsService.getUsageFrustration(appId, hours).then((data) => {
      this.models = data.items
      this.models.forEach((item) => {
        item.chartData = this.getData(item)
        item.chartOptions = this.getOptions(item)
      })
      this.totalRuns = calculateTotal(this.models, 'reason_cnt')
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


  getOptions(row: any): void {
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
          text: row.reason_name,
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
      labels: [row.reason_name],
      datasets: [
        {
          label: 'Success',
          backgroundColor: documentStyle.getPropertyValue('--green-300'),
          data: [row.reason_name],
          borderWidth: 0,
          borderRadius: [
            { topLeft: 5, topRight: 5, bottomLeft: 5, bottomRight: 5 },
          ],
          borderSkipped: false,
        }
      ],
    }

    return returnValue
  }

}
