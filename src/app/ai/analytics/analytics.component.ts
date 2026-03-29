import {
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core'

import { OrgService } from '../services/orgs.service'
import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'
import { Meta, Title } from '@angular/platform-browser'
import { MetricsService } from '../services/metrics.service'
import { calculateQuartiles } from '../utils/calcCosts'

@Component({
    templateUrl: './analytics.component.html',
    styleUrl: './analytics.component.scss',
    standalone: false
})
export class AnalyticsComponent implements OnInit, OnDestroy, OnChanges {
  periods: any[]
  selectedPeriod: any
  allMetrics: any[]
  responseTimeMetrics: any[]
  orgs: any[]
  selectedOrg: any
  selectedApiKey: string

  triple_values = [
    { label: 'LQ', num: 0 },
    { label: 'Median', num: 0 },
    { label: 'UQ', num: 0 },
  ]

  constructor(
    private orgService: OrgService,
    public layoutService: LayoutService,
    private metricsService: MetricsService,
    private metaService: Meta,
    private titleService: Title,
  ) {}

  populateData(apiKey: any, days: any): void {
    if (!apiKey || !days) {return}
    this.metricsService.getMetricsAll(apiKey, days).then((data) => {
      this.allMetrics = data

      if (data?.length > 0) {
        const { lq, median, uq } = calculateQuartiles(
          this.allMetrics,
          'avg_response',
        )
        this.responseTimeMetrics= this.allMetrics.slice()
          .sort((a, b) => b['avg_response'] - a['avg_response'])
        this.triple_values = [
          { label: 'LQ', num: lq },
          { label: 'Median', num: median },
          { label: 'UQ', num: uq },
        ]
      } else {
        this.allMetrics = []
        this.responseTimeMetrics = []
      }
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['days']?.currentValue || this.selectedPeriod) &&
      (changes['selectedApiKey']?.currentValue || this.selectedApiKey)
    ) {
      this.populateData(this.selectedApiKey, this.selectedPeriod)
    }
  }

  ngOnInit(): void {
    this.periods = [
      { name: 'Last Hour', value: 1 / 24 },
      { name: '3H', value: 3 / 24 },
      { name: '24H', value: 1 },
      { name: '7D', value: 7 },
      { name: '1M', value: 30 },
      { name: '6M', value: 180 },
      { name: '1Y', value: 365 },
    ]
    this.selectedPeriod = 30
    this.titleService.setTitle('FlowX.AI Observatory - Analytics')
    this.metaService.updateTag({
      name: 'description',
      content: 'The ultimate LLM observatory for AI Agents.',
    })
    this.populateOrgs()
  }
  populateOrgs(): void {
    this.orgService.getOrgsWithApps().then((data) => {
      this.orgs = data
      if (this.orgs?.length > 0) {
        this.selectedOrg = this.orgs[0].id
        this.selectedApiKey = this.getApiKey(this.orgs[0])
        this.populateData(this.selectedApiKey, this.selectedPeriod)
      }
    })
  }
  getApiKey(org: any): string {
    return org?.api_keys?.[0]?.value || ''
  }
  orgChanged(event: any): void {
    const org = this.orgs?.find((item) => item.id === event.value)
    this.selectedApiKey = this.getApiKey(org)
    this.populateData(this.selectedApiKey, this.selectedPeriod)
  }
  periodChanged(_____event: any): void {
    this.populateData(this.selectedApiKey, this.selectedPeriod)
  }

  ngOnDestroy(): void {}

}
