import { Component, OnDestroy, OnInit } from '@angular/core'
import { Subscription, debounceTime } from 'rxjs'
import { DashboardService } from '../services/dashboard.service'
import { OrgService } from '../services/orgs.service'
import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'
import { Meta, Title } from '@angular/platform-browser'
import { MessageService } from 'primeng/api'
import { resolveDefaultAppOrg } from '../utils/default-app'

@Component({
    templateUrl: './drift.component.html',
    styleUrl: './drift.component.scss',
    standalone: false,
    providers: [MessageService],
})
export class DriftComponent implements OnInit, OnDestroy {
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

  // Charts (PrimeNG p-chart bindings — using p-chart so scriptable
  // gradient backgroundColors actually render; raw `new Chart()` on a
  // <canvas> falls back to a solid-black fill in this Chart.js version.)
  driftTimelineChartData: any = null
  driftTimelineChartOptions: any = null
  distributionChartData: any = null
  distributionChartOptions: any = null

  private themeSubscription?: Subscription

  constructor(
    private dashboardService: DashboardService,
    private orgService: OrgService,
    public layoutService: LayoutService,
    private metaService: Meta,
    private titleService: Title,
    private messageService: MessageService,
  ) {
    // Chart.js doesn't react to the .flowx-dark class toggle on <html>;
    // rebuild both charts whenever the layout config changes.
    this.themeSubscription = this.layoutService.configUpdate$
      .pipe(debounceTime(25))
      .subscribe(() => {
        if (this.driftResults.length > 0) {
          this.renderTimelineChart()
          this.renderDistributionChart()
        }
      })
  }

  ngOnInit(): void {
    this.titleService.setTitle('FlowX.AI Observatory - Drift Monitor')
    this.metaService.updateTag({ name: 'description', content: 'Drift detection and monitoring dashboard.' })
    this.populateOrgs()
  }

  ngOnDestroy(): void {
    this.themeSubscription?.unsubscribe()
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

  // FlowX-aware color palette for the timeline's per-metric line colors.
  // Steps up to the lighter shade in dark mode for the FlowX semantic
  // tokens. Indigo / purple / cyan / pink fallbacks are kept because the
  // chart can render up to 7 simultaneous metric lines.
  private timelinePalette(): { hex: string; rgb: string }[] {
    const isDark = document.documentElement.classList.contains('flowx-dark')
    if (isDark) {
      return [
        { hex: '#3389e0', rgb: '51, 137, 224' },   // blue-400 (was indigo)
        { hex: '#54aa94', rgb: '84, 170, 148' },   // green-300
        { hex: '#fec742', rgb: '254, 199, 66' },   // yellow-400
        { hex: '#ee6b54', rgb: '238, 107, 84' },   // red-300
        { hex: '#a78bfa', rgb: '167, 139, 250' },  // purple
        { hex: '#22d3ee', rgb: '34, 211, 238' },   // cyan
        { hex: '#f472b6', rgb: '244, 114, 182' },  // pink
      ]
    }
    return [
      { hex: '#006bd8', rgb: '0, 107, 216' },     // blue-500
      { hex: '#008060', rgb: '0, 128, 96' },      // green-500
      { hex: '#feb913', rgb: '254, 185, 19' },    // yellow-500
      { hex: '#e62200', rgb: '230, 34, 0' },      // red-500
      { hex: '#8b5cf6', rgb: '139, 92, 246' },    // purple
      { hex: '#06b6d4', rgb: '6, 182, 212' },     // cyan
      { hex: '#ec4899', rgb: '236, 72, 153' },    // pink
    ]
  }

  // FlowX gradient (top opaque → bottom transparent) keyed to chartArea —
  // same recipe the API Calls activity chart uses.
  private gradient(rgb: string): (context: any) => any {
    return (context: any) => {
      const { ctx, chartArea } = context.chart
      if (!chartArea) { return `rgba(${rgb}, 0.25)` }
      const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
      g.addColorStop(0, `rgba(${rgb}, 0.45)`)
      g.addColorStop(1, `rgba(${rgb}, 0)`)
      return g
    }
  }

  private flowxTooltip(): any {
    return {
      enabled: true,
      backgroundColor: '#1d232c',
      titleColor: '#f7f8f9',
      bodyColor: '#e3e8ed',
      borderWidth: 0,
      cornerRadius: 6,
      padding: { x: 10, y: 6 },
      displayColors: false,
      titleFont: { size: 11, weight: '600', family: '"Open Sans", system-ui, sans-serif' },
      bodyFont: { size: 12, weight: '400', family: '"Open Sans", system-ui, sans-serif' },
    }
  }

  renderTimelineChart(): void {
    if (this.driftResults.length === 0) {return}

    const isDark = document.documentElement.classList.contains('flowx-dark')
    const textColor = isDark ? '#f7f8f9' : '#1d232c'
    const textSecondary = isDark ? '#a6b0be' : '#64748b'

    const metrics = [...new Set(this.driftResults.map((r: any) => r.metric))]
    const palette = this.timelinePalette()
    const allLabels = [...new Set(this.driftResults.map((r: any) => new Date(r.detected_at).toLocaleDateString()))].sort()

    const datasets = metrics.map((metric, i) => {
      const metricResults = this.driftResults.filter((r: any) => r.metric === metric)
      const dataMap: any = {}
      for (const r of metricResults) {
        dataMap[new Date(r.detected_at).toLocaleDateString()] = r.drift_score
      }
      const c = palette[i % palette.length]
      return {
        label: metric,
        data: allLabels.map(l => dataMap[l] ?? null),
        borderColor: c.hex,
        // backgroundColor = line color so the legend swatch is rendered
        // with a solid fill matching the line (instead of the default
        // gray fill with colored stroke).
        backgroundColor: c.hex,
        borderWidth: 2,
        tension: 0.3,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: c.hex,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
      }
    })

    this.driftTimelineChartData = { labels: allLabels, datasets }
    this.driftTimelineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false, axis: 'x' },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 16,
            font: { family: '"Open Sans", system-ui, sans-serif' },
          },
        },
        tooltip: this.flowxTooltip(),
      },
      scales: {
        x: {
          ticks: { color: textSecondary, font: { family: '"Open Sans", system-ui, sans-serif' } },
          border: { display: false },
          grid: { display: false, drawBorder: false },
        },
        y: {
          beginAtZero: true,
          max: 1,
          title: { display: true, text: 'Drift Score', color: textColor },
          ticks: { color: textSecondary, font: { family: '"Open Sans", system-ui, sans-serif' } },
          border: { display: false },
          grid: { color: 'rgba(99, 116, 139, 0.10)', drawBorder: false, drawTicks: false },
        },
      },
    }
  }

  renderDistributionChart(): void {
    if (this.driftResults.length === 0) {return}

    const isDark = document.documentElement.classList.contains('flowx-dark')
    const textColor = isDark ? '#f7f8f9' : '#1d232c'
    const textSecondary = isDark ? '#a6b0be' : '#64748b'

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

    // Baseline = FlowX interactive blue (reference / steady).
    // Current  = FlowX error red (signals divergence from baseline).
    const baseline = isDark
      ? { hex: '#3389e0', rgb: '51, 137, 224' }    // blue-400
      : { hex: '#006bd8', rgb: '0, 107, 216' }     // blue-500
    const current = isDark
      ? { hex: '#ee6b54', rgb: '238, 107, 84' }    // red-300
      : { hex: '#e62200', rgb: '230, 34, 0' }      // red-500

    this.distributionChartData = {
      labels: metrics,
      datasets: [
        {
          label: 'Baseline P50',
          data: baselineP50,
          backgroundColor: this.gradient(baseline.rgb),
          borderColor: baseline.hex,
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: 'Current P50',
          data: currentP50,
          backgroundColor: this.gradient(current.rgb),
          borderColor: current.hex,
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    }
    this.distributionChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false, axis: 'x' },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 16,
            font: { family: '"Open Sans", system-ui, sans-serif' },
          },
        },
        tooltip: this.flowxTooltip(),
      },
      scales: {
        x: {
          ticks: { color: textSecondary, font: { family: '"Open Sans", system-ui, sans-serif' } },
          border: { display: false },
          grid: { display: false, drawBorder: false },
        },
        y: {
          beginAtZero: true,
          ticks: { color: textSecondary, font: { family: '"Open Sans", system-ui, sans-serif' } },
          border: { display: false },
          grid: { color: 'rgba(99, 116, 139, 0.10)', drawBorder: false, drawTicks: false },
        },
      },
    }
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
