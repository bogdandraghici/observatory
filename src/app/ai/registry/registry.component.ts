import { Component, OnInit } from '@angular/core'
import { DashboardService } from '../services/dashboard.service'
import { OrgService } from '../services/orgs.service'
import { AppService } from '../services/apps.service'
import { RoiService } from '../services/roi.service'
import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'
import { Meta, Title } from '@angular/platform-browser'
import { MessageService } from 'primeng/api'
import { resolveDefaultAppOrg } from '../utils/default-app'

@Component({
    templateUrl: './registry.component.html',
    standalone: false,
    providers: [MessageService],
})
export class RegistryComponent implements OnInit {
  orgs: any[]
  selectedOrg: any
  workspaces: any[] = []
  selectedWorkspace: any = null
  activeTab = '0'

  // Apps
  apps: any[] = []
  selectedApp: any = null
  appDialogVisible = false

  lifecycleOptions = [
    { label: 'All', value: '' },
    { label: 'Research', value: 'research' },
    { label: 'Development', value: 'development' },
    { label: 'Staging', value: 'staging' },
    { label: 'Production', value: 'production' },
    { label: 'Deprecated', value: 'deprecated' },
    { label: 'Retired', value: 'retired' },
  ]
  filterLifecycle = ''
  filterRisk = ''
  riskOptions = [
    { label: 'All', value: '' },
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' },
  ]

  // Edit options (without "All")
  lifecycleEditOptions = [
    { label: 'Development', value: 'development' },
    { label: 'Staging', value: 'staging' },
    { label: 'Production', value: 'production' },
    { label: 'Deprecated', value: 'deprecated' },
    { label: 'Retired', value: 'retired' },
  ]
  riskEditOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' },
  ]

  // Vendors
  vendors: any[] = []
  vendorSummary: any[] = []
  vendorDialogVisible = false
  editingVendor: any = {}
  isNewVendor = true

  providerOptions = [
    { label: 'OpenAI', value: 'openai' },
    { label: 'Anthropic', value: 'anthropic' },
    { label: 'Google', value: 'google' },
    { label: 'Mistral', value: 'mistral' },
    { label: 'xAI', value: 'xai' },
    { label: 'Azure', value: 'azure' },
  ]

  dataResidencyOptions = [
    { label: 'US', value: 'US' },
    { label: 'EU', value: 'EU' },
    { label: 'UK', value: 'UK' },
    { label: 'APAC', value: 'APAC' },
    { label: 'Global', value: 'Global' },
    { label: 'On-Premise', value: 'On-Premise' },
  ]

  // Agent Baselines
  agentsFilterApp = ''
  projectAgents: string[] = []
  agentBaselines: any[] = []
  baselineForm: any = {}
  editingBaseline: any = null
  baselineDialogVisible = false
  vouSuggestions: string[] = []

  executionFrequencyOptions = [
    { label: 'Per Execution', value: 'per_execution' },
    { label: 'Daily', value: 'daily' },
    { label: 'Monthly', value: 'monthly' },
  ]

  // Models
  models: any[] = []
  filterProvider = ''
  modelSearchQuery = ''
  syncingProviders = false

  constructor(
    private dashboardService: DashboardService,
    private orgService: OrgService,
    private appService: AppService,
    private roiService: RoiService,
    public layoutService: LayoutService,
    private metaService: Meta,
    private titleService: Title,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('FlowX.AI Observatory - AI Registry')
    this.metaService.updateTag({ name: 'description', content: 'AI Registry for managing projects, vendors, and model catalog.' })
    this.populateOrgs()
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

  populateOrgs(): void {
    this.orgService.getOrgsWithApps().then((data) => {
      this.orgs = data
      if (this.orgs?.length > 0) {
        const { org, workspace, app } = this.getDefaultAppOrg()
        this.selectedOrg = org?.id
        this.workspaces = this.getWorkspaces(this.selectedOrg)
        this.selectedWorkspace = workspace?.id || null
        this.loadAll()
      }
    })
  }

  orgChanged(_____event: any): void {
    this.workspaces = this.getWorkspaces(this.selectedOrg)
    this.selectedWorkspace = this.workspaces?.length > 0 ? this.workspaces[0].id : null
    this.agentsFilterApp = ''
    this.loadAll()
  }

  workspaceChanged(event: any): void {
    const org = this.orgs?.find((item) => item.id === this.selectedOrg)
    this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
    this.agentsFilterApp = ''
    this.loadAll()
  }

  loadAll(): void {
    this.loadApps()
    this.loadVendors()
    this.loadVendorSummary()
    this.loadModels()
    // Preselect first project for Agents tab
    const org = this.orgs?.find((item) => item.id === this.selectedOrg)
    const projects = this.getAppsFromWorkspace(org, this.selectedWorkspace)
    if (projects?.length > 0 && !this.agentsFilterApp) {
      this.agentsFilterApp = projects[0].id
      this.loadProjectAgents(this.agentsFilterApp)
    }
  }

  // ── Projects ────────────────────────────────────────

  async loadApps(): Promise<any> {
    if (!this.selectedOrg) {return}
    const org = this.orgs?.find((item) => item.id === this.selectedOrg)
    let projects = this.getAppsFromWorkspace(org, this.selectedWorkspace)
    if (this.filterLifecycle) {
      projects = projects.filter(a => a.lifecycle_status === this.filterLifecycle)
    }
    if (this.filterRisk) {
      projects = projects.filter(a => a.risk_level === this.filterRisk)
    }
    this.apps = projects
  }

  applyAppFilters(): void {
    this.loadApps()
  }

  showAppDetail(app: any): void {
    this.selectedApp = { ...app }
    this.appDialogVisible = true
  }

  onTagsChange(value: string): void {
    this.selectedApp.tags = value
      ? value.split(',').map(t => t.trim()).filter(t => t)
      : []
  }

  async saveApp(): Promise<any> {
    if (!this.selectedApp) {return}
    await this.appService.updateApp(this.selectedApp)
    this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Project updated successfully' })
    this.appDialogVisible = false
    this.loadApps()
  }

  getRiskSeverity(level: string): string {
    switch (level) {
      case 'critical': return 'danger'
      case 'high': return 'warn'
      case 'medium': return 'info'
      case 'low': return 'success'
      default: return 'secondary'
    }
  }

  getLifecycleSeverity(status: string): string {
    switch (status) {
      case 'production': return 'success'
      case 'staging': return 'info'
      case 'research': return 'contrast'
      case 'development': return 'warn'
      case 'deprecated': return 'danger'
      case 'retired': return 'secondary'
      default: return 'secondary'
    }
  }

  // ── Agent Baselines ───────────────────────────────

  async loadProjectAgents(projectId: string): Promise<any> {
    if (!this.selectedOrg || !projectId) {return}
    try {
      const data = await this.dashboardService.getDistinctAgents(projectId, 8760)
      this.projectAgents = Array.isArray(data) ? data : []
    } catch {
      this.projectAgents = []
    }
    this.loadAgentBaselines(projectId)
  }

  async loadAgentBaselines(projectId: string): Promise<any> {
    if (!this.selectedOrg || !projectId) {return}
    try {
      const data = await this.roiService.listBaselines(this.selectedOrg, projectId)
      this.agentBaselines = Array.isArray(data) ? data : []
    } catch {
      this.agentBaselines = []
    }
  }

  getBaselineForAgent(agentName: string): any {
    return this.agentBaselines.find(b => b.agent_name === agentName)
  }

  openBaselineConfig(agentName: string): void {
    const existing = this.getBaselineForAgent(agentName)
    if (existing) {
      this.editingBaseline = existing
      this.baselineForm = { ...existing }
    } else {
      this.editingBaseline = null
      this.baselineForm = {
        agent_name: agentName,
        value_outcome_unit: '',
        task_description: '',
        manual_effort_hours_per_execution: 0,
        manual_effort_hourly_rate: 50,
        execution_frequency: 'per_execution',
        avg_executions_per_period: 0,
      }
    }
    this.baselineDialogVisible = true
  }

  async saveBaseline(): Promise<any> {
    if (!this.selectedOrg || !this.agentsFilterApp) {return}
    try {
      if (this.editingBaseline) {
        await this.roiService.updateBaseline(this.selectedOrg, this.editingBaseline.id, {
          value_outcome_unit: this.baselineForm.value_outcome_unit,
          task_description: this.baselineForm.task_description,
          manual_effort_hours_per_execution: this.baselineForm.manual_effort_hours_per_execution,
          manual_effort_hourly_rate: this.baselineForm.manual_effort_hourly_rate,
          execution_frequency: this.baselineForm.execution_frequency,
          avg_executions_per_period: this.baselineForm.avg_executions_per_period,
        })
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Agent baseline updated' })
      } else {
        await this.roiService.createBaseline(this.selectedOrg, {
          project_id: this.agentsFilterApp,
          agent_name: this.baselineForm.agent_name,
          value_outcome_unit: this.baselineForm.value_outcome_unit,
          task_description: this.baselineForm.task_description,
          manual_effort_hours_per_execution: this.baselineForm.manual_effort_hours_per_execution,
          manual_effort_hourly_rate: this.baselineForm.manual_effort_hourly_rate,
          execution_frequency: this.baselineForm.execution_frequency,
          avg_executions_per_period: this.baselineForm.avg_executions_per_period,
        })
        this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Agent baseline created' })
      }
      this.baselineDialogVisible = false
      this.loadAgentBaselines(this.agentsFilterApp)
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save baseline' })
    }
  }

  filterVouSuggestions(event: any): void {
    const query = (event.query || '').toLowerCase()
    const existing = this.agentBaselines
      .map(b => b.value_outcome_unit)
      .filter((v, i, arr) => v && arr.indexOf(v) === i)
    this.vouSuggestions = existing.filter(v => v.toLowerCase().includes(query))
  }

  // ── Vendors ───────────────────────────────────────

  async loadVendors(): Promise<any> {
    if (!this.selectedOrg) {return}
    this.vendors = await this.dashboardService.getVendors(this.selectedOrg) || []
  }

  async loadVendorSummary(): Promise<any> {
    if (!this.selectedOrg) {return}
    this.vendorSummary = await this.dashboardService.getVendorSummary(this.selectedOrg) || []
  }

  getVendorModelCount(provider: string): number {
    const s = this.vendorSummary.find(v => v.provider === provider)
    return s?.model_count || 0
  }

  getVendorApprovedCount(provider: string): number {
    const s = this.vendorSummary.find(v => v.provider === provider)
    return s?.approved_count || 0
  }

  openNewVendor(): void {
    this.editingVendor = { name: '', provider: '', data_residency: '' }
    this.isNewVendor = true
    this.vendorDialogVisible = true
  }

  openEditVendor(vendor: any): void {
    this.editingVendor = { ...vendor }
    this.isNewVendor = false
    this.vendorDialogVisible = true
  }

  async saveVendor(): Promise<any> {
    if (this.isNewVendor) {
      await this.dashboardService.createVendor(this.selectedOrg, this.editingVendor)
      this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Vendor created' })
    } else {
      await this.dashboardService.updateVendor(this.selectedOrg, this.editingVendor.id, this.editingVendor)
      this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Vendor updated' })
    }
    this.vendorDialogVisible = false
    this.loadVendors()
  }

  async deleteVendor(vendor: any): Promise<any> {
    await this.dashboardService.deleteVendor(this.selectedOrg, vendor.id)
    this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Vendor removed' })
    this.loadVendors()
  }

  // ── Models ────────────────────────────────────────

  async loadModels(): Promise<any> {
    if (!this.selectedOrg) {return}
    const params: any = {}
    if (this.filterProvider) {params.provider = this.filterProvider}
    if (this.modelSearchQuery) {params.query = this.modelSearchQuery}
    this.models = await this.dashboardService.getModelCatalog(this.selectedOrg, params) || []
  }

  applyModelFilters(): void {
    this.loadModels()
  }

  async syncModels(): Promise<any> {
    const result = await this.dashboardService.syncModelCatalog(this.selectedOrg)
    this.messageService.add({
      severity: 'success',
      summary: 'Synced',
      detail: `Created ${result?.created || 0}, updated ${result?.updated || 0} models`,
    })
    this.loadModels()
  }

  async syncFromProviders(): Promise<any> {
    this.syncingProviders = true
    try {
      const result = await this.dashboardService.syncModelCatalogFromProviders(this.selectedOrg)
      this.messageService.add({
        severity: 'success',
        summary: 'Provider Sync Complete',
        detail: `Created ${result?.created || 0}, updated ${result?.updated || 0} models from live providers`,
      })
      this.loadModels()
    } catch (e: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Sync Failed',
        detail: e?.message || 'Could not sync from providers',
      })
    } finally {
      this.syncingProviders = false
    }
  }

  async toggleApproved(model: any): Promise<any> {
    await this.dashboardService.updateModelCatalogEntry(
      this.selectedOrg, model.id, { is_approved: !model.is_approved }
    )
    this.loadModels()
  }

  formatCost(costs: any): string {
    if (!costs) {return '-'}
    return `$${costs.input || 0}/$${costs.output || 0}`
  }

  formatCapabilities(caps: any): string[] {
    if (!caps) {return []}
    return Object.entries(caps)
      .filter(([______, v]) => v === true)
      .map(([k]) => k.replace(/_/g, ' '))
  }

  formatIntelligence(evals: any): string {
    if (!evals?.intelligence_index) {return '-'}
    return evals.intelligence_index.toFixed(1)
  }

  formatTokensPerSecond(perf: any): string {
    if (!perf?.tokens_per_seconds) {return '-'}
    return perf.tokens_per_seconds.toFixed(0) + ' t/s'
  }
}
