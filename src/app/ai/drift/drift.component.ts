import { Component, OnInit } from '@angular/core'
import { DashboardService } from '../services/dashboard.service'
import { OrgService } from '../services/orgs.service'
import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'
import { Meta, Title } from '@angular/platform-browser'
import { MessageService } from 'primeng/api'
import Chart from 'chart.js/auto'
import { resolveDefaultAppOrg } from '../utils/default-app'

@Component({
    templateUrl: './drift.component.html',
    standalone: false,
    providers: [MessageService],
})
export class DriftComponent implements OnInit {
  orgs: any[] = []
  selectedOrg: any
  workspaces: any[] = []
  selectedWorkspace: any
  apps: any[] = []
  selectedApp: any = null
  hours = 720

  periodOptions = [
    { label: 'Last 7d', value: 168 },
    { label: 'Last 30d', value: 720 },
    { label: 'Last 6m', value: 4320 },
  ]

  // Data
  driftResults: any[] = []
  dashboard: any[] = []

  // KPIs
  metricsMonitored = 0
  driftsDetected = 0
  significantDrifts = 0
  lastComputed = '-'

  // Charts
  driftTimelineChart: any = null
  distributionChart: any = null

  constructor(
    private dashboardService: DashboardService,
    private orgService: OrgService,
    public layoutService: LayoutService,
    private metaService: Meta,
    private titleService: Title,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('FlowX.AI Observatory - Drift Monitor')
    this.metaService.updateTag({ name: 'description', content: 'Drift detection and monitoring dashboard.' })
    this.populateOrgs()
  }

  getWorkspaces(org_id: any): any[] {
    const org = this.orgs?.find((item: any) => item.id === org_id)
    return org?.workspaces || []
  }

  getAppsFromWorkspace(org: any, workspace_id: any): any[] {
    if (workspace_id) {
      const ws = org?.workspaces?.find((w: any) => w.id === workspace_id)
      return (ws?.projects || []).filter((a: any) => a.is_active)
    }
    return (org?.projects || []).filter((a: any) => a.is_active)
  }

  getDefaultAppOrg(): { org: any, workspace: any, app: any } {
    return resolveDefaultAppOrg(this.orgs)
  }

  populateOrgs(): void {
    this.orgService.getOrgsWithApps().then((data: any) => {
      this.orgs = data || []
      if (this.orgs.length > 0) {
        const { org, workspace, app } = this.getDefaultAppOrg()
        this.selectedOrg = org?.id
        this.workspaces = this.getWorkspaces(org?.id)
        this.selectedWorkspace = workspace?.id || null
        this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
        this.selectedApp = app?.id || null
        this.loadDashboard()
        if (this.selectedApp) {this.loadDriftResults()}
      }
    })
  }

  orgChanged(): void {
    const org = this.orgs.find((o: any) => o.id === this.selectedOrg)
    this.workspaces = this.getWorkspaces(this.selectedOrg)
    this.selectedWorkspace = this.workspaces.length > 0 ? this.workspaces[0].id : null
    this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
    this.selectedApp = this.apps.length > 0 ? this.apps[0].id : null
    this.driftResults = []
    this.loadDashboard()
    if (this.selectedApp) {this.loadDriftResults()}
  }

  workspaceChanged(event: any): void {
    const org = this.orgs.find((o: any) => o.id === this.selectedOrg)
    this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
    this.selectedApp = this.apps.length > 0 ? this.apps[0].id : null
    this.driftResults = []
    this.loadDashboard()
    if (this.selectedApp) {this.loadDriftResults()}
  }

  appChanged(): void {
    if (this.selectedApp) {
      this.loadDriftResults()
    } else {
      this.driftResults = []
    }
  }

  periodChanged(): void {
    this.loadDashboard()
    if (this.selectedApp) {
      this.loadDriftResults()
    }
  }

  async loadDashboard(): Promise<any> {
    if (!this.selectedOrg) {return}
    this.dashboard = await this.dashboardService.getDriftDashboard(this.selectedOrg, this.hours) || []
  }

  async loadDriftResults(): Promise<any> {
    if (!this.selectedApp) {return}
    this.driftResults = await this.dashboardService.getDriftResults(this.selectedApp, { hours: this.hours }) || []
    this.computeKPIs()
    setTimeout(() => {
      this.renderTimelineChart()
      this.renderDistributionChart()
    }, 100)
  }

  async computeDrift(): Promise<any> {
    if (!this.selectedApp) {
      this.messageService.add({ severity: 'warn', summary: 'Select App', detail: 'Please select an app first' })
      return
    }
    const results = await this.dashboardService.computeDrift(this.selectedApp)
    const drifts = (results || []).filter((r: any) => r.drift_detected).length
    this.messageService.add({
      severity: drifts > 0 ? 'warn' : 'success',
      summary: 'Computed',
      detail: `${drifts} drift(s) detected across ${(results || []).length} metrics`,
    })
    this.loadDriftResults()
    this.loadDashboard()
  }

  computeKPIs(): void {
    // Deduplicate: keep only the latest result per metric
    const latestPerMetric = new Map<string, any>()
    for (const r of this.driftResults) {
      if (!latestPerMetric.has(r.metric)) {
        latestPerMetric.set(r.metric, r)
      }
    }
    const latest = Array.from(latestPerMetric.values())

    this.metricsMonitored = latest.length
    this.driftsDetected = latest.filter((r: any) => r.drift_detected).length
    this.significantDrifts = latest.filter((r: any) => r.severity === 'significant').length
    if (this.driftResults.length > 0 && this.driftResults[0].detected_at) {
      this.lastComputed = new Date(this.driftResults[0].detected_at).toLocaleDateString()
    } else {
      this.lastComputed = '-'
    }
  }

  renderTimelineChart(): void {
    if (this.driftTimelineChart) {this.driftTimelineChart.destroy()}
    const canvas = document.getElementById('driftTimelineCanvas') as HTMLCanvasElement
    if (!canvas || this.driftResults.length === 0) {return}

    const metrics = [...new Set(this.driftResults.map((r: any) => r.metric))]
    const colors = ['#6366f1', 'var(--flowx-success, #008060)', 'var(--flowx-warning, #feb913)', 'var(--flowx-error, #e62200)', '#8b5cf6', '#06b6d4', '#ec4899']

    const allLabels = [...new Set(this.driftResults.map((r: any) => new Date(r.detected_at).toLocaleDateString()))].sort()

    const datasets = metrics.map((metric, i) => {
      const metricResults = this.driftResults.filter((r: any) => r.metric === metric)
      const dataMap: any = {}
      for (const r of metricResults) {
        dataMap[new Date(r.detected_at).toLocaleDateString()] = r.drift_score
      }
      return {
        label: metric,
        data: allLabels.map(l => dataMap[l] ?? null),
        borderColor: colors[i % colors.length],
        tension: 0.3,
        fill: false,
      }
    })

    const style = getComputedStyle(document.documentElement)
    const textColor = style.getPropertyValue('--text-color').trim() || '#ccc'
    const textSecondary = style.getPropertyValue('--text-color-secondary').trim() || '#888'
    const surfaceBorder = style.getPropertyValue('--surface-border').trim() || '#444'

    this.driftTimelineChart = new Chart(canvas, {
      type: 'line',
      data: { labels: allLabels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: textColor } } },
        scales: {
          x: {
            ticks: { color: textSecondary },
            grid: { color: surfaceBorder },
          },
          y: {
            beginAtZero: true, max: 1,
            title: { display: true, text: 'Drift Score', color: textColor },
            ticks: { color: textSecondary },
            grid: { color: surfaceBorder },
          },
        },
      },
    })
  }

  renderDistributionChart(): void {
    if (this.distributionChart) {this.distributionChart.destroy()}
    const canvas = document.getElementById('distributionCanvas') as HTMLCanvasElement
    if (!canvas || this.driftResults.length === 0) {return}

    const latestPerMetric: any = {}
    for (const r of this.driftResults) {
      if (!latestPerMetric[r.metric]) {latestPerMetric[r.metric] = r}
    }

    const metrics = Object.keys(latestPerMetric)
    const baselineP50: number[] = []
    const currentP50: number[] = []

    for (const metric of metrics) {
      const r = latestPerMetric[metric]
      baselineP50.push(r.reference_window?.stats?.p50 || 0)
      currentP50.push(r.comparison_window?.stats?.p50 || 0)
    }

    const distStyle = getComputedStyle(document.documentElement)
    const distTextColor = distStyle.getPropertyValue('--text-color').trim() || '#ccc'
    const distTextSecondary = distStyle.getPropertyValue('--text-color-secondary').trim() || '#888'
    const distSurfaceBorder = distStyle.getPropertyValue('--surface-border').trim() || '#444'

    this.distributionChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: metrics,
        datasets: [
          {
            label: 'Baseline P50',
            data: baselineP50,
            backgroundColor: 'rgba(99, 102, 241, 0.6)',
          },
          {
            label: 'Current P50',
            data: currentP50,
            backgroundColor: 'rgba(239, 68, 68, 0.6)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: distTextColor } } },
        scales: {
          x: {
            ticks: { color: distTextSecondary },
            grid: { color: distSurfaceBorder },
          },
          y: {
            beginAtZero: true,
            ticks: { color: distTextSecondary },
            grid: { color: distSurfaceBorder },
          },
        },
      },
    })
  }

  // Helpers
  getDriftSeverity(severity: string): string {
    switch (severity) {
      case 'significant': return 'danger'
      case 'moderate': return 'warn'
      case 'minor': return 'info'
      case 'no_drift': return 'success'
      default: return 'secondary'
    }
  }
}
