import { Component, OnInit } from '@angular/core'
import { Meta, Title } from '@angular/platform-browser'
import { MessageService } from 'primeng/api'

import { RsiService } from './rsi.service'
import { OrgService } from '../services/orgs.service'
import { DashboardService } from '../services/dashboard.service'
import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'

@Component({
  templateUrl: './rsi.component.html',
  styleUrl: './rsi.component.scss',
  standalone: false,
  providers: [MessageService],
})
export class RsiComponent implements OnInit {
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
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('FlowX.AI Observatory - AutoTune Dashboard')
    this.metaService.updateTag({ name: 'description', content: 'AutoTune dashboard — autonomous agent optimization' })
    this.populateOrgs()
  }

  populateOrgs(): void {
    this.orgService.getOrgsWithApps().then((data: any) => {
      this.orgs = data || []
      if (this.orgs.length > 0) {
        // Prefer non-Default orgs (auto-provisioned from platform)
        const sortedOrgs = [...this.orgs].sort((a, b) => {
          if (a.name === 'Default') return 1
          if (b.name === 'Default') return -1
          return 0
        })
        this.selectedOrg = sortedOrgs[0].id
        this.orgChanged()
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
      const result = await this.dashboardService.getInsightsAgents(this.selectedApp)
      if (result?.error) {
        this.agents = []
        return
      }
      const seen = new Set()
      this.agents = (result || [])
        .map((a: any) => {
          const id = a.agent_id || a.id
          return { label: a.name || id, value: id }
        })
        .filter((a: any) => {
          if (seen.has(a.value)) return false
          seen.add(a.value)
          return true
        })
      if (this.agents.length > 0) {
        this.selectedAgent = this.agents[0].value
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
    this.loading = false
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

  async onTabChange(tab: string) {
    this.activeTab = tab
    if (tab === 'timeline') { await this.loadTimeline() }
    if (tab === 'workflows') { await this.loadEnrolledWorkflows() }
    if (tab === 'versions') { await this.loadVersionHistory() }
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
