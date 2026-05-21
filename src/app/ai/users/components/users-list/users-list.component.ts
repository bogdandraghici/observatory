import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core'
import { Table } from 'primeng/table'
import { extendWithCosts } from '../../../utils/calcCosts'
import { DashboardService } from '../../../services/dashboard.service'

import { getDurationLLM, formatTime } from 'src/app/ai/utils/time'
import { defaultAgents } from 'src/app/ai/utils/dataEnums'

@Component({
    selector: 'users-list-widget',
    templateUrl: './users-list.component.html',
    styleUrl: './users-list.component.scss',
    standalone: false
})
export class UsersListComponent implements OnChanges {
  @ViewChild('dt') dt!: Table

  @Input() hours = 1
  @Input() appId: string = null

  users: any[]
  first = 0
  rows = 10
  totalRecords!: number
  loading = false

  formatTime = formatTime

  selectedItem: any
  sidebarVisible = false

  selectedAgent: any
  agents: any[] = defaultAgents

  constructor(
    private analyticsService: DashboardService,
    public el: ElementRef,
  ) {}

  populateTable(event: any, appId: any, hours: any): void {
    let page = 1
    const size = 10
    let query = null

    if (event) {
      query = event?.globalFilter
      page = event?.first / event?.rows + 1
    }
    this.analyticsService
      .getUsersCalls(appId, hours, page, size, query, this.selectedAgent?.code)
      .then((data) => {
        this.users = data?.items
        this.totalRecords = data?.total
        this.users = this.users.map((item) => {
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
        this.users = extendWithCosts(this.users)
      })
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['hours']?.currentValue || this.hours) &&
      (changes['appId']?.currentValue || this.appId)
    ) {
      this.populateTable(null, this.appId, this.hours)
    }
  }

  filterByAgent(_____event: any): void {
    this.populateTable(null, this.appId, this.hours)
  }

  getFeedBack(____user: any): void {}

  getUserText(user: any): any {
    return user.input
  }

  getAIText(user: any): any {
    return user.output
  }

  next(): void {
    this.first = this.first + this.rows
  }

  prev(): void {
    this.first = this.first - this.rows
  }

  reset(): void {
    this.first = 0
  }

  pageChange(event: any): void {
    this.first = event.first
    this.rows = event.rows
  }

  isLastPage(): boolean {
    return this.users ? this.first === this.users.length - this.rows : true
  }

  isFirstPage(): boolean {
    return this.users ? this.first === 0 : true
  }

  showSidebar(____item: any): void {
    this.sidebarVisible = true
  }

  rowSelect(event: any): void {
    this.showSidebar(event.data)
  }

  hideDetails(): void {
    this.sidebarVisible = false
  }

}
