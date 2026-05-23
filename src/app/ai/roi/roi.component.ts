import { Component, OnDestroy, OnInit } from '@angular/core'
import { ConfirmationService, MessageService } from 'primeng/api'
import { Subscription, debounceTime } from 'rxjs'
import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'
import { RoiService } from '../services/roi.service'
import { OrgService } from '../services/orgs.service'
import { DashboardService } from '../services/dashboard.service'
import { resolveDefaultAppOrg } from '../utils/default-app'

@Component({
  selector: 'app-roi',
  templateUrl: './roi.component.html',
  providers: [MessageService],
  standalone: false,
})
export class RoiComponent implements OnInit, OnDestroy {
  orgs: any[] = []
  apps: any[] = []
  selectedOrg: any = null
  selectedApp: any = null
  workspaces: any[] = []
  selectedWorkspace: any = null
  activeTab = '0'

  // Period
  periodStart = ''
  periodEnd = ''

  // Tab 0: Financial ROI
  financialForm: any = {
    infrastructure_cost: 0,
    labor_cost_saved: 0,
    revenue_attributed: 0,
    compliance_penalty_risk: 0,
    audit_cost_avoided: 0,
    error_remediation_cost: 0,
    // v2 baseline
    manual_effort_hours_per_execution: 0,
    manual_effort_hourly_rate: 50,
    task_description: '',
    execution_frequency: 'per_execution',
    avg_executions_per_period: 0,
    // v2 compliance risk
    compliance_framework: null,
    regulatory_fine_exposure: 0,
    regulatory_failure_probability: 0,
    operational_risk_reduction: 0,
    employee_turnover_savings: 0,
    vendor_lockin_cost: 0,
    governance_overhead_cost: 0,
  }
  financialResult: any = null
  savedFinancials: any[] = []
  waterfallChart: any = null
  waterfallOptions: any = null
  showBaseline = true
  showComplianceRisk = false
  baselineDialogVisible = false
  complianceDialogVisible = false
  costsDialogVisible = false

  executionFrequencyOptions = [
    { label: 'Per Execution', value: 'per_execution' },
    { label: 'Daily', value: 'daily' },
    { label: 'Monthly', value: 'monthly' },
  ]

  complianceFrameworkOptions = [
    { label: 'EU AI Act', value: 'EU AI Act' },
    { label: 'HIPAA', value: 'HIPAA' },
    { label: 'SOC2', value: 'SOC2' },
    { label: 'GDPR', value: 'GDPR' },
    { label: 'ISO 42001', value: 'ISO 42001' },
    { label: 'Custom', value: 'Custom' },
  ]

  hourlyRatePresets = [
    { label: '$30/hr', value: 30 },
    { label: '$50/hr', value: 50 },
    { label: '$75/hr', value: 75 },
    { label: '$150/hr', value: 150 },
  ]

  // Agent Baselines (per-agent)
  agentBaselines: any[] = []
  agentBreakdown: any[] = []

  // ROI Trend
  trendData: any[] = []
  trendChart: any = null
  trendOptions: any = null

  // ROI Projection
  projectionResult: any = null

  // Per-Execution ROI
  executionRois: any[] = []
  executionRoiPage = 1

  // Tab 1: Compliance ROI
  frameworks: any[] = []
  frameworkOptions: any[] = []
  selectedFramework: any = null
  hourlyRate = 150
  complianceResult: any = null
  savedCompliance: any[] = []
  auditDialogVisible = false
  complianceForm: any = {
    audit_failure_risk_baseline: 10,
    audit_failure_risk_with_agent: 0.1,
    regulatory_response_time_baseline_days: 40,
    regulatory_response_time_with_agent_days: 2,
    compliance_confidence_baseline: 60,
    compliance_confidence_with_agent: 95,
  }

  // Tab 2: Alternative Benchmarks
  benchmarks: any[] = []
  benchmarkComparison: any = null
  tcoComparison: any = null
  benchmarkDialogVisible = false
  benchmarkForm: any = this.getEmptyBenchmarkForm()
  editingBenchmark: any = null
  alternativeTypeOptions = [
    { label: 'RPA', value: 'rpa' },
    { label: 'Outsource', value: 'outsource' },
    { label: 'Hire', value: 'hire' },
    { label: 'Manual', value: 'manual' },
    { label: 'Custom', value: 'custom' },
  ]
  auditReadinessOptions = [
    { label: 'Excellent', value: 'excellent' },
    { label: 'Fair', value: 'fair' },
    { label: 'Poor', value: 'poor' },
  ]
  satisfactionOptions = [
    { label: 'High', value: 'high' },
    { label: 'Neutral', value: 'neutral' },
    { label: 'Negative', value: 'negative' },
  ]

  // Tab 3: Sensitivity Analysis
  sensitivityDialogVisible = false
  sensitivityParams: any = {
    llm_cost: { min: 0, max: 1000, likely: 500 },
    infrastructure_cost: { min: 0, max: 500, likely: 200 },
    labor_cost_saved: { min: 0, max: 5000, likely: 2500 },
    revenue_attributed: { min: 0, max: 10000, likely: 3000 },
    compliance_penalty_risk: { min: 0, max: 2000, likely: 500 },
    error_remediation_cost: { min: 0, max: 1000, likely: 300 },
  }
  numSimulations = 10000
  sensitivityResult: any = null
  histogramChart: any = null
  histogramOptions: any = null
  tornadoChart: any = null
  tornadoOptions: any = null
  sensitivityHistory: any[] = []
  selectedScenario = 'base'

  // Tab 4: Agent Comparison
  selectedCompareApps: any[] = []
  agentComparison: any[] = []
  agentComparisonChart: any = null
  agentComparisonChartOptions: any = null

  // Tab 5: Value Outcome Units
  vouGroups: { group: string; agents: any[]; totals: any }[] = []
  vouChart: any = null
  vouChartOptions: any = null

  loading = false

  private themeSubscription?: Subscription

  constructor(
    private roiService: RoiService,
    private orgService: OrgService,
    private dashboardService: DashboardService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private layoutService: LayoutService,
  ) {
    // Chart.js doesn't react to .flowx-dark class toggles on <html>, so
    // rebuild the VOU chart (gradients + theme-aware text/grid colors)
    // whenever the layout config changes. Matches the analytics activity
    // chart pattern referenced in CLAUDE.md.
    this.themeSubscription = this.layoutService.configUpdate$
      .pipe(debounceTime(25))
      .subscribe(() => {
        if (this.vouGroups.length > 0) { this.buildVouChart() }
        if (this.financialResult?.waterfall) { this.buildWaterfallChart() }
        if (this.trendData.length > 0) { this.buildTrendChart() }
        if (this.sensitivityResult?.histogram) { this.buildHistogramChart() }
        if (this.sensitivityResult?.tornado?.length) { this.buildTornadoChart() }
        if (this.agentComparison.length > 0) { this.buildAgentComparisonChart() }
      })
  }

  ngOnDestroy(): void {
    this.themeSubscription?.unsubscribe()
  }

  ngOnInit(): void {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    this.periodStart = start.toISOString().split('T')[0]
    this.periodEnd = now.toISOString().split('T')[0]
    this.loadOrgs()
  }

  getWorkspaces(org_id: any): any[] {
    const org = this.orgs?.find((item) => item.id === org_id)
    return org?.workspaces || []
  }

  getAppsFromWorkspace(org: any, workspace_id: any): any[] {
    if (workspace_id) {
      const ws = org?.workspaces?.find((w: any) => w.id === workspace_id)
      return (ws?.projects || []).filter((p: any) => p.is_active)
    }
    return (org?.projects || []).filter((p: any) => p.is_active)
  }

  getDefaultAppOrg(): { org: any; workspace: any; app: any } {
    return resolveDefaultAppOrg(this.orgs)
  }

  async loadOrgs(): Promise<any> {
    const data = await this.orgService.getOrgsWithApps()
    this.orgs = data || []
    if (this.orgs.length > 0) {
      const { org, workspace, app } = this.getDefaultAppOrg()
      this.selectedOrg = org
      this.workspaces = this.getWorkspaces(this.selectedOrg?.id)
      this.selectedWorkspace = workspace?.id || null
      this.apps = this.getAppsFromWorkspace(this.selectedOrg, this.selectedWorkspace)
      if (app) {
        this.selectedApp = app
        this.loadAgentBaselines()
      } else {
        this.selectedApp = this.apps.length > 0 ? this.apps[0] : null
        if (this.selectedApp) { this.loadAgentBaselines() }
      }
      this.loadFrameworks()
    }
  }

  onOrgChange(): void {
    this.workspaces = this.getWorkspaces(this.selectedOrg?.id)
    this.selectedWorkspace = this.workspaces?.length > 0 ? this.workspaces[0].id : null
    this.apps = this.getAppsFromWorkspace(this.selectedOrg, this.selectedWorkspace)
    this.selectedApp = this.apps.length > 0 ? this.apps[0] : null
    this.loadFrameworks()
    this.resetAll()
  }

  workspaceChanged(event: any): void {
    this.apps = this.getAppsFromWorkspace(this.selectedOrg, this.selectedWorkspace)
    this.selectedApp = this.apps.length > 0 ? this.apps[0] : null
    this.resetAll()
    if (this.selectedApp) { this.loadAgentBaselines() }
  }

  onAppChange(): void {
    this.resetAll()
    this.loadAgentBaselines()
  }

  async loadFrameworks(): Promise<any> {
    if (!this.selectedOrg) {return}
    this.frameworks = await this.dashboardService.getFrameworks(this.selectedOrg.id)
    this.frameworkOptions = (this.frameworks || []).map((f: any) => ({
      label: `${f.short_name} (${f.version || ''})`,
      value: f,
    }))
    if (this.frameworks?.length > 0) {
      this.selectedFramework = this.frameworks[0]
    }
  }

  resetAll(): void {
    this.financialResult = null
    this.savedFinancials = []
    this.waterfallChart = null
    this.complianceResult = null
    this.savedCompliance = []
    this.benchmarks = []
    this.benchmarkComparison = null
    this.tcoComparison = null
    this.sensitivityResult = null
    this.histogramChart = null
    this.tornadoChart = null
    this.sensitivityHistory = []
    this.trendData = []
    this.trendChart = null
    this.projectionResult = null
    this.executionRois = []
    this.agentComparison = []
    this.agentComparisonChart = null
    this.agentBaselines = []
    this.agentBreakdown = []
    this.vouGroups = []
    this.vouChart = null
  }

  // ── Tab 0: Financial ROI ──────────────────────────────

  async computeFinancial(): Promise<any> {
    if (!this.selectedOrg || !this.selectedApp) {return}
    this.loading = true
    try {
      const body = {
        project_id: this.selectedApp.id,
        period_start: new Date(this.periodStart).toISOString(),
        period_end: new Date(this.periodEnd).toISOString(),
        ...this.financialForm,
        regulatory_failure_probability: this.financialForm.regulatory_failure_probability / 100,
      }
      this.financialResult = await this.roiService.computeFinancial(this.selectedOrg.id, body)
      this.buildWaterfallChart()
      this.messageService.add({ severity: 'success', summary: 'Financial ROI computed' })
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Computation failed' })
    }
    this.loading = false
  }

  async saveFinancial(): Promise<any> {
    if (!this.selectedOrg || !this.selectedApp) {return}
    this.loading = true
    try {
      const body = {
        project_id: this.selectedApp.id,
        period_start: new Date(this.periodStart).toISOString(),
        period_end: new Date(this.periodEnd).toISOString(),
        ...this.financialForm,
        regulatory_failure_probability: this.financialForm.regulatory_failure_probability / 100,
      }
      await this.roiService.saveFinancial(this.selectedOrg.id, body)
      this.messageService.add({ severity: 'success', summary: 'Financial metrics saved' })
      await this.loadSavedFinancials()
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Save failed' })
    }
    this.loading = false
  }

  async loadSavedFinancials(): Promise<any> {
    if (!this.selectedOrg || !this.selectedApp) {return}
    const data = await this.roiService.listFinancial(this.selectedOrg.id, this.selectedApp.id)
    this.savedFinancials = Array.isArray(data) ? data : []
  }

  async deleteFinancial(item: any): Promise<any> {
    if (!this.selectedOrg) {return}
    await this.roiService.deleteFinancial(this.selectedOrg.id, item.id)
    this.messageService.add({ severity: 'success', summary: 'Deleted' })
    await this.loadSavedFinancials()
  }

  buildWaterfallChart(): void {
    if (!this.financialResult?.waterfall) {return}
    const items = this.financialResult.waterfall
    const labels = items.map((i: any) => i.label)

    const cost = this.roiColor('error')
    const benefit = this.roiColor('success')
    const total = this.roiColor('interactive')
    const roleFor = (t: string): { hex: string; rgb: string } => {
      if (t === 'cost') {return cost}
      if (t === 'benefit') {return benefit}
      return total
    }
    const hexes = items.map((i: any) => roleFor(i.type).hex)
    const rgbs  = items.map((i: any) => roleFor(i.type).rgb)

    let running = 0
    const data = items.map((item: any) => {
      if (item.type === 'total') {
        return item.value >= 0 ? [0, item.value] : [item.value, 0]
      }
      const start = running
      running += item.value
      return item.value >= 0 ? [start, running] : [running, start]
    })

    this.waterfallChart = {
      labels,
      datasets: [{
        label: 'ROI Waterfall',
        data,
        backgroundColor: this.roiGradient(rgbs),
        borderColor: hexes,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }],
    }

    const wc = this.getChartColors()
    this.waterfallOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false, axis: 'x' },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...this.flowxTooltip(),
          callbacks: {
            label: (ctx: any) => {
              const raw = ctx.raw
              const val = Array.isArray(raw) ? raw[1] - raw[0] : raw
              return `$${val.toLocaleString()}`
            },
          },
        },
      },
      scales: {
        x: {
          ...this.roiAxisStyle(wc.textSecondary),
          grid: { display: false, drawBorder: false },
        },
        y: {
          ...this.roiAxisStyle(wc.textSecondary),
          title: { display: true, text: 'Amount ($)', color: wc.textColor },
        },
      },
    }
  }

  // ── Agent Baselines ──────────────────────────────────

  async loadAgentBaselines(): Promise<any> {
    if (!this.selectedOrg || !this.selectedApp) {return}
    try {
      const data = await this.roiService.listBaselines(this.selectedOrg.id, this.selectedApp.id)
      this.agentBaselines = Array.isArray(data) ? data : []
    } catch {
      this.agentBaselines = []
    }

    // Hydrate the project-level form from the configured agent baseline(s) so
    // the "Compute" button (which reads form values) produces a realistic ROI
    // instead of always returning negative because hours/rate default to 0/$50.
    // Aggregate across baselines: sum executions, weighted-avg hours/rate.
    if (this.agentBaselines.length > 0) {
      const totalExec = this.agentBaselines.reduce(
        (acc: number, b: any) => acc + Number(b.avg_executions_per_period || 0), 0)
      if (totalExec > 0) {
        const weightedHours = this.agentBaselines.reduce(
          (acc: number, b: any) => acc + Number(b.manual_effort_hours_per_execution || 0)
                                       * Number(b.avg_executions_per_period || 0), 0) / totalExec
        const weightedRate = this.agentBaselines.reduce(
          (acc: number, b: any) => acc + Number(b.manual_effort_hourly_rate || 0)
                                       * Number(b.avg_executions_per_period || 0), 0) / totalExec
        this.financialForm.manual_effort_hours_per_execution = Number(weightedHours.toFixed(2))
        this.financialForm.manual_effort_hourly_rate = Number(weightedRate.toFixed(2))
        this.financialForm.avg_executions_per_period = totalExec
      }
    }

    // Auto-compute financial ROI to populate KPI cards on load.
    // Prefer per-agent compute when baselines exist; otherwise fall back to
    // the project-form path (now hydrated above).
    if (this.agentBaselines.length > 0) {
      this.computeFinancialByAgents(true)
    } else {
      this.autoComputeFinancial()
    }
  }

  private async autoComputeFinancial(): Promise<any> {
    if (!this.selectedOrg || !this.selectedApp) {return}
    try {
      const body = {
        project_id: this.selectedApp.id,
        period_start: new Date(this.periodStart).toISOString(),
        period_end: new Date(this.periodEnd).toISOString(),
        ...this.financialForm,
        regulatory_failure_probability: this.financialForm.regulatory_failure_probability / 100,
      }
      this.financialResult = await this.roiService.computeFinancial(this.selectedOrg.id, body)
      this.buildWaterfallChart()
    } catch {
      // Silently fail - user can still manually compute
    }
  }

  async computeFinancialByAgents(silent: boolean = false): Promise<any> {
    if (!this.selectedOrg || !this.selectedApp || this.agentBaselines.length === 0) {return}
    this.loading = true
    try {
      const body = {
        project_id: this.selectedApp.id,
        period_start: new Date(this.periodStart).toISOString(),
        period_end: new Date(this.periodEnd).toISOString(),
        infrastructure_cost: this.financialForm.infrastructure_cost,
        revenue_attributed: this.financialForm.revenue_attributed,
        compliance_penalty_risk: this.financialForm.compliance_penalty_risk,
        audit_cost_avoided: this.financialForm.audit_cost_avoided,
        error_remediation_cost: this.financialForm.error_remediation_cost,
        regulatory_fine_exposure: this.financialForm.regulatory_fine_exposure,
        regulatory_failure_probability: this.financialForm.regulatory_failure_probability / 100,
        operational_risk_reduction: this.financialForm.operational_risk_reduction,
        employee_turnover_savings: this.financialForm.employee_turnover_savings,
        vendor_lockin_cost: this.financialForm.vendor_lockin_cost,
        governance_overhead_cost: this.financialForm.governance_overhead_cost,
      }
      const result = await this.roiService.computeFinancialByAgents(this.selectedOrg.id, body)
      this.financialResult = result
      this.agentBreakdown = Array.isArray(result?.agents) ? result.agents : []
      this.buildWaterfallChart()
      if (!silent) {
        this.messageService.add({ severity: 'success', summary: 'Per-agent financial ROI computed' })
      }
    } catch (e) {
      if (!silent) {
        this.messageService.add({ severity: 'error', summary: 'Per-agent computation failed' })
      }
    }
    this.loading = false
  }

  // ── ROI Trend ────────────────────────────────────────

  async loadRoiTrend(): Promise<any> {
    if (!this.selectedOrg || !this.selectedApp) {return}
    this.loading = true
    try {
      const body = {
        project_id: this.selectedApp.id,
        period_start: new Date(this.periodStart).toISOString(),
        period_end: new Date(this.periodEnd).toISOString(),
        granularity: 'daily',
      }
      const data = await this.roiService.getRoiTrend(this.selectedOrg.id, body)
      this.trendData = Array.isArray(data) ? data : []
      this.buildTrendChart()
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Failed to load trend' })
    }
    this.loading = false
  }

  buildTrendChart(): void {
    if (this.trendData.length === 0) {
      this.trendChart = null
      return
    }
    const labels = this.trendData.map((d: any) => d.date)
    const savings = this.trendData.map((d: any) => d.cumulative_savings)
    const counts = this.trendData.map((d: any) => d.execution_count)

    const savingsColor = this.roiColor('success')
    const execColor = this.roiColor('interactive')

    this.trendChart = {
      labels,
      datasets: [
        {
          label: 'Cumulative Savings ($)',
          data: savings,
          borderColor: savingsColor.hex,
          backgroundColor: this.roiGradient(savingsColor.rgb),
          borderWidth: 2,
          fill: true,
          yAxisID: 'y',
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: savingsColor.hex,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
        },
        {
          label: 'Agent Executions',
          data: counts,
          borderColor: execColor.hex,
          backgroundColor: this.roiGradient(execColor.rgb),
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
          type: 'bar',
          yAxisID: 'y1',
        },
      ],
    }

    const tc = this.getChartColors()
    this.trendOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false, axis: 'x' },
      plugins: {
        legend: {
          display: true,
          labels: { color: tc.textColor, usePointStyle: true, padding: 16 },
        },
        tooltip: this.flowxTooltip(),
      },
      scales: {
        x: {
          ...this.roiAxisStyle(tc.textSecondary),
          ticks: { color: tc.textSecondary, maxRotation: 45, font: { family: '"Open Sans", system-ui, sans-serif' } },
          grid: { display: false, drawBorder: false },
        },
        y: {
          ...this.roiAxisStyle(tc.textSecondary),
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Cumulative Savings ($)', color: tc.textColor },
        },
        y1: {
          ...this.roiAxisStyle(tc.textSecondary),
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'Execution Count', color: tc.textColor },
          grid: { drawOnChartArea: false, drawBorder: false },
        },
      },
    }
  }

  // ── ROI Projection ───────────────────────────────────

  async loadProjection(): Promise<any> {
    if (!this.selectedOrg || !this.selectedApp) {return}
    try {
      this.projectionResult = await this.roiService.getRoiProjection(this.selectedOrg.id, {
        project_id: this.selectedApp.id,
      })
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Projection failed' })
    }
  }

  // ── Per-Execution ROI ─────────────────────────────────

  async computeExecutionRoi(): Promise<any> {
    if (!this.selectedOrg || !this.selectedApp) {return}
    this.loading = true
    try {
      const result = await this.roiService.computeExecutionRoi(this.selectedOrg.id, {
        project_id: this.selectedApp.id,
      })
      this.messageService.add({
        severity: 'success',
        summary: `Computed ${result?.created || 0} execution ROI records`,
      })
      await this.loadExecutionRois()
      await this.loadRoiTrend()
      await this.loadProjection()
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Batch compute failed' })
    }
    this.loading = false
  }

  async loadExecutionRois(): Promise<any> {
    if (!this.selectedOrg || !this.selectedApp) {return}
    const data = await this.roiService.listExecutionRoi(
      this.selectedOrg.id, this.selectedApp.id, this.executionRoiPage,
    )
    this.executionRois = Array.isArray(data) ? data : []
  }

  // ── Tab 1: Compliance ROI ─────────────────────────────

  async computeCompliance(): Promise<any> {
    if (!this.selectedOrg || !this.selectedApp) {return}
    this.loading = true
    try {
      const body = {
        project_id: this.selectedApp.id,
        framework_id: this.selectedFramework?.id || null,
        hourly_auditor_rate: this.hourlyRate,
        audit_failure_risk_baseline: this.complianceForm.audit_failure_risk_baseline / 100,
        audit_failure_risk_with_agent: this.complianceForm.audit_failure_risk_with_agent / 100,
        regulatory_response_time_baseline_days: this.complianceForm.regulatory_response_time_baseline_days,
        regulatory_response_time_with_agent_days: this.complianceForm.regulatory_response_time_with_agent_days,
        compliance_confidence_baseline: this.complianceForm.compliance_confidence_baseline,
        compliance_confidence_with_agent: this.complianceForm.compliance_confidence_with_agent,
      }
      this.complianceResult = await this.roiService.computeCompliance(this.selectedOrg.id, body)
      this.messageService.add({ severity: 'success', summary: 'Compliance ROI computed' })
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Computation failed' })
    }
    this.loading = false
  }

  async saveCompliance(): Promise<any> {
    if (!this.selectedOrg || !this.selectedApp) {return}
    this.loading = true
    try {
      const body = {
        project_id: this.selectedApp.id,
        framework_id: this.selectedFramework?.id || null,
        hourly_auditor_rate: this.hourlyRate,
        audit_failure_risk_baseline: this.complianceForm.audit_failure_risk_baseline / 100,
        audit_failure_risk_with_agent: this.complianceForm.audit_failure_risk_with_agent / 100,
        regulatory_response_time_baseline_days: this.complianceForm.regulatory_response_time_baseline_days,
        regulatory_response_time_with_agent_days: this.complianceForm.regulatory_response_time_with_agent_days,
        compliance_confidence_baseline: this.complianceForm.compliance_confidence_baseline,
        compliance_confidence_with_agent: this.complianceForm.compliance_confidence_with_agent,
      }
      await this.roiService.saveCompliance(this.selectedOrg.id, body)
      this.messageService.add({ severity: 'success', summary: 'Compliance ROI saved' })
      await this.loadSavedCompliance()
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Save failed' })
    }
    this.loading = false
  }

  async loadSavedCompliance(): Promise<any> {
    if (!this.selectedOrg || !this.selectedApp) {return}
    const data = await this.roiService.listCompliance(this.selectedOrg.id, this.selectedApp.id)
    this.savedCompliance = Array.isArray(data) ? data : []
  }

  // ── Tab 2: Benchmarks ────────────────────────────────

  async loadBenchmarks(): Promise<any> {
    if (!this.selectedOrg || !this.selectedApp) {return}
    const data = await this.roiService.listBenchmarks(this.selectedOrg.id, this.selectedApp.id)
    this.benchmarks = Array.isArray(data) ? data : []
  }

  getEmptyBenchmarkForm(): any {
    return {
      name: '',
      alternative_type: 'manual',
      monthly_cost: 0,
      setup_cost: 0,
      annual_maintenance_cost: 0,
      error_rate_percent: 0,
      scalability_score: 0,
      compliance_readiness_score: 0,
      throughput_per_month: 0,
      time_to_deploy_days: 0,
      accuracy_percent: 0,
      audit_readiness: 'fair',
      regulatory_approval_days: 0,
      employee_satisfaction_impact: 'neutral',
      year_1_cost: 0,
      ongoing_annual_cost: 0,
    }
  }

  openNewBenchmark(): void {
    this.editingBenchmark = null
    this.benchmarkForm = this.getEmptyBenchmarkForm()
    this.benchmarkDialogVisible = true
  }

  openEditBenchmark(b: any): void {
    this.editingBenchmark = b
    this.benchmarkForm = { ...this.getEmptyBenchmarkForm(), ...b }
    this.benchmarkDialogVisible = true
  }

  async saveBenchmark(): Promise<any> {
    if (!this.selectedOrg || !this.selectedApp || !this.benchmarkForm.name) {
      this.messageService.add({ severity: 'warn', summary: 'Name is required' })
      return
    }
    try {
      const body = { ...this.benchmarkForm, project_id: this.selectedApp.id }
      if (this.editingBenchmark) {
        await this.roiService.updateBenchmark(this.selectedOrg.id, this.editingBenchmark.id, body)
        this.messageService.add({ severity: 'success', summary: 'Benchmark updated' })
      } else {
        await this.roiService.createBenchmark(this.selectedOrg.id, body)
        this.messageService.add({ severity: 'success', summary: 'Benchmark created' })
      }
      this.benchmarkDialogVisible = false
      await this.loadBenchmarks()
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Save failed' })
    }
  }

  confirmDeleteBenchmark(b: any, event: Event): void {
    event.stopPropagation()
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Delete benchmark "${b.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteBenchmark(b),
    })
  }

  async deleteBenchmark(b: any): Promise<any> {
    if (!this.selectedOrg) {return}
    await this.roiService.deleteBenchmark(this.selectedOrg.id, b.id)
    this.messageService.add({ severity: 'success', summary: 'Benchmark deleted' })
    await this.loadBenchmarks()
  }

  async compareBenchmarks(): Promise<any> {
    if (!this.selectedOrg || !this.selectedApp) {return}
    this.loading = true
    try {
      this.benchmarkComparison = await this.roiService.compareBenchmarks(
        this.selectedOrg.id,
        { project_id: this.selectedApp.id }
      )
      this.messageService.add({ severity: 'success', summary: 'Comparison generated' })
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Comparison failed' })
    }
    this.loading = false
  }

  async compare5Year(): Promise<any> {
    if (!this.selectedOrg || !this.selectedApp) {return}
    this.loading = true
    try {
      this.tcoComparison = await this.roiService.compare5Year(
        this.selectedOrg.id,
        { project_id: this.selectedApp.id }
      )
      this.messageService.add({ severity: 'success', summary: '5-Year TCO generated' })
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'TCO comparison failed' })
    }
    this.loading = false
  }

  getTypeLabel(type: string): string {
    const map: any = { rpa: 'RPA', outsource: 'Outsource', hire: 'Hire', manual: 'Manual', custom: 'Custom' }
    return map[type] || type
  }

  getTypeSeverity(type: string): string {
    const map: any = { rpa: 'info', outsource: 'warn', hire: 'success', manual: 'secondary', custom: 'contrast' }
    return map[type] || 'secondary'
  }

  getAuditReadinessColor(val: string): string {
    if (val === 'excellent') {return 'var(--flowx-success, #008060)'}
    if (val === 'poor') {return 'var(--flowx-error, #e62200)'}
    return 'var(--flowx-warning, #feb913)'
  }

  // ── Tab 3: Sensitivity Analysis ───────────────────────

  get sensitivityParamKeys(): string[] {
    return Object.keys(this.sensitivityParams)
  }

  getParamLabel(key: string): string {
    const map: any = {
      llm_cost: 'LLM Cost',
      infrastructure_cost: 'Infrastructure Cost',
      labor_cost_saved: 'Labor Cost Saved',
      revenue_attributed: 'Revenue Attributed',
      compliance_penalty_risk: 'Compliance Penalty Risk',
      error_remediation_cost: 'Error Remediation Cost',
      vendor_lockin_cost: 'Vendor Lock-in Cost',
      governance_overhead_cost: 'Governance Overhead',
      compliance_upside: 'Avoided Regulatory Fines',
      operational_risk_reduction: 'Risk Reduction',
      employee_turnover_savings: 'Turnover Savings',
    }
    return map[key] || key
  }

  async runSensitivity(): Promise<any> {
    if (!this.selectedOrg || !this.selectedApp) {return}
    this.loading = true
    try {
      const body = {
        project_id: this.selectedApp.id,
        parameters: this.sensitivityParams,
        num_simulations: this.numSimulations,
      }
      const result = await this.roiService.runSensitivity(this.selectedOrg.id, body)
      if (result?.results) {
        this.sensitivityResult = result.results
        this.buildHistogramChart()
        this.buildTornadoChart()
        this.messageService.add({ severity: 'success', summary: 'Simulation complete' })
      } else {
        this.sensitivityResult = result
        this.messageService.add({ severity: 'warn', summary: 'Simulation returned no results' })
      }
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Simulation failed' })
    }
    this.loading = false
  }

  buildHistogramChart(): void {
    if (!this.sensitivityResult?.histogram) {return}
    const bins = this.sensitivityResult.histogram
    const labels = bins.map((b: any) => `$${b.bin_start.toLocaleString()}`)
    const data = bins.map((b: any) => b.count)

    const positive = this.roiColor('success')
    const negative = this.roiColor('error')
    const hexes = bins.map((b: any) => b.bin_start >= 0 ? positive.hex : negative.hex)
    const rgbs  = bins.map((b: any) => b.bin_start >= 0 ? positive.rgb : negative.rgb)

    this.histogramChart = {
      labels,
      datasets: [{
        label: 'Frequency',
        data,
        backgroundColor: this.roiGradient(rgbs),
        borderColor: hexes,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }],
    }

    const hc = this.getChartColors()
    this.histogramOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false, axis: 'x' },
      plugins: {
        legend: { display: false },
        tooltip: this.flowxTooltip(),
      },
      scales: {
        x: {
          ...this.roiAxisStyle(hc.textSecondary),
          title: { display: true, text: 'ROI ($)', color: hc.textColor },
          ticks: { maxTicksLimit: 10, color: hc.textSecondary, font: { family: '"Open Sans", system-ui, sans-serif' } },
          grid: { display: false, drawBorder: false },
        },
        y: {
          ...this.roiAxisStyle(hc.textSecondary),
          title: { display: true, text: 'Frequency', color: hc.textColor },
        },
      },
    }
  }

  buildTornadoChart(): void {
    if (!this.sensitivityResult?.tornado?.length) {
      this.tornadoChart = null
      return
    }
    const tornado = this.sensitivityResult.tornado
    const labels = tornado.map((t: any) => this.getParamLabel(t.parameter))
    const baseline = this.sensitivityResult.median || 0
    const lowDeltas = tornado.map((t: any) => t.low_roi - baseline)
    const highDeltas = tornado.map((t: any) => t.high_roi - baseline)

    const low = this.roiColor('error')
    const high = this.roiColor('success')

    this.tornadoChart = {
      labels,
      datasets: [
        {
          label: 'Low Impact',
          data: lowDeltas,
          backgroundColor: this.roiGradient(low.rgb),
          borderColor: low.hex,
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: 'High Impact',
          data: highDeltas,
          backgroundColor: this.roiGradient(high.rgb),
          borderColor: high.hex,
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    }

    const tnc = this.getChartColors()
    this.tornadoOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false, axis: 'y' },
      plugins: {
        legend: {
          display: true,
          labels: { color: tnc.textColor, usePointStyle: true, padding: 16 },
        },
        tooltip: this.flowxTooltip(),
      },
      scales: {
        x: {
          ...this.roiAxisStyle(tnc.textSecondary),
          title: { display: true, text: 'Impact on ROI ($)', color: tnc.textColor },
        },
        y: {
          ...this.roiAxisStyle(tnc.textSecondary),
          ticks: { color: tnc.textColor, font: { family: '"Open Sans", system-ui, sans-serif' } },
          grid: { display: false, drawBorder: false },
        },
      },
    }
  }

  getScenarioValue(): number {
    if (!this.sensitivityResult?.scenarios) {return 0}
    return this.sensitivityResult.scenarios[this.selectedScenario]?.roi || 0
  }

  // ── Tab 4: Agent Comparison ───────────────────────────

  async compareAgents(): Promise<any> {
    if (!this.selectedOrg || this.selectedCompareApps.length === 0) {return}
    this.loading = true
    try {
      const body = {
        project_ids: this.selectedCompareApps.map((a: any) => a.id),
        period_start: new Date(this.periodStart).toISOString(),
        period_end: new Date(this.periodEnd).toISOString(),
      }
      const data = await this.roiService.compareAgents(this.selectedOrg.id, body)
      this.agentComparison = Array.isArray(data) ? data : []
      this.buildAgentComparisonChart()
      this.messageService.add({ severity: 'success', summary: 'Agent comparison complete' })
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Comparison failed' })
    }
    this.loading = false
  }

  buildAgentComparisonChart(): void {
    if (this.agentComparison.length === 0) {
      this.agentComparisonChart = null
      return
    }
    const labels = this.agentComparison.map((a: any) => a.project_name || a.project_id)
    const savings = this.agentComparison.map((a: any) => a.total_savings)

    const positive = this.roiColor('success')
    const negative = this.roiColor('error')
    const hexes = savings.map((s: number) => s >= 0 ? positive.hex : negative.hex)
    const rgbs  = savings.map((s: number) => s >= 0 ? positive.rgb : negative.rgb)

    this.agentComparisonChart = {
      labels,
      datasets: [{
        label: 'Total Savings ($)',
        data: savings,
        backgroundColor: this.roiGradient(rgbs),
        borderColor: hexes,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }],
    }

    const ac = this.getChartColors()
    this.agentComparisonChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false, axis: 'x' },
      plugins: {
        legend: { display: false },
        tooltip: this.flowxTooltip(),
      },
      scales: {
        x: {
          ...this.roiAxisStyle(ac.textSecondary),
          grid: { display: false, drawBorder: false },
        },
        y: {
          ...this.roiAxisStyle(ac.textSecondary),
          title: { display: true, text: 'Total Savings ($)', color: ac.textColor },
        },
      },
    }
  }

  // ── Tab 5: Value Outcome Units ──────────────────────────

  async computeVouBreakdown(): Promise<any> {
    if (!this.selectedOrg || !this.selectedApp) {return}
    this.loading = true
    try {
      const body = {
        project_id: this.selectedApp.id,
        period_start: new Date(this.periodStart).toISOString(),
        period_end: new Date(this.periodEnd).toISOString(),
        infrastructure_cost: this.financialForm.infrastructure_cost,
        revenue_attributed: this.financialForm.revenue_attributed,
        compliance_penalty_risk: this.financialForm.compliance_penalty_risk,
        audit_cost_avoided: this.financialForm.audit_cost_avoided,
        error_remediation_cost: this.financialForm.error_remediation_cost,
        regulatory_fine_exposure: this.financialForm.regulatory_fine_exposure,
        regulatory_failure_probability: this.financialForm.regulatory_failure_probability / 100,
        operational_risk_reduction: this.financialForm.operational_risk_reduction,
        employee_turnover_savings: this.financialForm.employee_turnover_savings,
        vendor_lockin_cost: this.financialForm.vendor_lockin_cost,
        governance_overhead_cost: this.financialForm.governance_overhead_cost,
      }
      const result = await this.roiService.computeFinancialByAgents(this.selectedOrg.id, body)
      const agents: any[] = Array.isArray(result?.agents) ? result.agents : []
      this.buildVouGroups(agents)
      this.buildVouChart()
      this.messageService.add({ severity: 'success', summary: 'Value Outcome breakdown computed' })
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Computation failed' })
    }
    this.loading = false
  }

  private buildVouGroups(agents: any[]): void {
    const groups = new Map<string, any[]>()
    for (const agent of agents) {
      const key = agent.value_outcome_unit || 'Ungrouped'
      if (!groups.has(key)) {groups.set(key, [])}
      groups.get(key)?.push(agent)
    }
    this.vouGroups = Array.from(groups.entries()).map(([group, agentList]) => ({
      group,
      agents: agentList,
      totals: {
        runs: agentList.reduce((s, a) => s + (a.runs || 0), 0),
        llm_cost: agentList.reduce((s, a) => s + (a.llm_cost || 0), 0),
        labor_saved: agentList.reduce((s, a) => s + (a.labor_saved || 0), 0),
        net_contribution: agentList.reduce((s, a) => s + (a.net_contribution || 0), 0),
      },
    }))
  }

  // FlowX color triplets for ROI charts. Light/dark variants follow the
  // CLAUDE.md guidance: success/error keep their semantic hex in light, and
  // step up to the lighter green-300 / red-300 in dark; interactive blue
  // lifts from blue-500 to blue-400.
  private roiColor(role: 'success' | 'error' | 'interactive'): { hex: string; rgb: string } {
    const isDark = document.documentElement.classList.contains('flowx-dark')
    if (role === 'success') {
      return isDark
        ? { hex: '#54aa94', rgb: '84, 170, 148' }  // green-300
        : { hex: '#339980', rgb: '51, 153, 128' }  // green-400
    }
    if (role === 'error') {
      return isDark
        ? { hex: '#ee6b54', rgb: '238, 107, 84' }  // red-300
        : { hex: '#e62200', rgb: '230, 34, 0' }    // red-500
    }
    return isDark
      ? { hex: '#3389e0', rgb: '51, 137, 224' }    // blue-400
      : { hex: '#006bd8', rgb: '0, 107, 216' }     // blue-500
  }

  // Vertical gradient (top opaque → bottom transparent), keyed to the
  // chartArea so every bar shares the same gradient anchor — same recipe
  // the API Calls activity chart uses. `rgb` may be a single string (all
  // bars same color) or an array indexed by bar position (per-bar colors).
  private roiGradient(rgb: string | string[]): (context: any) => any {
    return (context: any) => {
      const chart = context.chart
      const { ctx, chartArea } = chart
      const c = Array.isArray(rgb) ? rgb[context.dataIndex] : rgb
      if (!chartArea || !c) { return `rgba(${c || '0, 0, 0'}, 0.45)` }
      const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
      gradient.addColorStop(0, `rgba(${c}, 0.45)`)
      gradient.addColorStop(1, `rgba(${c}, 0)`)
      return gradient
    }
  }

  // Shared scale defaults: hidden borders, sparse y-grid, Open Sans ticks.
  private roiAxisStyle(textSecondary: string): any {
    return {
      ticks: { color: textSecondary, font: { family: '"Open Sans", system-ui, sans-serif' } },
      border: { display: false },
      grid: { color: 'rgba(99, 116, 139, 0.10)', drawBorder: false, drawTicks: false },
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

  private buildVouChart(): void {
    if (this.vouGroups.length === 0) {
      this.vouChart = null
      return
    }
    const labels = this.vouGroups.map(g => g.group)
    const laborSaved = this.vouGroups.map(g => g.totals.labor_saved)
    const llmCost = this.vouGroups.map(g => -g.totals.llm_cost)
    const net = this.vouGroups.map(g => g.totals.net_contribution)

    const labor = this.roiColor('success')
    const cost  = this.roiColor('error')
    const net_  = this.roiColor('interactive')

    this.vouChart = {
      labels,
      datasets: [
        {
          label: 'Labor Saved',
          data: laborSaved,
          backgroundColor: this.roiGradient(labor.rgb),
          borderColor: labor.hex,
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: 'LLM Cost',
          data: llmCost,
          backgroundColor: this.roiGradient(cost.rgb),
          borderColor: cost.hex,
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: 'Net Contribution',
          data: net,
          backgroundColor: this.roiGradient(net_.rgb),
          borderColor: net_.hex,
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    }

    const vc = this.getChartColors()
    this.vouChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false, axis: 'x' },
      plugins: {
        legend: {
          display: true,
          labels: { color: vc.textColor, usePointStyle: true, padding: 16 },
        },
        tooltip: {
          ...this.flowxTooltip(),
          callbacks: {
            label: (ctx: any) => `${ctx.dataset.label}: $${Math.abs(ctx.raw).toLocaleString()}`,
          },
        },
      },
      scales: {
        x: {
          ...this.roiAxisStyle(vc.textSecondary),
          grid: { display: false, drawBorder: false },
        },
        y: {
          ...this.roiAxisStyle(vc.textSecondary),
          title: { display: true, text: 'Amount ($)', color: vc.textColor },
        },
      },
    }
  }

  get vouGrandTotals(): any {
    return {
      runs: this.vouGroups.reduce((s, g) => s + g.totals.runs, 0),
      llm_cost: this.vouGroups.reduce((s, g) => s + g.totals.llm_cost, 0),
      labor_saved: this.vouGroups.reduce((s, g) => s + g.totals.labor_saved, 0),
      net_contribution: this.vouGroups.reduce((s, g) => s + g.totals.net_contribution, 0),
    }
  }

  // ── Tab change handler ────────────────────────────────

  onTabChange(event: any): void {
    this.activeTab = event
    if (this.activeTab === '1' && this.savedFinancials.length === 0) {
      this.loadSavedFinancials()
    } else if (this.activeTab === '2' && this.savedCompliance.length === 0) {
      this.loadSavedCompliance()
    } else if (this.activeTab === '3' && this.benchmarks.length === 0) {
      this.loadBenchmarks()
    }
  }

  // ── Chart Theme Colors ──────────────────────────────────

  private getChartColors(): any {
    const s = getComputedStyle(document.documentElement)
    return {
      textColor: s.getPropertyValue('--text-color').trim(),
      textSecondary: s.getPropertyValue('--text-color-secondary').trim(),
      surfaceBorder: s.getPropertyValue('--surface-border').trim(),
    }
  }

  // ── Helpers ───────────────────────────────────────────

  formatCurrency(val: number): string {
    return '$' + (val || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  }

  formatPercent(val: number): string {
    return (val || 0).toFixed(1) + '%'
  }

  set editCardDialog(type: string) {
    if (type === 'baseline') {this.baselineDialogVisible = true}
    else if (type === 'compliance') {this.complianceDialogVisible = true}
    else if (type === 'costs') {this.costsDialogVisible = true}
  }

  // Agent breakdown grouped by Value Outcome Unit
  get agentBreakdownGrouped(): { group: string; agents: any[]; totals: any }[] {
    const groups = new Map<string, any[]>()
    for (const agent of this.agentBreakdown) {
      const key = agent.value_outcome_unit || 'Ungrouped'
      if (!groups.has(key)) {groups.set(key, [])}
      groups.get(key)?.push(agent)
    }
    return Array.from(groups.entries()).map(([group, agents]) => ({
      group,
      agents,
      totals: {
        runs: agents.reduce((s, a) => s + (a.runs || 0), 0),
        llm_cost: agents.reduce((s, a) => s + (a.llm_cost || 0), 0),
        labor_saved: agents.reduce((s, a) => s + (a.labor_saved || 0), 0),
        net_contribution: agents.reduce((s, a) => s + (a.net_contribution || 0), 0),
      },
    }))
  }

  // Agent breakdown totals
  get agentTotalRuns(): number {
    return this.agentBreakdown.reduce((s: number, a: any) => s + (a.runs || 0), 0)
  }
  get agentTotalLlmCost(): number {
    return this.agentBreakdown.reduce((s: number, a: any) => s + (a.llm_cost || 0), 0)
  }
  get agentTotalLaborSaved(): number {
    return this.agentBreakdown.reduce((s: number, a: any) => s + (a.labor_saved || 0), 0)
  }
  get agentTotalNetContribution(): number {
    return this.agentBreakdown.reduce((s: number, a: any) => s + (a.net_contribution || 0), 0)
  }
}
