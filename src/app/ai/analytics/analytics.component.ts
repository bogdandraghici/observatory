import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core'

import { Meta, Title } from '@angular/platform-browser'
import { MetricsService } from '../services/metrics.service'
import { calculateQuartiles } from '../utils/calcCosts'

@Component({
    templateUrl: './analytics.component.html',
    styleUrl: './analytics.component.scss',
    standalone: false
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  periods: any[]
  selectedPeriod: any
  allMetrics: any[]
  responseTimeMetrics: any[]

  selectedAgent: any = null
  agents: any[] = [
    { name: 'Analyst', value: 0 },
    { name: 'Architect', value: 1 },
    { name: 'Assistant', value: 2 },
    { name: 'Auditor', value: 3 },
    { name: 'Command', value: 4 },
    { name: 'Designer', value: 5 },
    { name: 'Developer', value: 6 },
    { name: 'Inspector', value: 7 },
    { name: 'Integrator', value: 8 },
    { name: 'Optimizer', value: 9 },
    { name: 'Strategist', value: 10 },
    { name: 'Supervisor', value: 11 },
    { name: 'Writer', value: 12 },
    { name: 'DI-Platform', value: 13 },
    { name: 'Agent Builder', value: 14 },
  ]

  triple_values = [
    { label: 'LQ', num: 0 },
    { label: 'Median', num: 0 },
    { label: 'UQ', num: 0 },
  ]

  constructor(
    private metricsService: MetricsService,
    private metaService: Meta,
    private titleService: Title,
  ) {}

  populateData(days: any): void {
    if (!days) {return}
    this.metricsService.getMetricsAll(days, this.selectedAgent).then((data) => {
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
    this.populateData(this.selectedPeriod)
  }

  agentChanged(_event: any): void {
    this.populateData(this.selectedPeriod)
  }

  periodChanged(_event: any): void {
    this.populateData(this.selectedPeriod)
  }

  ngOnDestroy(): void {}

}
