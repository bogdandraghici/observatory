import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core'
import { Table } from 'primeng/table'
import { extendWithCosts } from '../../../utils/calcCosts'
import { DashboardService } from '../../../services/dashboard.service'

import moment from 'moment'
import { getDurationLLM, formatTime } from 'src/app/ai/utils/time'

@Component({
    selector: 'llmcalls-list-widget',
    templateUrl: './llmcalls-list.component.html',
    styleUrl: './llmcalls-list.component.scss',
    standalone: false
})
export class LLMCallsListComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('dt2') dt2!: Table
  @Input() hours = 1
  @Input() appId: string = null
  @Input() datasets: any = null
  @Input() currentApp: any = null

  llmCalls: any[]
  first = 0
  rows = 10
  totalRecords!: number
  loading = false
  intervalId: any

  formatTime = formatTime

  selectedItem: any
  sidebarVisible = false



  selectedAgent: any
  agents: any[] = []



  constructor(
    private analyticsService: DashboardService,
    public el: ElementRef,
  ) {}

  populateTable(event: any, appId: any, hours: any): void {
    let page = 1
    const size = 10
    let query = null

    if (event) {
      page = event?.first / event?.rows + 1
      query = event?.globalFilter
    }
    this.analyticsService
      .getLLMsCalls(appId, hours, page, size, query, this.selectedAgent?.code)
      .then((data) => {
        this.llmCalls = data?.items
        this.totalRecords = data?.total
        this.llmCalls = this.llmCalls.map((item) => {
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
        this.llmCalls = extendWithCosts(this.llmCalls)
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
    this.analyticsService
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

  getFeedBack(_____llmCall: any): void {}

  getUserText(llmCall: any): any {
    return llmCall.input
  }

  getAIText(llmCall: any): any {
    return llmCall.output
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
    return this.llmCalls
      ? this.first === this.llmCalls.length - this.rows
      : true
  }

  isFirstPage(): boolean {
    return this.llmCalls ? this.first === 0 : true
  }

  showSidebar(_____item: any): void {
    this.sidebarVisible = true
  }

  rowSelect(event: any): void {
    this.showSidebar(event.data)
  }

  hideDetails(): void {
    this.sidebarVisible = false
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId)
  }

  waitedToMuch(llmCall: any): boolean {
    return (
      llmCall.status === 'started' &&
      moment().diff(moment.utc(llmCall.time).local(false), 'minutes') > 5
    )
  }

  refresh(_____event: any): void {
    this.populateTable(null, this.appId, this.hours)
  }
}
