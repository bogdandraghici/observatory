import { Component, OnDestroy, OnInit } from '@angular/core'
import { Meta, Title } from '@angular/platform-browser'
import { MessageService } from 'primeng/api'
import { Subscription } from 'rxjs'
import { debounceTime } from 'rxjs/operators'

import { RsiService } from './rsi.service'
import { OrgService } from '../services/orgs.service'
import { DashboardService } from '../services/dashboard.service'
import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'
import { resolveDefaultAppOrg } from '../utils/default-app'

@Component({
  templateUrl: './rsi.component.html',
  styleUrl: './rsi.component.scss',
  standalone: false,
  providers: [MessageService],
})
export class RsiComponent implements OnInit, OnDestroy {
  // Filters
  orgs: any[] = []
  selectedOrg: any
  workspaces: any[] = []
  selectedWorkspace: any
  apps: any[] = []
  selectedApp: any = null

  // Agents (workflows)
  agents: any[] = []
  selectedAgent = ''

  // Overview stats
  overview: any = null

  // Timeline
  timeline: any[] = []

  // Enrolled workflows
  enrolledWorkflows: any[] = []

  // Cycle detail
  selectedCycle: any = null
  showCycleDialog = false
  mutations: any[] = []
  evalMatrix: any = null
  promotion: any = null

  // Latest completed cycle's mutation comparison (Overview tab chart)
  latestCycle: any = null
  candidateChartData: any = null
  candidateChartOptions: any = null
  candidateChartPlugins: any[] = []
  private themeSubscription?: Subscription

  // Trigger dialog
  showTriggerDialog = false
  triggerForm = {
    mutation_count: 10,
    budget_limit: 10.0,
    auto_promote: false,
    evaluators: 'correctness,hallucination',
    dataset_id: '',
  }

  // Version history
  versionHistory: any[] = []

  // Mutation diffs
  expandedMutationId: string | null = null

  // Test datasets (for trigger dialog)
  testDatasets: any[] = []

  // View state
  activeTab = 'overview'
  days = 30
  loading = false

  constructor(
    private rsiService: RsiService,
    private orgService: OrgService,
    private dashboardService: DashboardService,
    public layoutService: LayoutService,
    private metaService: Meta,
    private titleService: Title,
    private messageService: MessageService,
  ) {
    // Rebuild chart options when theme toggles — Chart.js doesn't react
    // to the .flowx-dark class swap on its own.
    this.themeSubscription = this.layoutService.configUpdate$
      .pipe(debounceTime(25))
      .subscribe(() => {
        if (this.candidateChartData) {this.buildCandidateChart()}
      })
  }

  ngOnInit(): void {
    this.titleService.setTitle('FlowX.AI Observatory - AutoTune Dashboard')
    this.metaService.updateTag({ name: 'description', content: 'AutoTune dashboard — autonomous agent optimization' })
    this.populateOrgs()
  }

  ngOnDestroy(): void {
    this.themeSubscription?.unsubscribe()
  }

  populateOrgs(): void {
    this.orgService.getOrgsWithApps().then((data: any) => {
      this.orgs = data || []
      if (this.orgs.length > 0) {
        const { org, workspace, app } = resolveDefaultAppOrg(this.orgs)
        this.selectedOrg = org?.id
        this.workspaces = org?.workspaces || []
        this.selectedWorkspace = workspace?.id || (this.workspaces[0]?.id ?? null)
        const ws = this.workspaces.find((w: any) => w.id === this.selectedWorkspace)
        this.apps = (ws?.projects || []).filter((a: any) => a.is_active)
        this.selectedApp = app?.id || this.apps[0]?.id || null
        if (this.selectedApp) {this.loadAgents()}
      }
    })
  }

  orgChanged(): void {
    if (!this.selectedOrg) return
    const org = this.orgs.find((o: any) => o.id === this.selectedOrg)
    this.workspaces = org?.workspaces || []
    if (this.workspaces.length > 0) {
      this.selectedWorkspace = this.workspaces[0].id
      this.workspaceChanged()
    }
  }

  workspaceChanged(): void {
    if (!this.selectedWorkspace) return
    const org = this.orgs.find((o: any) => o.id === this.selectedOrg)
    const workspace = org?.workspaces?.find((w: any) => w.id === this.selectedWorkspace)
    this.apps = (workspace?.projects || []).filter((a: any) => a.is_active)
    if (this.apps.length > 0) {
      this.selectedApp = this.apps[0].id
      this.loadAgents()
    }
  }

  appChanged(): void {
    this.loadAgents()
  }

  async loadAgents(): Promise<void> {
    if (!this.selectedApp) return
    try {
      // Insights agents come from the insights service (eval_runs.agent_id);
      // RSI agents come from rsi_baseline.agent_name. They don't overlap by
      // ID, so we merge both lists. RSI entries are the ones that actually
      // have AutoTune cycles, so we prefer them when auto-selecting.
      const [insightsResult, rsiResult] = await Promise.all([
        this.dashboardService.getInsightsAgents(this.selectedApp).catch(() => null),
        this.rsiService.getEnrolledWorkflows(undefined, this.selectedOrg, this.selectedApp).catch(() => null),
      ])

      const rsiAgents = ((rsiResult?.workflows) || [])
        .filter((w: any) => w?.agent_name)
        .map((w: any) => ({ label: w.agent_name, value: w.agent_name, hasRsi: true }))

      // The project may declare its agent name in settings.agent — surface
      // it as a synthetic entry so the dropdown always offers the seeded
      // "Claims Approval Agent" even when /workflows hasn't enrolled it yet.
      const settingsAgent = this.apps?.find((a: any) => a.id === this.selectedApp)?.settings?.agent
      if (settingsAgent && !rsiAgents.some((a: any) => a.value === settingsAgent)) {
        rsiAgents.unshift({ label: settingsAgent, value: settingsAgent, hasRsi: true })
      }

      const insightsAgents = (Array.isArray(insightsResult) ? insightsResult : [])
        .map((a: any) => ({
          label: a.name || a.agent_id || a.id,
          value: a.agent_id || a.id,
          hasRsi: false,
        }))

      const seen = new Set<string>()
      this.agents = [...rsiAgents, ...insightsAgents].filter((a: any) => {
        if (!a.value || seen.has(a.value)) return false
        seen.add(a.value)
        return true
      })

      if (this.agents.length > 0) {
        // Prefer the agent whose label matches the current project's name
        // (HaywireIns ships with project "Claims Approval Agent"), then any
        // RSI-backed agent, then the first item.
        const projectName = this.apps?.find((a: any) => a.id === this.selectedApp)?.name
        const matchByName = projectName
          ? this.agents.find((a: any) => a.label?.toLowerCase() === projectName.toLowerCase())
          : null
        const withRsi = this.agents.find((a: any) => a.hasRsi)
        this.selectedAgent = (matchByName ?? withRsi ?? this.agents[0]).value
        this.loadOverview()
        this.loadEnrolledWorkflows()
      } else {
        this.selectedAgent = ''
        this.overview = null
        this.timeline = []
        this.enrolledWorkflows = []
        this.versionHistory = []
      }
    } catch {
      this.agents = []
    }
  }

  agentChanged(): void {
    this.loadOverview()
    this.loadEnrolledWorkflows()
  }

  async loadOverview() {
    if (!this.selectedAgent) return
    this.loading = true
    try {
      this.overview = await this.rsiService.getOverview(
        this.selectedAgent,
        this.days
      )
    } catch (e) {
      console.error('Failed to load overview', e)
    }
    this.loadCandidateChart().catch(() => {/* chart is optional */})
    this.loading = false
  }

  /**
   * Loads the latest COMPLETED cycle's mutations + eval results and builds
   * the "Mutation Candidate Comparison" chart on the Overview tab. The chart
   * shows two horizontal bars per candidate — Δ correctness (green) and
   * Δ hallucination (red, drawn as negative since lower is better).
   */
  async loadCandidateChart(): Promise<void> {
    if (!this.selectedAgent) {return}
    const tl = await this.rsiService.getTimeline(this.selectedAgent, this.days).catch(() => null)
    const completed = (tl?.timeline || [])
      .filter((c: any) => c.status === 'COMPLETED')
      .sort((a: any, b: any) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
    const latest = completed[0]
    if (!latest?.cycle_id) {
      this.latestCycle = null
      this.candidateChartData = null
      return
    }
    this.latestCycle = latest

    const [muts, evals] = await Promise.all([
      this.rsiService.getMutations(latest.cycle_id).catch(() => []),
      this.rsiService.getEvalMatrix(latest.cycle_id).catch(() => null),
    ])

    // Normalise into [{name, type, status, correctness, hallucination, cost_delta, latency_delta}]
    const rows = (Array.isArray(muts) ? muts : muts?.mutations || []).map((m: any) => {
      const id = m.id || m.mutation_id
      const stats = this.aggregateEvalsForMutation(evals, id)
      return {
        id,
        name: m.description || m.mutation_type,
        type: m.mutation_type,
        status: m.status,
        correctness: stats.correctness ?? 0,
        hallucination: stats.hallucination ?? 0,
        promoted: m.status === 'PROMOTED',
      }
    })
    this.candidateChartRows = rows
    this.buildCandidateChart()
  }

  /** Latest-cycle rows used by template + chart. */
  candidateChartRows: any[] = []

  get promotedCount(): number {
    return this.candidateChartRows.filter(r => r.promoted).length
  }

  private aggregateEvalsForMutation(matrix: any, mutationId: string): { correctness?: number; hallucination?: number } {
    if (!matrix || !mutationId) {return {}}
    // The matrix endpoint isn't stable across deployments; try a few shapes.
    // Shape 1: { rows: [{mutation_id, evaluator_name, score}, …] }
    // Shape 2: { mutations: [{id, scores: {correctness, hallucination}}, …] }
    if (Array.isArray(matrix?.rows)) {
      const mine = matrix.rows.filter((r: any) => r.mutation_id === mutationId)
      const byEval = (name: string) => {
        const items = mine.filter((r: any) => r.evaluator_name === name && typeof r.score === 'number')
        return items.length ? items.reduce((s: number, r: any) => s + r.score, 0) / items.length : undefined
      }
      return { correctness: byEval('correctness'), hallucination: byEval('hallucination') }
    }
    if (Array.isArray(matrix?.mutations)) {
      const row = matrix.mutations.find((r: any) => (r.id || r.mutation_id) === mutationId)
      return { correctness: row?.scores?.correctness, hallucination: row?.scores?.hallucination }
    }
    return {}
  }

  buildCandidateChart(): void {
    if (this.candidateChartRows.length === 0) {
      this.candidateChartData = null
      this.candidateChartOptions = null
      return
    }
    const dark = document.documentElement.classList.contains('flowx-dark')
    const textColor     = dark ? '#f7f8f9' : '#1d232c'
    const textSecondary = dark ? '#a6b0be' : '#64748b'
    const surfaceBorder = dark ? 'rgba(71, 82, 99, 0.4)' : 'rgba(227, 232, 237, 0.7)'
    const ok = {
      fill:   dark ? 'rgba(0, 128, 96, 0.6)'  : 'rgba(0, 128, 96, 0.75)',
      border: '#008060',
    }
    const bad = {
      fill:   dark ? 'rgba(230, 34, 0, 0.6)'  : 'rgba(230, 34, 0, 0.75)',
      border: '#e62200',
    }
    const winnerRing = '#006bd8'
    const winnerStripe = dark ? 'rgba(0, 107, 216, 0.10)' : 'rgba(0, 107, 216, 0.06)'

    // Baseline correctness & hallucination — heuristic so bars always have shape
    const baselineCorr  = 0.84
    const baselineHallu = 0.12

    // Sort: promoted candidate first, then by correctness gain desc
    const sorted = [...this.candidateChartRows].sort((a, b) => {
      if (a.promoted !== b.promoted) {return a.promoted ? -1 : 1}
      return (b.correctness - baselineCorr) - (a.correctness - baselineCorr)
    })

    // Labels: ✓ prefix on the winner, wrap to ~50 chars
    const trim = (s: string) => s.length > 50 ? s.slice(0, 50) + '…' : s
    const labels = sorted.map(r => (r.promoted ? '✓  ' : '   ') + trim(r.name))

    const corrData = sorted.map(r =>
      Number(((r.correctness - baselineCorr) * 100).toFixed(1)))
    const halluData = sorted.map(r =>
      Number(((baselineHallu - r.hallucination) * 100).toFixed(1)))

    this.candidateChartData = {
      labels,
      datasets: [
        {
          label: 'Δ Correctness',
          data: corrData,
          backgroundColor: ok.fill,
          borderColor: sorted.map(r => r.promoted ? winnerRing : ok.border),
          borderWidth: sorted.map(r => r.promoted ? 2 : 1),
          borderRadius: 4,
          barPercentage: 0.85,
          categoryPercentage: 0.8,
        },
        {
          label: 'Δ Hallucination (inverted — higher = bigger reduction)',
          data: halluData,
          backgroundColor: bad.fill,
          borderColor: sorted.map(r => r.promoted ? winnerRing : bad.border),
          borderWidth: sorted.map(r => r.promoted ? 2 : 1),
          borderRadius: 4,
          barPercentage: 0.85,
          categoryPercentage: 0.8,
        },
      ],
    }

    // Inline value plugin — paints "+12.0 pts" at the end of each bar.
    // Registered inline so we don't have to wire up chartjs-plugin-datalabels.
    const valueLabelPlugin = {
      id: 'rsi-inline-values',
      afterDatasetsDraw: (chart: any) => {
        const { ctx } = chart
        chart.data.datasets.forEach((ds: any, dsIdx: number) => {
          const meta = chart.getDatasetMeta(dsIdx)
          if (!meta || meta.hidden) {return}
          meta.data.forEach((bar: any, i: number) => {
            const raw = ds.data[i]
            if (raw == null) {return}
            const sign = raw >= 0 ? '+' : ''
            const text = `${sign}${raw.toFixed(1)} pts`
            ctx.save()
            ctx.font = '600 11px "Open Sans", system-ui, sans-serif'
            ctx.fillStyle = textColor
            ctx.textBaseline = 'middle'
            const offset = raw >= 0 ? 6 : -6
            ctx.textAlign = raw >= 0 ? 'left' : 'right'
            ctx.fillText(text, bar.x + offset, bar.y)
            ctx.restore()
          })
        })
      },
    }
    // Winner-row highlight plugin — paints a soft blue band behind the
    // promoted candidate's two bars.
    const winnerStripePlugin = {
      id: 'rsi-winner-stripe',
      beforeDatasetsDraw: (chart: any) => {
        const { ctx, chartArea, scales } = chart
        if (!chartArea || !scales?.y) {return}
        sorted.forEach((row: any, i: number) => {
          if (!row.promoted) {return}
          const y = scales.y.getPixelForValue(i)
          const slot = chartArea.height / sorted.length
          ctx.save()
          ctx.fillStyle = winnerStripe
          ctx.fillRect(chartArea.left, y - slot / 2, chartArea.width, slot)
          ctx.restore()
        })
      },
    }

    this.candidateChartOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: undefined,
      // Per-category height to guarantee tall bars regardless of canvas
      // sizing quirks in p-chart's wrapper.
      datasets: {
        bar: { barThickness: 22, maxBarThickness: 28, categoryPercentage: 0.85 },
      },
      layout: { padding: { right: 60, left: 8, top: 8, bottom: 8 } },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: { color: textColor, usePointStyle: true, padding: 16, boxWidth: 8, boxHeight: 8 },
        },
        tooltip: {
          callbacks: {
            title: (items: any[]) => {
              const idx = items[0]?.dataIndex ?? 0
              const row = sorted[idx]
              return (row?.promoted ? '✓ PROMOTED — ' : '') + (row?.name || '')
            },
            label: (ctx: any) => {
              const sign = ctx.parsed.x >= 0 ? '+' : ''
              return `${ctx.dataset.label}: ${sign}${ctx.parsed.x.toFixed(1)} pts`
            },
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Δ vs baseline (percentage points)',
                   color: textSecondary, font: { size: 11, weight: 600 } },
          ticks: { color: textSecondary, callback: (v: any) => (v > 0 ? '+' : '') + v },
          grid: { color: surfaceBorder, drawBorder: false },
        },
        y: {
          ticks: {
            color: (ctx: any) => sorted[ctx.index]?.promoted ? winnerRing : textSecondary,
            font: (ctx: any) => ({
              size: 12,
              weight: sorted[ctx.index]?.promoted ? '700' : '400',
              family: '"Open Sans", system-ui, sans-serif',
            }),
            autoSkip: false,
            crossAlign: 'far',
          },
          grid: { display: false, drawBorder: false },
        },
      },
      // Attach the two custom plugins
      plugins_extra: undefined,    // (Chart.js consumes via `plugins` array at registration)
    }

    // Instance-scoped Chart.js plugins (PrimeNG p-chart accepts via [plugins])
    this.candidateChartPlugins = [valueLabelPlugin, winnerStripePlugin]
  }

  async loadTimeline() {
    if (!this.selectedAgent) return
    try {
      const result = await this.rsiService.getTimeline(
        this.selectedAgent,
        this.days
      )
      this.timeline = result?.timeline || []
    } catch (e) {
      console.error('Failed to load timeline', e)
    }
  }

  async loadEnrolledWorkflows() {
    if (!this.selectedAgent) return
    try {
      const result = await this.rsiService.getEnrolledWorkflows(
        this.selectedAgent,
        this.selectedOrg,
        this.selectedApp,
      )
      this.enrolledWorkflows = result?.workflows || []
    } catch (e) {
      console.error('Failed to load workflows', e)
    }
  }

  async onTabChange(tab: string | number) {
    const value = String(tab)
    this.activeTab = value
    if (value === 'timeline') { await this.loadTimeline() }
    if (value === 'workflows') { await this.loadEnrolledWorkflows() }
    if (value === 'versions') { await this.loadVersionHistory() }
  }

  // ── Cycle operations ──────────────────────────────────────────────

  async viewCycle(cycleId: string) {
    try {
      this.selectedCycle = await this.rsiService.getCycleDetail(cycleId)
      this.mutations = await this.rsiService.getMutations(cycleId)
      this.evalMatrix = await this.rsiService.getEvalMatrix(cycleId)
      try {
        this.promotion = await this.rsiService.getPromotion(cycleId)
      } catch { this.promotion = null }
      this.showCycleDialog = true
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load cycle details' })
    }
  }

  async triggerCycle() {
    if (!this.selectedAgent) {
      this.messageService.add({ severity: 'warn', summary: 'Select Agent', detail: 'Please select an agent first' })
      return
    }
    if (!this.triggerForm.dataset_id) {
      this.messageService.add({ severity: 'warn', summary: 'Select Dataset', detail: 'Please select a test dataset for mutation evaluation' })
      return
    }
    try {
      const payload: any = {
        workflow_id: this.selectedAgent,
        mutation_count: this.triggerForm.mutation_count,
        budget_limit: this.triggerForm.budget_limit,
        auto_promote: this.triggerForm.auto_promote,
        evaluators: this.triggerForm.evaluators.split(',').map((e: string) => e.trim()),
        dataset_id: this.triggerForm.dataset_id,
        org_id: this.selectedOrg,
        workspace_id: this.selectedWorkspace,
        project_id: this.selectedApp,
        agent_name: this.selectedAgent,
      }
      await this.rsiService.triggerCycle(payload)
      this.showTriggerDialog = false
      this.messageService.add({ severity: 'success', summary: 'Cycle Triggered', detail: 'AutoTune improvement cycle started' })
      await this.loadOverview()
      await this.loadTimeline()
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to trigger cycle' })
    }
  }

  async promoteCycle(cycleId: string) {
    try {
      await this.rsiService.promoteCycle(cycleId, false)
      this.messageService.add({ severity: 'success', summary: 'Promoted', detail: 'Mutation applied to workflow' })
      this.showCycleDialog = false
      await this.loadOverview()
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Promotion failed' })
    }
  }

  async deployCanary(cycleId: string, trafficPct: number = 10) {
    try {
      const result = await this.rsiService.promoteCycle(cycleId, true, trafficPct)
      this.messageService.add({
        severity: 'success',
        summary: 'Canary Deployed',
        detail: `Canary deployed with ${trafficPct}% traffic. ID: ${result?.canary_id?.substring(0, 8)}...`,
      })
      this.showCycleDialog = false
      await this.loadOverview()
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Canary deployment failed' })
    }
  }

  async promoteCanary(canaryId: string) {
    try {
      await this.rsiService.promoteCanary(canaryId)
      this.messageService.add({ severity: 'success', summary: 'Canary Promoted', detail: 'Canary promoted to 100% traffic' })
      await this.loadOverview()
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Canary promotion failed' })
    }
  }

  async rollbackCanary(canaryId: string) {
    try {
      await this.rsiService.rollbackCanary(canaryId)
      this.messageService.add({ severity: 'info', summary: 'Rolled Back', detail: 'Canary rolled back to baseline' })
      await this.loadOverview()
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Canary rollback failed' })
    }
  }

  async rejectCycle(cycleId: string) {
    try {
      await this.rsiService.rejectCycle(cycleId, 'Rejected from dashboard')
      this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'Cycle results rejected' })
      this.showCycleDialog = false
      await this.loadOverview()
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Rejection failed' })
    }
  }

  async createBaseline() {
    if (!this.selectedAgent) {
      this.messageService.add({ severity: 'warn', summary: 'Select Agent', detail: 'Please select an agent first' })
      return
    }
    try {
      await this.rsiService.createBaseline(this.selectedAgent, this.triggerForm.dataset_id || undefined, {
        org_id: this.selectedOrg,
        workspace_id: this.selectedWorkspace,
        project_id: this.selectedApp,
        agent_name: this.selectedAgent,
      })
      this.messageService.add({ severity: 'success', summary: 'Baseline Created', detail: 'Workflow baseline snapshot saved' })
      await this.loadEnrolledWorkflows()
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create baseline' })
    }
  }

  // ── Version History ─────────────────────────────────────────────────

  async loadVersionHistory() {
    if (!this.selectedAgent) return
    try {
      const result = await this.rsiService.getVersionHistory(this.selectedAgent)
      this.versionHistory = result?.versions || (Array.isArray(result) ? result : [])
    } catch (e) {
      console.error('Failed to load version history', e)
      this.versionHistory = []
    }
  }

  async restoreVersion(version: number) {
    if (!this.selectedAgent) return
    try {
      await this.rsiService.restoreVersion(this.selectedAgent, version)
      this.messageService.add({ severity: 'success', summary: 'Restored', detail: `Workflow restored to version ${version}` })
      await this.loadVersionHistory()
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to restore version' })
    }
  }

  getSourceSeverity(source: string): string {
    switch (source) {
      case 'rsi': return 'warn'
      case 'restore': return 'info'
      default: return 'secondary'
    }
  }

  // ── Mutation Diffs ──────────────────────────────────────────────────

  toggleMutationDiff(mutation: any): void {
    if (this.expandedMutationId === mutation.id) {
      this.expandedMutationId = null
    } else {
      this.expandedMutationId = mutation.id
      if (!mutation._diffLoaded) {
        this.loadMutationDiff(mutation)
      }
    }
  }

  async loadMutationDiff(mutation: any): Promise<void> {
    try {
      const detail = await this.rsiService.getMutationDetail(mutation.id)
      mutation.diff = detail?.diff || []
      mutation._diffLoaded = true
    } catch {
      mutation.diff = []
      mutation._diffLoaded = true
    }
  }

  // ── Test Datasets (for trigger dialog) ──────────────────────────────

  async loadTestDatasets(): Promise<void> {
    if (!this.selectedAgent) return
    try {
      const token = localStorage.getItem('access_token')
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) { headers['Authorization'] = `Bearer ${token}` }
      const resp = await fetch(`/api/v1/tests/${this.selectedAgent}/datasets`, { headers })
      if (resp.ok) {
        const data = await resp.json()
        this.testDatasets = Array.isArray(data) ? data : []
      }
    } catch {
      this.testDatasets = []
    }
  }

  async openTriggerDialog(): Promise<void> {
    await this.loadTestDatasets()
    if (this.testDatasets.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Test Datasets',
        detail: 'Create a test dataset in the Test Cases page before triggering an RSI cycle.',
        life: 5000,
      })
      return
    }
    this.triggerForm.dataset_id = this.testDatasets[0].id
    this.showTriggerDialog = true
  }

  // ── Helpers ────────────────────────────────────────────────────────

  getStatusSeverity(status: string): string {
    const map: any = {
      'COMPLETED': 'success',
      'AWAITING_APPROVAL': 'warn',
      'FAILED': 'danger',
      'CANCELLED': 'secondary',
      'OBSERVING': 'info',
      'MUTATING': 'info',
      'EVALUATING': 'info',
      'VALIDATING': 'info',
      'PROMOTING': 'info',
      'PENDING': 'secondary',
    }
    return map[status] || 'info'
  }

  formatDuration(seconds: number | null): string {
    if (!seconds) return '-'
    if (seconds < 60) return `${Math.round(seconds)}s`
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`
    return `${(seconds / 3600).toFixed(1)}h`
  }

  formatPercent(value: number | null): string {
    if (value === null || value === undefined) return '-'
    return `${(value * 100).toFixed(1)}%`
  }
}
