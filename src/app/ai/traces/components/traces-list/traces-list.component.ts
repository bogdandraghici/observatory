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
    selector: 'traces-list-widget',
    templateUrl: './traces-list.component.html',
    styleUrl: './traces-list.component.scss',
    standalone: false
})
export class TracesListComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('dt2') dt2!: Table
  @Input() hours = 1
  @Input() appId: string = null

  traces: any[]
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
      .getTracesCalls(appId, hours, page, size, query, this.selectedAgent?.code)
      .then((data) => {
        this.traces = data?.items
        this.totalRecords = data?.total
        this.traces = this.traces.map((item) => {
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
        this.traces = extendWithCosts(this.traces)
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

  getFeedBack(_____user: any): void {}

  getUserText(trace: any): any {
    return this.parseDisplayText(trace.input)
  }

  getAIText(trace: any): any {
    return this.parseDisplayText(trace.output)
  }

  private parseDisplayText(value: any): string {
    if (value == null) {return ''}
    // input_text/output_text come as JSON-serialized strings from the backend
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        if (parsed == null) {return ''}
        if (typeof parsed === 'string') {return parsed}
        return JSON.stringify(parsed, null, 2)
      } catch {
        return value
      }
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
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
    return this.traces ? this.first === this.traces.length - this.rows : true
  }

  isFirstPage(): boolean {
    return this.traces ? this.first === 0 : true
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

  waitedToMuch(trace: any): boolean {
    return (
      trace.status === 'started' &&
      moment().diff(moment.utc(trace.time).local(false), 'minutes') > 5
    )
  }
}
