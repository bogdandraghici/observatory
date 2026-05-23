import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { Subscription, debounceTime } from 'rxjs'
import { DashboardService } from '../services/dashboard.service'
import { OrgService } from '../services/orgs.service'
import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'
import { Meta, Title } from '@angular/platform-browser'
import { MessageService } from 'primeng/api'
import { Drawer } from 'primeng/drawer'
import { resolveDefaultAppOrg } from '../utils/default-app'

@Component({
    templateUrl: './insights.component.html',
    styleUrl: './insights.component.scss',
    standalone: false,
    providers: [MessageService],
})
export class InsightsComponent implements OnInit, OnDestroy {
  @ViewChild('evalDrawerRef') evalDrawerRef!: Drawer

  // Org → Workspace → Project cascade
  orgs: any[] = []
  selectedOrg: any
  workspaces: any[] = []
  selectedWorkspace: any
  apps: any[] = []
  selectedApp: any = null

  agents: any[] = []
  selectedAgent = ''
  hours = 720

  periodOptions = [
    { label: 'Last 24h', value: 24 },
    { label: 'Last 7d', value: 168 },
    { label: 'Last 30d', value: 720 },
    { label: 'Last 6m', value: 4320 },
  ]

  environmentOptions = [
    { label: 'All', value: '' },
    { label: 'Dev', value: 'dev' },
    { label: 'Prod', value: 'prod' },
  ]
  selectedEnvironment = ''

  granularity: 'hour' | 'day' | 'week' | 'run' = 'day'
  granularityOptions = [
    { label: 'Per Run', value: 'run' },
    { label: 'Hourly', value: 'hour' },
    { label: 'Daily', value: 'day' },
    { label: 'Weekly', value: 'week' },
  ]

  // Summary
  summary: any = {}
  unavailable = false
  loading = false

  // Metrics (raw object from API)
  metrics: any = {}

  // Health indicators
  healthIndicators: any[] = []

  // Timeseries data
  timeseriesData: any = {}
  trendChartData: any = null
  trendChartOptions: any = null
  activeTrendTab = '0'

  // Alerts
  alerts: any[] = []

  // Executions
  executions: any[] = []

  // Cost
  costForecast: any = {}

  // Drawer state
  drawerVisible = false
  drawerLoading = false
  selectedRunDetail: any = null
  phaseDetailsExpanded = false

  // Metric detail dialog
  metricDialogVisible = false
  selectedMetricDetail: any = null

  // Metric dimension keys
  metricDims = [
    'helpfulness', 'correctness', 'conciseness', 'hallucination',
    'groundedness', 'rag_coverage', 'tool_use', 'toxicity', 'refusal',
    'pii_leakage', 'prompt_injection', 'jailbreak', 'answer_relevance'
  ]

  private themeSubscription?: Subscription

  constructor(
    private dashboardService: DashboardService,
    private orgService: OrgService,
    public layoutService: LayoutService,
    private metaService: Meta,
    private titleService: Title,
    private messageService: MessageService,
  ) {
    // Chart.js can't observe the .flowx-dark class toggle, so re-render
    // the trend chart whenever the layout config changes.
    this.themeSubscription = this.layoutService.configUpdate$
      .pipe(debounceTime(25))
      .subscribe(() => {
        if (this.trendChartData) { this.renderTrendChart() }
      })
  }

  ngOnInit(): void {
    this.titleService.setTitle('FlowX.AI Observatory - Agent Evaluations')
    this.metaService.updateTag({ name: 'description', content: 'Agent evaluation metrics and quality insights.' })
    this.populateApps()
  }

  ngOnDestroy(): void {
    this.themeSubscription?.unsubscribe()
  }

  // ── Org → Workspace → Project cascade ─────────────────────

  populateApps(): void {
    this.orgService.getOrgsWithApps().then((data) => {
      this.orgs = data
      const { org, workspace, app } = this.getDefaultAppOrg(this.orgs)
      if (org) {
        this.selectedOrg = org.id
        this.workspaces = this.getWorkspaces(org.id)
        this.selectedWorkspace = workspace?.id || null
        this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
        this.selectedApp = app?.id || null
        this.loadAgents()
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
    return (org?.projects || []).filter((app: any) => app.is_active === true)
  }

  getDefaultAppOrg(orgs: any): any {
    return resolveDefaultAppOrg(orgs)
  }

  orgChanged(event: any): void {
    const org = this.orgs?.find((item) => item.id === event.value)
    this.workspaces = this.getWorkspaces(event.value)
    this.selectedWorkspace = this.workspaces[0]?.id || null
    this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
    this.selectedApp = this.apps[0]?.id || null
    this.loadAgents()
  }

  workspaceChanged(event: any): void {
    const org = this.orgs?.find((item) => item.id === this.selectedOrg)
    this.apps = this.getAppsFromWorkspace(org, event.value)
    this.selectedApp = this.apps[0]?.id || null
    this.loadAgents()
  }

  appChanged(): void {
    this.loadAgents()
  }

  // ── Agents & data loading ─────────────────────────────────

  async loadAgents(): Promise<any> {
    const result = await this.dashboardService.getInsightsAgents(this.selectedApp)
    if (result?.error) {
      this.unavailable = true
      return
    }
    this.agents = (result || []).map((a: any) => {
      const id = a.agent_id || a.id
      return {
        label: a.name || id,
        value: id,
      }
    })
    if (this.agents.length > 0) {
      this.selectedAgent = this.agents[0].value
      this.loadAll()
    } else {
      this.selectedAgent = ''
      this.summary = {}
      this.metrics = {}
      this.timeseriesData = {}
      this.alerts = []
      this.executions = []
      this.costForecast = {}
      this.healthIndicators = []
    }
  }

  agentChanged(): void { this.loadAll() }
  periodChanged(): void { this.loadAll() }
  environmentChanged(): void { this.loadAll() }
  granularityChanged(): void { this.loadTimeseries(this.queryParams) }

  private get queryParams(): any {
    const p: any = { hours: this.hours }
    if (this.selectedEnvironment) {p.environment = this.selectedEnvironment}
    if (this.selectedApp) {p.project_id = this.selectedApp}
    if (this.granularity) {p.granularity = this.granularity}
    return p
  }

  async loadAll(): Promise<any> {
    if (!this.selectedAgent) {return}
    this.loading = true
    const params = this.queryParams
    await Promise.all([
      this.loadSummary(params),
      this.loadMetrics(params),
      this.loadTimeseries(params),
      this.loadAlerts(params),
      this.loadExecutions(params),
      this.loadCost(params),
    ])
    // Rebuild health after cost is loaded too
    this.buildHealthIndicators()
    this.loading = false
  }

  async loadSummary(params: any): Promise<any> {
    const result = await this.dashboardService.getInsightsAgentSummary(this.selectedAgent, params)
    if (result?.error) {
      this.unavailable = true
      this.summary = {}
      return
    }
    this.summary = result || {}
    this.unavailable = false
  }

  async loadMetrics(params: any): Promise<any> {
    const result = await this.dashboardService.getInsightsAgentMetrics(this.selectedAgent, params)
    if (!result?.error && result) {
      this.metrics = result
    } else {
      this.metrics = {}
    }
  }

  async loadTimeseries(params: any): Promise<any> {
    const result = await this.dashboardService.getInsightsAgentTimeseries(this.selectedAgent, params)
    if (!result?.error && result) {
      this.timeseriesData = result
      setTimeout(() => this.renderTrendChart(), 100)
    }
  }

  async loadAlerts(params: any): Promise<any> {
    const result = await this.dashboardService.getInsightsAgentAlerts(this.selectedAgent, params)
    this.alerts = (!result?.error && Array.isArray(result)) ? result : []
  }

  async loadExecutions(params: any): Promise<any> {
    const result = await this.dashboardService.getInsightsAgentExecutions(this.selectedAgent, params)
    this.executions = (!result?.error && Array.isArray(result)) ? result : []
  }

  async loadCost(params: any): Promise<any> {
    const result = await this.dashboardService.getInsightsAgentCost(this.selectedAgent, params)
    this.costForecast = (!result?.error && result) ? result : {}
  }

  // ── Health indicators ────────────────────────────────────

  buildHealthIndicators(): void {
    const s = this.summary
    const cost = this.costForecast

    // Quality
    const qualityVal = s.overall_quality
    const qualityPct = qualityVal != null ? (qualityVal * 100).toFixed(0) + '%' : null

    // Safety
    const safetyVal = s.safety_compliance
    const safetyPct = safetyVal != null ? (safetyVal * 100).toFixed(0) + '%' : null

    // Performance — based on avg_latency_ms
    const latency = s.avg_latency_ms
    let perfStatus = 'N/A'
    let perfColor = 'var(--flowx-text-disabled, #a6b0be)'
    let perfTone = 'unknown'
    let perfPct: string | null = null
    if (latency != null) {
      if (latency < 3000) { perfStatus = 'Fast'; perfColor = 'var(--flowx-success, #008060)'; perfTone = 'good'; perfPct = '100%' }
      else if (latency < 5000) { perfStatus = 'Normal'; perfColor = 'var(--flowx-success, #008060)'; perfTone = 'good'; perfPct = '75%' }
      else if (latency < 10000) { perfStatus = 'Slow'; perfColor = 'var(--flowx-warning, #feb913)'; perfTone = 'warning'; perfPct = '50%' }
      else { perfStatus = 'Slow'; perfColor = 'var(--flowx-error, #e62200)'; perfTone = 'danger'; perfPct = '0%' }
    }

    // Cost Efficiency — based on avg_cost_per_run
    const avgCost = cost?.avg_cost_per_run
    let costStatus = 'N/A'
    let costColor = 'var(--flowx-text-disabled, #a6b0be)'
    let costTone = 'unknown'
    let costPct: string | null = null
    if (avgCost != null) {
      if (avgCost < 0.01) { costStatus = 'Low'; costColor = 'var(--flowx-success, #008060)'; costTone = 'good'; costPct = '100%' }
      else if (avgCost < 0.05) { costStatus = 'Moderate'; costColor = 'var(--flowx-success, #008060)'; costTone = 'good'; costPct = '75%' }
      else if (avgCost < 0.2) { costStatus = 'Moderate'; costColor = 'var(--flowx-warning, #feb913)'; costTone = 'warning'; costPct = '50%' }
      else { costStatus = 'High'; costColor = 'var(--flowx-error, #e62200)'; costTone = 'danger'; costPct = '25%' }
    }

    this.healthIndicators = [
      {
        label: 'Quality',
        icon: 'pi pi-chart-bar',
        status: qualityVal != null ? this.getHealthLabel(qualityVal) : 'N/A',
        detail: qualityPct,
        color: this.getScoreColor(qualityVal),
        tone: this.getScoreTone(qualityVal),
      },
      {
        label: 'Safety',
        icon: 'pi pi-shield',
        status: safetyVal != null ? this.getHealthLabel(safetyVal) : 'N/A',
        detail: safetyPct,
        color: this.getScoreColor(safetyVal),
        tone: this.getScoreTone(safetyVal),
      },
      {
        label: 'Performance',
        icon: 'pi pi-bolt',
        status: perfStatus,
        detail: perfPct,
        color: perfColor,
        tone: perfTone,
      },
      {
        label: 'Cost Efficiency',
        icon: 'pi pi-dollar',
        status: costStatus,
        detail: costPct,
        color: costColor,
        tone: costTone,
      },
    ]
  }

  getScoreTone(value: number | null | undefined): string {
    if (value == null) {return 'unknown'}
    if (value >= 0.8) {return 'good'}
    if (value >= 0.5) {return 'warning'}
    return 'danger'
  }

  getHealthLabel(value: number | null | undefined): string {
    if (value == null) {return 'N/A'}
    if (value >= 0.8) {return 'Healthy'}
    if (value >= 0.5) {return 'Needs Attention'}
    return 'Needs Attention'
  }

  // ── SVG Gauge helpers ────────────────────────────────────

  getGaugeOffset(value: number | null | undefined): number {
    const pct = value != null ? Math.min(Math.max(value, 0), 1) : 0
    const circumference = 2 * Math.PI * 54
    return circumference * (1 - pct)
  }

  getGaugeCircumference(): number {
    return 2 * Math.PI * 54
  }

  getGaugeDasharray(value: number | null | undefined): string {
    const pct = value != null ? Math.min(Math.max(value, 0), 1) : 0
    const circumference = 2 * Math.PI * 54
    const filled = pct * circumference
    return `${filled} ${circumference}`
  }

  getScoreColor(value: number | null | undefined): string {
    if (value == null) {return 'var(--flowx-text-disabled, #a6b0be)'}
    if (value >= 0.8) {return 'var(--flowx-success, #008060)'}
    if (value >= 0.5) {return 'var(--flowx-warning, #feb913)'}
    return 'var(--flowx-error, #e62200)'
  }

  getScorePercent(value: number | null | undefined): string {
    if (value == null) {return '-'}
    return (value * 100).toFixed(0) + '%'
  }

  // ── Metric bar helpers ───────────────────────────────────

  getMetricBarWidth(key: string): number {
    const v = this.metrics[key]
    if (v == null) {return 0}
    return Math.min(Math.max(v * 100, 0), 100)
  }

  getMetricBarColor(key: string): string {
    const v = this.metrics[key]
    return this.getScoreColor(v)
  }

  formatMetricLabel(key: string): string {
    const overrides: Record<string, string> = {
      pii_leakage: 'PII Leakage',
      rag_coverage: 'RAG Coverage',
    }
    if (overrides[key]) return overrides[key]
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  // ── Trend chart (tabbed) ─────────────────────────────────

  trendTabChanged(event: any): void {
    this.activeTrendTab = String(event)
    setTimeout(() => this.renderTrendChart(), 50)
  }

  private movingAverage(values: number[], window = 5): (number | null)[] {
    return values.map((_, i) => {
      const start = Math.max(0, i - window + 1)
      const slice = values.slice(start, i + 1).filter(v => v != null)
      return slice.length ? slice.reduce((a, b) => a + b, 0) / slice.length : null
    })
  }

  // FlowX color triplets for the trend tabs. Light/dark variants follow the
  // same CLAUDE.md guidance used by the ROI page: success/error/warning keep
  // their saturated hex in light, step up one shade in dark; interactive blue
  // lifts from blue-500 → blue-400. Purple is preserved for the Cost tab
  // since it's not in the FlowX palette but provides needed differentiation.
  private trendColor(tabIndex: number): { hex: string; rgb: string } {
    const isDark = document.documentElement.classList.contains('flowx-dark')
    if (tabIndex === 0) {  // Quality → green
      return isDark
        ? { hex: '#54aa94', rgb: '84, 170, 148' }    // green-300
        : { hex: '#339980', rgb: '51, 153, 128' }    // green-400
    }
    if (tabIndex === 1) {  // Safety → blue
      return isDark
        ? { hex: '#3389e0', rgb: '51, 137, 224' }    // blue-400
        : { hex: '#006bd8', rgb: '0, 107, 216' }     // blue-500
    }
    if (tabIndex === 2) {  // Performance → yellow
      return isDark
        ? { hex: '#fec742', rgb: '254, 199, 66' }    // yellow-400
        : { hex: '#feb913', rgb: '254, 185, 19' }    // yellow-500
    }
    // Cost → blue (FlowX interactive)
    return isDark
      ? { hex: '#3389e0', rgb: '51, 137, 224' }    // blue-400
      : { hex: '#006bd8', rgb: '0, 107, 216' }     // blue-500
  }

  private trendTooltip(): any {
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

  renderTrendChart(): void {
    const isDark = document.documentElement.classList.contains('flowx-dark')
    const textSecondary = isDark ? '#a6b0be' : '#64748b'
    const gridColor = 'rgba(99, 116, 139, 0.10)'
    const isRunMode = this.granularity === 'run'

    const tabIndex = parseInt(this.activeTrendTab, 10)
    const palette = this.trendColor(tabIndex)

    let series: any[] = []
    let label = 'Quality Score'
    let isPercent = true

    if (tabIndex === 0) {
      series = this.timeseriesData.quality || []
      label = 'Quality Score'
    } else if (tabIndex === 1) {
      series = this.timeseriesData.incidents || []
      label = 'Safety Score'
    } else if (tabIndex === 2) {
      series = this.timeseriesData.quality || []
      label = 'Executions'
      isPercent = false
    } else if (tabIndex === 3) {
      series = this.timeseriesData.quality || []
      label = 'Executions'
      isPercent = false
    }

    let labels: (string | number)[]
    if (isRunMode) {
      labels = series.map((_: any, i: number) => i + 1)
    } else {
      labels = series.map((p: any) => {
        const d = p.bucket_start || p.timestamp || p.date || ''
        if (!d) {return ''}
        try {
          const dt = new Date(d)
          return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        } catch {
          return d.length > 10 ? d.substring(5, 10) : d
        }
      })
    }

    let values: number[]
    if (tabIndex === 2 || tabIndex === 3) {
      values = series.map((p: any) => p.count ?? 0)
    } else if (tabIndex === 1) {
      values = series.map((p: any) => 1 - (p.value ?? 0))
    } else {
      values = series.map((p: any) => p.value ?? 0)
    }

    const trendValues = this.movingAverage(values)

    const yCallback = isPercent
      ? (v: any) => (v * 100).toFixed(0) + '%'
      : undefined

    const tickFont = { family: '"Open Sans", system-ui, sans-serif' }
    const xScale: any = isRunMode
      ? {
          type: 'linear',
          title: { display: true, text: 'Run #', color: textSecondary },
          min: 1,
          max: Math.max(series.length, 1),
          ticks: {
            stepSize: 1,
            color: textSecondary,
            font: tickFont,
            callback: (value: any) => Number.isInteger(value) ? `#${value}` : '',
          },
          border: { display: false },
          grid: { display: false, drawBorder: false },
        }
      : {
          ticks: { color: textSecondary, maxRotation: 45, font: tickFont },
          border: { display: false },
          grid: { display: false, drawBorder: false },
        }

    const rgb = palette.rgb
    this.trendChartData = {
      labels,
      datasets: [
        {
          label,
          data: values,
          borderColor: palette.hex,
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: palette.hex,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
          backgroundColor: (context: any) => {
            const { ctx, chartArea } = context.chart
            if (!chartArea) { return `rgba(${rgb}, 0.25)` }
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
            gradient.addColorStop(0, `rgba(${rgb}, 0.45)`)
            gradient.addColorStop(1, `rgba(${rgb}, 0)`)
            return gradient
          },
        },
        {
          label: 'Trend',
          data: trendValues,
          borderColor: `rgba(${rgb}, 0.5)`,
          backgroundColor: 'transparent',
          borderDash: [6, 3],
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 0,
        },
      ],
    }
    this.trendChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false, axis: 'x' },
      scales: {
        x: xScale,
        y: {
          beginAtZero: true,
          max: isPercent ? 1 : undefined,
          ticks: {
            color: textSecondary,
            font: tickFont,
            callback: yCallback,
          },
          border: { display: false },
          grid: { color: gridColor, drawBorder: false, drawTicks: false },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...this.trendTooltip(),
          callbacks: {
            title: (items: any[]) => {
              if (isRunMode && items.length) {
                return `Run #${items[0].label}`
              }
              return undefined
            },
            label: (ctx: any) => isPercent
              ? `${label}: ${(ctx.parsed.y * 100).toFixed(0)}%`
              : `${label}: ${ctx.parsed.y}`,
          },
        },
      },
    }
  }

  // ── Period label ────────────────────────────────────────

  getSelectedPeriodLabel(): string {
    const opt = this.periodOptions.find(o => o.value === this.hours)
    return opt ? opt.label : `Last ${this.hours}h`
  }

  // ── Alerts ───────────────────────────────────────────────

  getAlertSeverity(severity: string): string {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'danger'
      case 'high': return 'warn'
      case 'medium': return 'info'
      default: return 'secondary'
    }
  }

  getAlertBorderColor(severity: string): string {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'var(--flowx-error, #e62200)'
      case 'high': return 'var(--flowx-warning, #feb913)'
      case 'medium': return 'var(--flowx-interactive, #006bd8)'
      default: return 'var(--flowx-text-disabled, #a6b0be)'
    }
  }

  getAlertItemClass(severity: string): string {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'eval-alerts__item eval-alerts__item--critical'
      case 'warning': case 'high': return 'eval-alerts__item eval-alerts__item--warning'
      default: return 'eval-alerts__item eval-alerts__item--info'
    }
  }

  getAlertIconWrapClass(severity: string): string {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'eval-alerts__icon-wrap eval-alerts__icon-wrap--critical'
      case 'warning': case 'high': return 'eval-alerts__icon-wrap eval-alerts__icon-wrap--warning'
      default: return 'eval-alerts__icon-wrap eval-alerts__icon-wrap--info'
    }
  }

  getAlertIcon(severity: string): string {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'pi-exclamation-circle'
      case 'warning': case 'high': return 'pi-exclamation-triangle'
      default: return 'pi-info-circle'
    }
  }

  formatAlertType(type: string): string {
    if (!type) return 'Alert'
    return type.split('_').join(' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  getAlertMessage(alert: any): string {
    if (!alert) return ''
    if (typeof alert.message === 'string') return alert.message
    if (typeof alert.details === 'string') return alert.details
    // Handle object details - extract meaningful text, avoid [object Object]
    if (alert.details && typeof alert.details === 'object') {
      if (alert.details.run_count) return `${alert.details.run_count} runs affected`
      if (alert.details.hallucination_rate) return `Hallucination rate: ${(alert.details.hallucination_rate * 100).toFixed(0)}%`
      try {
        const keys = Object.keys(alert.details)
        if (keys.length > 0) {
          return keys.map(k => {
            const v = alert.details[k]
            if (v == null) return `${k}: -`
            if (typeof v === 'object') return `${k}: ${JSON.stringify(v)}`
            return `${k}: ${v}`
          }).join(', ')
        }
      } catch { /* ignore */ }
    }
    return ''
  }

  formatTimeAgo(dateString: string): string {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMins > 0) return `${diffMins}m ago`
    return 'Just now'
  }

  // All alerts dialog
  showAllAlerts = false
  get groupedAlerts(): { type: string, items: any[] }[] {
    const alerts = this.alerts || []
    const groups: Record<string, any[]> = {}
    for (const alert of alerts) {
      const type = (alert.alert_type || 'Other').split('_').join(' ')
      ;(groups[type] ??= []).push(alert)
    }
    return Object.entries(groups).map(([type, items]) => ({ type, items }))
  }

  getAlertSummary(alert: any): string {
    const drops = alert.details?.drops
    if (!drops || typeof drops !== 'object') return ''
    const entries = Object.entries(drops) as [string, any][]
    return entries
      .map(([key, val]) => {
        const label = key.replace(/_score$/, '').replace(/_/g, ' ')
        const prev = Math.round((val.previous ?? 0) * 100)
        const curr = Math.round((val.current ?? 0) * 100)
        return `${label}: ${prev}% → ${curr}%`
      })
      .join(', ')
  }

  getAlertTopDrop(alert: any): { label: string; prev: number; curr: number } | null {
    const drops = alert.details?.drops
    if (!drops || typeof drops !== 'object') return null
    const entries = Object.entries(drops) as [string, any][]
    if (!entries.length) return null
    const biggest = entries.reduce((a, b) => ((b[1].drop ?? 0) > (a[1].drop ?? 0) ? b : a))
    return {
      label: biggest[0].replace(/_score$/, '').replace(/_/g, ' '),
      prev: Math.round((biggest[1].previous ?? 0) * 100),
      curr: Math.round((biggest[1].current ?? 0) * 100),
    }
  }

  get displayedAlerts(): any[] {
    return this.alerts.slice(0, 5)
  }

  // ── Execution table helpers ──────────────────────────────

  getScoreClass(value: number | null | undefined): string {
    if (value == null) {return 'low'}
    if (value >= 0.8) {return 'high'}
    if (value >= 0.5) {return 'medium'}
    return 'low'
  }

  getScoreBadgeClass(score: number | null | undefined): string {
    if (score == null) {return 'bg-gray-100 text-gray-600'}
    if (score >= 0.8) {return 'bg-green-100 text-green-700'}
    if (score >= 0.5) {return 'bg-yellow-100 text-yellow-700'}
    return 'bg-red-100 text-red-700'
  }

  getStatusLabel(score: number | null | undefined): string {
    if (score == null) {return '-'}
    if (score >= 0.8) {return 'Safe'}
    if (score >= 0.5) {return 'Warning'}
    return 'Critical'
  }

  getStatusSeverity(score: number | null | undefined): string {
    if (score == null) {return 'secondary'}
    if (score >= 0.8) {return 'success'}
    if (score >= 0.5) {return 'warn'}
    return 'danger'
  }

  formatLatency(ms: number | null | undefined): string {
    if (ms == null) {return '-'}
    if (ms >= 1000) {return (ms / 1000).toFixed(1) + 's'}
    return ms.toFixed(0) + 'ms'
  }

  formatTokens(tokens: number | null | undefined): string {
    if (tokens == null) {return '-'}
    if (tokens >= 1000) {return (tokens / 1000).toFixed(1) + 'k'}
    return String(tokens)
  }

  formatCost(cost: number | null | undefined): string {
    if (cost == null) {return '-'}
    return '$' + cost.toFixed(4)
  }

  // ── Run Evaluation action ────────────────────────────────

  async triggerEval(exec: any): Promise<any> {
    const id = exec.run_id || exec.id
    if (!id) {return}
    exec._evaluating = true
    try {
      const result = await this.dashboardService.triggerEvaluation(id)
      if (result?.error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not trigger evaluation.' })
      } else {
        this.messageService.add({ severity: 'success', summary: 'Evaluation Triggered', detail: 'Evaluation started for run ' + id.substring(0, 8) + '...' })
      }
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to trigger evaluation.' })
    } finally {
      exec._evaluating = false
    }
  }

  // ── Run latest evaluation ────────────────────────────────

  async runEvaluation(): Promise<any> {
    if (!this.executions.length) {
      this.messageService.add({ severity: 'warn', summary: 'No Executions', detail: 'No executions available to evaluate.' })
      return
    }
    const latest = this.executions[0]
    await this.triggerEval(latest)
  }

  // ── Detail Drawer ────────────────────────────────────────

  async openRunDetail(exec: any): Promise<any> {
    const id = exec.run_id || exec.id
    if (!id) {return}
    this.drawerVisible = true
    this.drawerLoading = true
    this.selectedRunDetail = null
    this.phaseDetailsExpanded = false
    try {
      const result = await this.dashboardService.getInsightsRunDetail(id)
      if (result?.error) {
        this.selectedRunDetail = null
      } else {
        this.selectedRunDetail = result
      }
    } catch {
      this.selectedRunDetail = null
    } finally {
      this.drawerLoading = false
    }
  }

  closeDrawer(e?: Event): void {
    if (e) {
      this.evalDrawerRef.close(e)
    } else {
      this.drawerVisible = false
    }
    this.selectedRunDetail = null
  }

  // ── Drawer metric bar helpers ────────────────────────────

  getRunMetricValue(key: string): number {
    return this.selectedRunDetail?.scores?.[key] ?? 0
  }

  getRunMetricWidth(key: string): number {
    return Math.min(Math.max(this.getRunMetricValue(key) * 100, 0), 100)
  }

  getRunMetricColor(key: string): string {
    return this.getScoreColor(this.getRunMetricValue(key))
  }

  // ── Phase/step helpers ───────────────────────────────────

  get steps(): any[] {
    return Array.isArray(this.selectedRunDetail?.steps) ? this.selectedRunDetail.steps : []
  }

  getStepMetrics(stepId: string): any[] {
    const allMetrics = this.selectedRunDetail?.metrics
    if (!allMetrics || typeof allMetrics !== 'object') {return []}
    // metrics shape: { metricName: { stepId: { score, justification, recommendation } } }
    const result: any[] = []
    for (const [metricName, stepData] of Object.entries(allMetrics)) {
      if (stepData && typeof stepData === 'object') {
        const entry = (stepData as any)[stepId]
        if (entry && typeof entry === 'object') {
          result.push({
            name: metricName,
            score: entry.score ?? 0,
            justification: entry.justification || '',
            recommendation: entry.recommendation || '',
          })
        }
      }
    }
    return result
  }

  getStepModel(stepId: string): string {
    return this.selectedRunDetail?.model_name?.[stepId] || ''
  }

  getTrajectoryScore(): number | null {
    const ta = this.selectedRunDetail?.trajectory_accuracy
    if (ta == null) {return null}
    if (typeof ta === 'number') {return ta}
    // dict shape: { score: 0.x } or { value: 0.x } or { accuracy: 0.x }
    return ta.score ?? ta.value ?? ta.accuracy ?? null
  }

  // ── Metric detail dialog ─────────────────────────────────

  openMetricDialog(metric: any): void {
    this.selectedMetricDetail = metric
    this.metricDialogVisible = true
  }

  closeMetricDialog(): void {
    this.metricDialogVisible = false
    this.selectedMetricDetail = null
  }
}
