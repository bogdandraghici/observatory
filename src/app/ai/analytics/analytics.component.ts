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

  workspaces: any[]
  selectedWorkspace: any
  apps: any[]
  selectedApp: any

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

  populateData(projectId: any, days: any): void {
    if (!projectId || !days) {return}
    this.metricsService.getMetricsAll(projectId, days).then((data) => {
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
      (changes['selectedApp']?.currentValue || this.selectedApp)
    ) {
      this.populateData(this.selectedApp, this.selectedPeriod)
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
        const { org, workspace, app } = this.getDefaultAppOrg(this.orgs)
        this.selectedOrg = org.id
        this.workspaces = this.getWorkspaces(org.id)
        this.selectedWorkspace = workspace?.id || null
        this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
        this.selectedApp = app.id
        this.populateData(this.selectedApp, this.selectedPeriod)
      }
    })
  }
  getWorkspaces(org_id: any): any[] {
    const org = this.orgs?.find((item) => item.id === org_id)
    return org?.workspaces || []
  }
  getAppsFromWorkspace(org: any, workspace_id: any): any[] {
    if (workspace_id) {
      const ws = (org.workspaces || []).find((w: any) => w.id === workspace_id)
      return (ws?.projects || []).filter((app: any) => app.is_active === true)
    }
    return (org.projects || []).filter((app: any) => app.is_active === true)
  }
  getDefaultAppOrg(orgs: any): any {
    let default_app = null
    let parent_org = null
    let parent_workspace = null
    orgs.forEach((org) => {
      (org.workspaces || []).forEach((ws) => {
        (ws.projects || []).forEach((app) => {
          if (app.is_default) {
            default_app = app
            parent_org = org
            parent_workspace = ws
          }
        })
      })
      if (!default_app) {
        (org.projects || []).forEach((app) => {
          if (app.is_default) {
            default_app = app
            parent_org = org
          }
        })
      }
    })
    if (!default_app) {
      parent_org = orgs[0]
      const ws = parent_org?.workspaces?.[0]
      if (ws?.projects?.length) {
        parent_workspace = ws
        default_app = ws.projects[0]
      } else {
        default_app = parent_org?.projects?.[0]
      }
    }
    return { org: parent_org, workspace: parent_workspace, app: default_app }
  }
  orgChanged(event: any): void {
    const org = this.orgs?.find((item) => item.id === event.value)
    this.workspaces = this.getWorkspaces(event.value)
    this.selectedWorkspace = this.workspaces[0]?.id || null
    this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
    this.selectedApp = this.apps[0]?.id
    this.populateData(this.selectedApp, this.selectedPeriod)
  }
  workspaceChanged(event: any): void {
    const org = this.orgs?.find((item) => item.id === this.selectedOrg)
    this.apps = this.getAppsFromWorkspace(org, event.value)
    this.selectedApp = this.apps[0]?.id
    this.populateData(this.selectedApp, this.selectedPeriod)
  }
  appChanged(event: any): void {
    this.populateData(this.selectedApp, this.selectedPeriod)
  }
  periodChanged(_____event: any): void {
    this.populateData(this.selectedApp, this.selectedPeriod)
  }

  ngOnDestroy(): void {}

}
