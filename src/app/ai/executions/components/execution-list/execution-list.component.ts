import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core'
import { DashboardService } from '../../../services/dashboard.service'

import moment from 'moment'
import { getDurationLLM, formatTime } from 'src/app/ai/utils/time'

@Component({
    selector: 'execution-list-widget',
    templateUrl: './execution-list.component.html',
    standalone: false
})
export class ExecutionListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() hours = 1
  @Input() appId: string = null

  executions: any[]
  first = 0
  rows = 10
  totalRecords!: number
  loading = false

  intervalId: any
  formatTime = formatTime

  selectedItem: any
  detailVisible = false

  selectedAgent: any
  agents: any[] = []

  constructor(
    private dashboardService: DashboardService,
    public el: ElementRef,
  ) {}

  populateTable(event: any, appId: any, hours: any): void {
    let page = 1
    const size = 10

    if (event) {
      page = event?.first / event?.rows + 1
    }
    this.dashboardService
      .getExecutions(appId, hours, page, size, this.selectedAgent?.code)
      .then((data) => {
        this.executions = data?.items
        this.totalRecords = data?.total
        this.executions = this.executions?.map((item) => {
          item.duration = getDurationLLM(item)
          if (item.duration > 8) {
            item.latency = 'danger'
          } else if (item.duration > 4) {
            item.latency = 'warning'
          } else {
            item.latency = 'success'
          }
          return item
        })
      })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['hours']?.currentValue || this.hours) &&
      (changes['appId']?.currentValue || this.appId)
    ) {
      this.populateTable(null, this.appId, this.hours)
      this.loadAgents()
    }
  }

  loadAgents(): void {
    this.dashboardService
      .getDistinctAgents(this.appId, this.hours)
      .then((data) => {
        this.agents = (data || []).map((name: string) => ({
          name,
          code: name,
        }))
      })
  }

  filterByAgent(_____event: any): void {
    this.populateTable(null, this.appId, this.hours)
  }

  ngOnInit(): void {
    this.intervalId = window.setInterval(() => {
      if (this.hours && this.appId) {
        this.populateTable(null, this.appId, this.hours)
      }
    }, 600000)
  }

  rowSelect(event: any): void {
    this.selectedItem = event.data
    this.detailVisible = true
  }

  hideDetails(): void {
    this.detailVisible = false
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId)
  }

  waitedToMuch(execution: any): boolean {
    return (
      execution.status === 'started' &&
      moment().diff(moment.utc(execution.time).local(false), 'minutes') > 5
    )
  }

  formatCost(cost: number): string {
    if (cost == null || cost === 0) {return '-'}
    if (cost < 0.0001) {return '< $0.0001'}
    return '$' + cost.toFixed(4)
  }
}
