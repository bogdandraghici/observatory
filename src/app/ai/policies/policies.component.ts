import { Component, OnInit } from '@angular/core'
import { Title, Meta } from '@angular/platform-browser'
import { MessageService } from 'primeng/api'
import { DashboardService } from '../services/dashboard.service'
import { OrgService } from '../services/orgs.service'

@Component({
  selector: 'app-policies',
  templateUrl: './policies.component.html',
  providers: [MessageService],
  standalone: false,
})
export class PoliciesComponent implements OnInit {
  orgs: any[] = []
  apps: any[] = []
  workspaces: any[] = []
  selectedOrg: any = null
  selectedWorkspace: any = null
  selectedApp: any = null
  activeTab = '0'

  policies: any[] = []
  packs: any[] = []
  assignments: any[] = []
  compliance: any[] = []
  evaluationResults: any[] = []

  // KPIs
  totalPolicies = 0
  compliantApps = 0
  nonCompliantApps = 0
  coveragePercent = 0

  // Dialog state
  editMode = false
  policyDialogVisible = false
  packDialogVisible = false
  assignmentDialogVisible = false
  policyForm: any = {}
  packForm: any = {}
  assignmentForm: any = {}

  deleteDialogVisible = false
  itemToDelete: any = null
  deleteType = ''

  // Template dialog
  templateDialogVisible = false
  templateOptions = [
    { framework: 'eu_ai_act', name: 'EU AI Act', description: 'European AI regulation — accuracy, transparency, data quality, cost, and performance policies.', policyCount: 5 },
    { framework: 'nist_rmf', name: 'NIST AI RMF', description: 'NIST Risk Management Framework — measure performance, reliability, cost control, and drift.', policyCount: 4 },
    { framework: 'iso_42001', name: 'ISO 42001', description: 'AI management system standard — performance, data management, resources, and monitoring.', policyCount: 4 },
    { framework: 'soc2_ai', name: 'SOC 2 AI Controls', description: 'SOC 2 trust criteria applied to AI — availability, monitoring, and change management.', policyCount: 3 },
    { framework: 'dora', name: 'DORA', description: 'Digital Operational Resilience Act — ICT risk management, resilience testing, and monitoring.', policyCount: 3 },
  ]

  // Evaluation dialog
  evalDialogVisible = false
  evalResults: any[] = []

  // Options
  enforcementOptions = [
    { label: 'Advisory', value: 'advisory' },
    { label: 'Soft Block', value: 'soft_block' },
    { label: 'Hard Block', value: 'hard_block' },
  ]

  categoryOptions = [
    { label: 'EU AI Act', value: 'eu_ai_act' },
    { label: 'NIST RMF', value: 'nist_rmf' },
    { label: 'ISO 42001', value: 'iso_42001' },
    { label: 'Custom', value: 'custom' },
  ]

  frameworkOptions = [
    { label: 'EU AI Act', value: 'eu_ai_act' },
    { label: 'NIST RMF', value: 'nist_rmf' },
    { label: 'ISO 42001', value: 'iso_42001' },
    { label: 'SOC 2 AI', value: 'soc2_ai' },
    { label: 'DORA', value: 'dora' },
    { label: 'Custom', value: 'custom' },
  ]

  metricOptions = [
    { label: 'Latency P95 (ms)', value: 'latency_p95' },
    { label: 'Latency Avg (ms)', value: 'latency_avg' },
    { label: 'Error Rate', value: 'error_rate' },
    { label: 'Cost per Run', value: 'cost_per_run' },
    { label: 'Total Cost', value: 'total_cost' },
    { label: 'Token Usage', value: 'token_usage' },
    { label: 'Run Count', value: 'run_count' },
    { label: 'Drift Score', value: 'drift_score' },
    { label: 'OCR Quality Avg', value: 'ocr_quality_avg' },
    { label: 'Doc Confidence Avg', value: 'doc_confidence_avg' },
    { label: 'Page Count Avg', value: 'page_count_avg' },
  ]

  operatorOptions = [
    { label: '>', value: 'gt' },
    { label: '<', value: 'lt' },
    { label: '>=', value: 'gte' },
    { label: '<=', value: 'lte' },
    { label: '=', value: 'eq' },
  ]

  constructor(
    private dashboardService: DashboardService,
    private orgService: OrgService,
    private messageService: MessageService,
    private titleService: Title,
    private metaService: Meta,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('FlowX.AI Observatory - Policies')
    this.metaService.updateTag({ name: 'description', content: 'Policy engine and compliance management.' })
    this.populateOrgs()
  }

  populateOrgs(): void {
    this.orgService.getOrgsWithApps().then((data: any) => {
      this.orgs = data || []
      if (this.orgs.length > 0) {
        const { org, workspace, app } = this.getDefaultAppOrg()
        this.selectedOrg = org?.id || null
        this.workspaces = this.getWorkspaces(this.selectedOrg)
        this.selectedWorkspace = workspace?.id || null
        this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
        this.selectedApp = app?.id || null
        this.loadAll()
      }
    })
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

  getDefaultAppOrg(): { org: any; workspace: any; app: any } {
    for (const org of this.orgs) {
      if (org.workspaces?.length > 0) {
        for (const ws of org.workspaces) {
          const activeProjects = (ws.projects || []).filter((a: any) => a.is_active)
          if (activeProjects.length > 0) {
            return { org, workspace: ws, app: activeProjects[0] }
          }
        }
      }
      const activeProjects = (org.projects || []).filter((a: any) => a.is_active)
      if (activeProjects.length > 0) {
        return { org, workspace: null, app: activeProjects[0] }
      }
    }
    const firstOrg = this.orgs[0] || null
    const firstWs = firstOrg?.workspaces?.[0] || null
    return { org: firstOrg, workspace: firstWs, app: null }
  }

  orgChanged(): void {
    const org = this.orgs.find((o: any) => o.id === this.selectedOrg)
    this.workspaces = this.getWorkspaces(this.selectedOrg)
    this.selectedWorkspace = this.workspaces.length > 0 ? this.workspaces[0].id : null
    this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
    this.selectedApp = this.apps.length > 0 ? this.apps[0].id : null
    this.loadAll()
  }

  workspaceChanged(event: any): void {
    const org = this.orgs.find((o: any) => o.id === this.selectedOrg)
    this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
    this.selectedApp = this.apps.length > 0 ? this.apps[0].id : null
    this.loadAll()
  }

  loadAll(): void {
    this.loadPolicies()
    this.loadPacks()
    this.loadAssignments()
    this.loadCompliance()
  }

  async loadPolicies(): Promise<any> {
    const data = await this.dashboardService.getPolicies(this.selectedOrg)
    this.policies = Array.isArray(data) ? data : []
    this.totalPolicies = this.policies.length
  }

  async loadPacks(): Promise<any> {
    const data = await this.dashboardService.getPolicyPacks(this.selectedOrg)
    this.packs = Array.isArray(data) ? data : []
  }

  async loadAssignments(): Promise<any> {
    const data = await this.dashboardService.getPolicyAssignments(this.selectedOrg)
    this.assignments = Array.isArray(data) ? data : []
  }

  async loadCompliance(): Promise<any> {
    const data = await this.dashboardService.getComplianceDashboard({ org_id: this.selectedOrg, hours: 720 })
    this.compliance = Array.isArray(data) ? data : []
    this.compliantApps = this.compliance.filter((c: any) => c.compliant && c.evaluation_count > 0).length
    this.nonCompliantApps = this.compliance.filter((c: any) => !c.compliant && c.evaluation_count > 0).length
    const assigned = this.compliance.filter((c: any) => c.assigned_packs?.length > 0).length
    this.coveragePercent = this.compliance.length > 0 ? Math.round((assigned / this.compliance.length) * 100) : 0
  }

  // ── Policy CRUD ──────────────────────────────────

  createPolicy(): void {
    this.editMode = false
    this.policyForm = { name: '', description: '', enforcement_level: 'advisory', category: 'custom', rules: [] }
    this.policyDialogVisible = true
  }

  editPolicy(policy: any): void {
    this.editMode = true
    this.policyForm = { ...policy, rules: (policy.rules || []).map((r: any) => ({ ...r })) }
    this.policyDialogVisible = true
  }

  addRule(): void {
    this.policyForm.rules = [...(this.policyForm.rules || []), { metric: null, operator: null, threshold: null }]
  }

  removeRule(index: number): void {
    this.policyForm.rules = this.policyForm.rules.filter((_: any, i: number) => i !== index)
  }

  async savePolicy(): Promise<any> {
    const rules = this.policyForm.rules || []
    const invalid = rules.some((r: any) => !r.metric || !r.operator || r.threshold == null)
    if (rules.length > 0 && invalid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill in all rule fields' })
      return
    }

    if (this.editMode) {
      await this.dashboardService.updatePolicy(this.selectedOrg, this.policyForm.id, this.policyForm)
      this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Policy updated' })
    } else {
      await this.dashboardService.createPolicy(this.selectedOrg, this.policyForm)
      this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Policy created' })
    }
    this.policyDialogVisible = false
    this.loadPolicies()
  }

  // ── Pack CRUD ────────────────────────────────────

  createPack(): void {
    this.editMode = false
    this.packForm = { name: '', description: '', framework: 'custom', policy_ids: [] }
    this.packDialogVisible = true
  }

  editPack(pack: any): void {
    this.editMode = true
    this.packForm = { ...pack }
    this.packDialogVisible = true
  }

  async savePack(): Promise<any> {
    if (this.editMode) {
      await this.dashboardService.updatePolicyPack(this.selectedOrg, this.packForm.id, this.packForm)
      this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Pack updated' })
    } else {
      await this.dashboardService.createPolicyPack(this.selectedOrg, this.packForm)
      this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Pack created' })
    }
    this.packDialogVisible = false
    this.loadPacks()
  }

  // ── Assignment CRUD ──────────────────────────────

  createAssignment(): void {
    this.editMode = false
    this.assignmentForm = { policy_pack_id: null, project_id: null }
    this.assignmentDialogVisible = true
  }

  async saveAssignment(): Promise<any> {
    await this.dashboardService.createPolicyAssignment(this.selectedOrg, this.assignmentForm)
    this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Assignment created' })
    this.assignmentDialogVisible = false
    this.loadAssignments()
  }

  // ── Delete ───────────────────────────────────────

  confirmDelete(item: any, type: string): void {
    this.itemToDelete = item
    this.deleteType = type
    this.deleteDialogVisible = true
  }

  async deleteItem(): Promise<any> {
    if (this.deleteType === 'policy') {
      await this.dashboardService.deletePolicy(this.selectedOrg, this.itemToDelete.id)
      this.loadPolicies()
    } else if (this.deleteType === 'pack') {
      await this.dashboardService.deletePolicyPack(this.selectedOrg, this.itemToDelete.id)
      this.loadPacks()
    } else if (this.deleteType === 'assignment') {
      await this.dashboardService.deletePolicyAssignment(this.selectedOrg, this.itemToDelete.id)
      this.loadAssignments()
    }
    this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `${this.deleteType} deleted` })
    this.deleteDialogVisible = false
  }

  // ── Evaluate ─────────────────────────────────────

  async evaluateAll(): Promise<any> {
    if (!this.selectedApp) {
      this.messageService.add({ severity: 'warn', summary: 'Select App', detail: 'Please select an app to evaluate' })
      return
    }
    try {
      const results = await this.dashboardService.evaluatePolicies({
        project_id: this.selectedApp,
        org_id: this.selectedOrg,
      })
      if (results?.detail) {
        this.messageService.add({ severity: 'error', summary: 'Evaluation Failed', detail: results.detail })
        return
      }
      this.evalResults = Array.isArray(results) ? results : []
      this.evalDialogVisible = true
      this.loadCompliance()
    } catch (e: any) {
      console.error('Evaluate error:', e)
      this.messageService.add({ severity: 'error', summary: 'Evaluation Failed', detail: e?.message || 'Could not evaluate policies' })
    }
  }

  // ── Template Packs ─────────────────────────────────

  openTemplateDialog(): void {
    this.templateDialogVisible = true
  }

  async applyTemplate(framework: string): Promise<any> {
    try {
      await this.dashboardService.createPackFromTemplate(this.selectedOrg, { framework })
      this.messageService.add({ severity: 'success', summary: 'Template Applied', detail: 'Policies and pack created from template' })
      this.templateDialogVisible = false
      this.loadPolicies()
      this.loadPacks()
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to apply template' })
    }
  }

  // ── Helpers ──────────────────────────────────────

  getEnforcementSeverity(level: string): string {
    switch (level) {
      case 'hard_block': return 'danger'
      case 'soft_block': return 'warn'
      case 'advisory': return 'info'
      default: return 'secondary'
    }
  }

  getCategorySeverity(cat: string): string {
    switch (cat) {
      case 'eu_ai_act': return 'danger'
      case 'nist_rmf': return 'warn'
      case 'iso_42001': return 'info'
      default: return 'secondary'
    }
  }

  getPackName(packId: string): string {
    const pack = this.packs.find((p: any) => p.id === packId)
    return pack?.name || packId
  }

  getAppName(appId: string): string {
    const app = this.apps.find((a: any) => a.id === appId)
    return app?.name || appId
  }

  getPolicyOptions(): any {
    return this.policies.map((p: any) => ({ label: p.name, value: p.id }))
  }

  getPolicyName(policyId: string): string {
    const p = this.policies.find((pol: any) => pol.id === policyId)
    return p?.name || policyId
  }

}
