import { Component, OnInit, ViewChild } from '@angular/core'
import { ConfirmationService, MessageService } from 'primeng/api'
import { Drawer } from 'primeng/drawer'
import { DashboardService } from '../services/dashboard.service'
import { OrgService } from '../services/orgs.service'

@Component({
  selector: 'app-regulatory',
  templateUrl: './regulatory.component.html',
  providers: [MessageService],
  standalone: false,
})
export class RegulatoryComponent implements OnInit {
  @ViewChild('regulatoryDrawerRef') regulatoryDrawerRef!: Drawer

  orgs: any[] = []
  apps: any[] = []
  selectedOrg: any = null
  selectedApp: any = null
  workspaces: any[] = []
  selectedWorkspace: any = null
  activeTab = '0'

  frameworks: any[] = []
  selectedFramework: any = null
  requirements: any[] = []
  complianceMappings: any[] = []
  report: any = null
  overview: any = null
  gaps: any[] = []

  // KPIs
  totalFrameworks = 0
  avgCompliance = 0
  gapCount = 0
  projectsTracked = 0

  // Drawer state
  drawerVisible = false
  drawerType = 'requirement'
  selectedRequirement: any = null
  selectedMapping: any = null
  notesForm: any = { status: '', notes: '', assigned_to: '' }

  // Report grouped by category
  reportGrouped: { category: string; requirements: any[]; compliant: number; total: number; percent: number }[] = []

  // Gap analysis tiers
  gapTiers: { label: string; color: string; bgColor: string; icon: string; items: any[] }[] = []

  // Framework detail drawer
  frameworkDetail: any = null
  frameworkRequirements: any[] = []
  groupedRequirements: { category: string; requirements: any[] }[] = []
  frameworkLoading = false

  // Framework options for select
  frameworkOptions: any[] = []

  // Framework form
  frameworkForm: any = { name: '', short_name: '', version: '', description: '', jurisdiction: '', effective_date: '', url: '' }
  editingFramework: any = null

  // Requirement form
  requirementForm: any = this.getEmptyRequirementForm()
  editingRequirement: any = null
  riskLevelOptions = [
    { label: 'Minimal', value: 'minimal' },
    { label: 'Limited', value: 'limited' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' },
  ]
  evidenceTypeOptions = [
    { label: 'Automated', value: 'automated' },
    { label: 'Manual', value: 'manual' },
    { label: 'Assessment', value: 'assessment' },
  ]
  metricOptions = [
    { label: 'Error Rate', value: 'error_rate' },
    { label: 'Latency P95', value: 'latency_p95' },
    { label: 'Cost per Run', value: 'cost_per_run' },
    { label: 'Token Usage', value: 'token_usage' },
    { label: 'Run Count', value: 'run_count' },
    { label: 'Drift Score', value: 'drift_score' },
    { label: 'Guard Flag Rate', value: 'guard_flag_rate' },
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
  questionTypeOptions = [
    { label: 'Yes/No', value: 'yes_no' },
    { label: 'Scale', value: 'scale' },
    { label: 'Select', value: 'select' },
    { label: 'Text', value: 'text' },
  ]

  statusOptions = [
    { label: 'Not Started', value: 'not_started' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Compliant', value: 'compliant' },
    { label: 'Non-Compliant', value: 'non_compliant' },
    { label: 'Not Applicable', value: 'not_applicable' },
  ]

  loading = false

  constructor(
    private dashboardService: DashboardService,
    private orgService: OrgService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
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
    if (!this.orgs?.length) { return { org: null, workspace: null, app: null } }
    // Prefer non-default orgs (auto-provisioned from platform)
    const sortedOrgs = [...this.orgs].sort((a, b) => {
      if (a.name === 'Default') return 1
      if (b.name === 'Default') return -1
      return 0
    })
    for (const org of sortedOrgs) {
      if (org.workspaces?.length) {
        for (const ws of org.workspaces) {
          const activeProjects = (ws.projects || []).filter((p: any) => p.is_active)
          if (activeProjects.length > 0) {
            return { org, workspace: ws, app: activeProjects[0] }
          }
        }
      }
      const orgProjects = (org.projects || []).filter((p: any) => p.is_active)
      if (orgProjects.length > 0) {
        return { org, workspace: null, app: orgProjects[0] }
      }
    }
    const firstOrg = sortedOrgs[0]
    const firstWs = firstOrg.workspaces?.length ? firstOrg.workspaces[0] : null
    return { org: firstOrg, workspace: firstWs, app: null }
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
      } else {
        this.selectedApp = this.apps.length > 0 ? this.apps[0] : null
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
    this.resetData()
  }

  workspaceChanged(event: any): void {
    this.apps = this.getAppsFromWorkspace(this.selectedOrg, this.selectedWorkspace)
    this.selectedApp = this.apps.length > 0 ? this.apps[0] : null
    this.resetData()
    if (this.selectedFramework) {
      this.loadComplianceData()
    }
  }

  async onAppChange(): Promise<any> {
    this.resetData()
    if (this.selectedFramework) {
      await this.loadComplianceData()
    }
  }

  async onFrameworkChange(): Promise<any> {
    if (this.selectedFramework) {
      await this.loadComplianceData()
    }
  }

  async loadFrameworks(): Promise<any> {
    if (!this.selectedOrg) {return}
    this.frameworks = await this.dashboardService.getFrameworks(this.selectedOrg.id)
    this.totalFrameworks = this.frameworks?.length || 0
    this.frameworkOptions = (this.frameworks || []).map(f => ({
      label: `${f.short_name} (${f.version || ''})`,
      value: f,
    }))
    if (this.frameworks?.length > 0 && !this.selectedFramework) {
      this.selectedFramework = this.frameworks[0]
      await this.loadComplianceData()
    }
  }

  async loadComplianceData(): Promise<any> {
    if (!this.selectedOrg || !this.selectedApp || !this.selectedFramework) {return}
    this.loading = true

    try {
      // Load requirements with mappings
      const data = await this.dashboardService.getComplianceMappings(
        this.selectedOrg.id, this.selectedApp.id, this.selectedFramework.id
      )
      this.complianceMappings = data || []

      // Extract requirements
      this.requirements = this.complianceMappings.map(item => ({
        ...item.requirement,
        mapping: item.mapping,
        status: item.mapping?.status || 'not_started',
        evidence_count: item.mapping?.evidence_ids?.length || 0,
        evaluation_count: item.mapping?.policy_evaluation_ids?.length || 0,
      }))

      // Load report
      this.report = await this.dashboardService.getComplianceReport(
        this.selectedOrg.id, this.selectedApp.id, this.selectedFramework.id
      )

      // Load overview
      this.overview = await this.dashboardService.getComplianceOverview(this.selectedOrg.id)

      // Update KPIs
      this.updateKPIs()
    } catch (e) {
      console.error('Error loading compliance data', e)
    }

    this.loading = false
  }

  updateKPIs(): void {
    if (this.report?.summary) {
      this.avgCompliance = this.report.summary.compliance_percent || 0
      this.gapCount = (this.report.summary.not_started || 0) + (this.report.summary.in_progress || 0) + (this.report.summary.non_compliant || 0)
    }
    this.projectsTracked = this.overview?.projects?.length || 0
    this.gaps = this.report?.gaps || []
    this.reportGrouped = this.groupReportByCategory(this.report?.requirements || [])
    this.gapTiers = this.buildGapTiers(this.report?.requirements || [])
  }

  buildGapTiers(reqs: any[]): { label: string; color: string; bgColor: string; icon: string; items: any[] }[] {
    const red: any[] = []
    const yellow: any[] = []
    const green: any[] = []

    for (const req of reqs) {
      if (req.status === 'not_applicable') {continue}
      const evidenceTotal = (req.evidence_count || 0) + (req.evaluation_count || 0) + (req.assessment_count || 0)
      if (req.status === 'compliant') {
        green.push({ ...req, evidenceTotal })
      } else if (evidenceTotal === 0) {
        red.push({ ...req, evidenceTotal })
      } else {
        yellow.push({ ...req, evidenceTotal })
      }
    }

    return [
      { label: 'No Evidence', color: '#ef4444', bgColor: 'rgba(239,68,68,0.08)', icon: 'pi pi-times-circle', items: red },
      { label: 'Partial Evidence', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.08)', icon: 'pi pi-exclamation-triangle', items: yellow },
      { label: 'Fully Covered', color: '#22c55e', bgColor: 'rgba(34,197,94,0.08)', icon: 'pi pi-check-circle', items: green },
    ]
  }

  groupReportByCategory(reqs: any[]): { category: string; requirements: any[]; compliant: number; total: number; percent: number }[] {
    const map = new Map<string, any[]>()
    for (const req of reqs) {
      const cat = req.category || 'Uncategorized'
      if (!map.has(cat)) {map.set(cat, [])}
      map.get(cat)?.push(req)
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([category, items]) => {
        const compliant = items.filter(r => r.status === 'compliant').length
        return { category, requirements: items, compliant, total: items.length, percent: items.length > 0 ? Math.round(compliant / items.length * 1000) / 10 : 0 }
      })
  }

  resetData(): void {
    this.complianceMappings = []
    this.requirements = []
    this.report = null
    this.gaps = []
  }

  async autoMap(): Promise<any> {
    if (!this.selectedOrg || !this.selectedApp || !this.selectedFramework) {
      this.messageService.add({ severity: 'warn', summary: 'Select a project and framework first' })
      return
    }
    this.loading = true
    try {
      await this.dashboardService.autoMapCompliance(
        this.selectedOrg.id, this.selectedApp.id, this.selectedFramework.id
      )
      this.messageService.add({ severity: 'success', summary: 'Auto-mapping complete' })
      await this.loadComplianceData()
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Auto-mapping failed' })
    }
    this.loading = false
  }

  async generateReport(): Promise<any> {
    if (!this.selectedOrg || !this.selectedApp || !this.selectedFramework) {
      this.messageService.add({ severity: 'warn', summary: 'Select a project and framework first' })
      return
    }
    await this.loadComplianceData()
    this.activeTab = '2'
    this.messageService.add({ severity: 'success', summary: 'Report generated' })
  }

  openRequirementDetail(req: any): void {
    this.selectedRequirement = req
    this.drawerType = 'requirement'
    this.drawerVisible = true
  }

  openNotesEditor(req: any): void {
    this.selectedRequirement = req
    this.selectedMapping = req.mapping
    this.notesForm = {
      status: req.mapping?.status || 'not_started',
      notes: req.mapping?.notes || '',
      assigned_to: req.mapping?.assigned_to || '',
    }
    this.drawerType = 'notes'
    this.drawerVisible = true
  }

  async saveNotes(): Promise<any> {
    if (!this.selectedOrg || !this.selectedApp || !this.selectedRequirement) {return}
    try {
      await this.dashboardService.updateComplianceMapping(
        this.selectedOrg.id,
        this.selectedApp.id,
        this.selectedRequirement.id,
        this.notesForm,
      )
      this.messageService.add({ severity: 'success', summary: 'Mapping updated' })
      this.drawerVisible = false
      await this.loadComplianceData()
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Update failed' })
    }
  }

  async openFrameworkDetail(fw: any): Promise<any> {
    this.frameworkDetail = fw
    this.frameworkRequirements = []
    this.groupedRequirements = []
    this.frameworkLoading = true
    this.drawerType = 'framework'
    this.drawerVisible = true

    try {
      const detail = await this.dashboardService.getFramework(fw.id)
      this.frameworkDetail = detail?.framework || fw
      this.frameworkRequirements = Array.isArray(detail?.requirements) ? detail.requirements : []
      this.groupedRequirements = this.groupRequirementsByCategory(this.frameworkRequirements)
    } catch (e) {
      console.error('Error loading framework detail', e)
    }
    this.frameworkLoading = false
  }

  groupRequirementsByCategory(reqs: any[]): { category: string; requirements: any[] }[] {
    const map = new Map<string, any[]>()
    for (const req of reqs) {
      const cat = req.category || 'Uncategorized'
      if (!map.has(cat)) {map.set(cat, [])}
      map.get(cat)?.push(req)
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([category, requirements]) => ({ category, requirements }))
  }

  getRiskLevelSeverity(level: string): string {
    switch (level?.toLowerCase()) {
      case 'unacceptable': return 'danger'
      case 'high': return 'warn'
      case 'limited': return 'info'
      case 'minimal': return 'secondary'
      default: return 'secondary'
    }
  }

  exportPDF(): void {
    if (!this.report) {
      this.messageService.add({ severity: 'warn', summary: 'Generate a report first' })
      return
    }

    const fw = this.report.framework
    const proj = this.report.project
    const summary = this.report.summary
    const reqs = this.report.requirements || []

    // Group requirements by category
    const grouped = new Map<string, any[]>()
    for (const req of reqs) {
      const cat = req.category || 'Uncategorized'
      if (!grouped.has(cat)) {grouped.set(cat, [])}
      grouped.get(cat)?.push(req)
    }

    const statusColor = (s: string): string => {
      switch (s) {
        case 'compliant': return '#22c55e'
        case 'in_progress': return '#f59e0b'
        case 'non_compliant': return '#ef4444'
        case 'not_applicable': return '#94a3b8'
        default: return '#3b82f6'
      }
    }

    let categoriesHtml = ''
    for (const [cat, items] of Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
      let rowsHtml = ''
      for (const req of items) {
        rowsHtml += `<tr>
          <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-weight:600">${req.requirement_code}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0">${req.title}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;text-align:center">
            <span style="background:${statusColor(req.status)};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px">${this.getStatusLabel(req.status)}</span>
          </td>
          <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;text-align:center">${req.evidence_count}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;text-align:center">${req.evaluation_count}</td>
        </tr>`
      }
      categoriesHtml += `
        <h3 style="margin:24px 0 8px;color:#334155">${cat} (${items.length})</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr style="background:#f1f5f9">
            <th style="padding:8px 10px;text-align:left;border-bottom:2px solid #cbd5e1">Code</th>
            <th style="padding:8px 10px;text-align:left;border-bottom:2px solid #cbd5e1">Title</th>
            <th style="padding:8px 10px;text-align:center;border-bottom:2px solid #cbd5e1">Status</th>
            <th style="padding:8px 10px;text-align:center;border-bottom:2px solid #cbd5e1">Evidence</th>
            <th style="padding:8px 10px;text-align:center;border-bottom:2px solid #cbd5e1">Evals</th>
          </tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>`
    }

    const html = `<!DOCTYPE html><html><head><title>Compliance Report - ${fw.short_name}</title>
      <style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:40px;color:#1e293b}
      @media print{body{margin:20px}}</style></head><body>
      <h1 style="margin:0 0 4px">Compliance Report</h1>
      <h2 style="margin:0 0 4px;color:#475569">${fw.name} (${fw.version || 'N/A'})</h2>
      <p style="color:#64748b;margin:0 0 24px">Project: ${proj.name} &bull; Generated: ${new Date(this.report.generated_at).toLocaleString()}</p>
      <div style="display:flex;gap:16px;margin-bottom:24px">
        <div style="flex:1;background:#f0fdf4;padding:16px;border-radius:8px;text-align:center"><div style="font-size:24px;font-weight:700;color:#22c55e">${summary.compliant}</div><div style="font-size:12px;color:#64748b">Compliant</div></div>
        <div style="flex:1;background:#fefce8;padding:16px;border-radius:8px;text-align:center"><div style="font-size:24px;font-weight:700;color:#f59e0b">${summary.in_progress}</div><div style="font-size:12px;color:#64748b">In Progress</div></div>
        <div style="flex:1;background:#eff6ff;padding:16px;border-radius:8px;text-align:center"><div style="font-size:24px;font-weight:700;color:#3b82f6">${summary.not_started}</div><div style="font-size:12px;color:#64748b">Not Started</div></div>
        <div style="flex:1;background:#fef2f2;padding:16px;border-radius:8px;text-align:center"><div style="font-size:24px;font-weight:700;color:#ef4444">${summary.non_compliant}</div><div style="font-size:12px;color:#64748b">Non-Compliant</div></div>
        <div style="flex:1;background:#f8fafc;padding:16px;border-radius:8px;text-align:center"><div style="font-size:24px;font-weight:700;color:${this.getComplianceColor(summary.compliance_percent)}">${summary.compliance_percent}%</div><div style="font-size:12px;color:#64748b">Overall</div></div>
      </div>
      ${categoriesHtml}
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8">Observatory AI - Compliance Report &bull; ${fw.jurisdiction || ''}</div>
      </body></html>`

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.onload = () => printWindow.print()
    }
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'compliant': return 'success'
      case 'in_progress': return 'warn'
      case 'non_compliant': return 'danger'
      case 'not_applicable': return 'secondary'
      default: return 'info'
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'not_started': return 'Not Started'
      case 'in_progress': return 'In Progress'
      case 'compliant': return 'Compliant'
      case 'non_compliant': return 'Non-Compliant'
      case 'not_applicable': return 'N/A'
      default: return status
    }
  }

  getComplianceColor(percent: number): string {
    if (percent >= 80) {return '#22c55e'}
    if (percent >= 50) {return '#f59e0b'}
    return '#ef4444'
  }

  getOverviewFrameworks(): any[] {
    return this.overview?.frameworks || []
  }

  getOverviewProjects(): any[] {
    return this.overview?.projects || []
  }

  getProjectFrameworkPercent(project: any, frameworkId: string): number {
    return project?.frameworks?.[frameworkId]?.compliance_percent || 0
  }

  closeDrawer(e: Event): void {
    this.regulatoryDrawerRef.close(e)
  }

  getDrawerTitle(): string {
    if (this.drawerType === 'frameworkForm') {return this.editingFramework ? 'Edit Framework' : 'New Custom Framework'}
    if (this.drawerType === 'requirementForm') {return this.editingRequirement ? 'Edit Requirement' : 'Add Requirement'}
    if (this.drawerType === 'framework') {return this.frameworkDetail?.short_name + ' — ' + (this.frameworkDetail?.name || '')}
    if (this.drawerType === 'notes') {return 'Edit Mapping: ' + (this.selectedRequirement?.requirement_code || '')}
    return this.selectedRequirement?.requirement_code + ' — ' + (this.selectedRequirement?.title || '')
  }

  // ── Framework CRUD ─────────────────────────────────────

  openNewFrameworkForm(): void {
    this.editingFramework = null
    this.frameworkForm = { name: '', short_name: '', version: '', description: '', jurisdiction: '', effective_date: '', url: '' }
    this.drawerType = 'frameworkForm'
    this.drawerVisible = true
  }

  openEditFrameworkForm(fw: any): void {
    this.editingFramework = fw
    this.frameworkForm = {
      name: fw.name || '',
      short_name: fw.short_name || '',
      version: fw.version || '',
      description: fw.description || '',
      jurisdiction: fw.jurisdiction || '',
      effective_date: fw.effective_date || '',
      url: fw.url || '',
    }
    this.drawerType = 'frameworkForm'
    this.drawerVisible = true
  }

  async saveFramework(): Promise<any> {
    if (!this.selectedOrg || !this.frameworkForm.name || !this.frameworkForm.short_name) {
      this.messageService.add({ severity: 'warn', summary: 'Name and short name are required' })
      return
    }
    try {
      if (this.editingFramework) {
        await this.dashboardService.updateFramework(this.selectedOrg.id, this.editingFramework.id, this.frameworkForm)
        this.messageService.add({ severity: 'success', summary: 'Framework updated' })
      } else {
        await this.dashboardService.createFramework(this.selectedOrg.id, this.frameworkForm)
        this.messageService.add({ severity: 'success', summary: 'Framework created' })
      }
      this.drawerVisible = false
      await this.loadFrameworks()
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Failed to save framework' })
    }
  }

  confirmDeleteFramework(fw: any, event: Event): void {
    event.stopPropagation()
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Delete "${fw.name}"? This will remove all its requirements.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteFramework(fw),
    })
  }

  async deleteFramework(fw: any): Promise<any> {
    if (!this.selectedOrg) {return}
    try {
      await this.dashboardService.deleteFramework(this.selectedOrg.id, fw.id)
      this.messageService.add({ severity: 'success', summary: 'Framework deleted' })
      await this.loadFrameworks()
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Failed to delete framework' })
    }
  }

  // ── Requirement CRUD ───────────────────────────────────

  getEmptyRequirementForm(): any {
    return {
      requirement_code: '',
      title: '',
      description: '',
      category: '',
      risk_level_applicability: [],
      evidence_types: [],
      suggested_policy_rules: [],
      suggested_questions: [],
      order_index: 0,
    }
  }

  openNewRequirementForm(): void {
    this.editingRequirement = null
    this.requirementForm = this.getEmptyRequirementForm()
    this.requirementForm.order_index = this.frameworkRequirements.length + 1
    this.drawerType = 'requirementForm'
    this.drawerVisible = true
  }

  openEditRequirementForm(req: any, event?: Event): void {
    if (event) {event.stopPropagation()}
    this.editingRequirement = req
    this.requirementForm = {
      requirement_code: req.requirement_code || '',
      title: req.title || '',
      description: req.description || '',
      category: req.category || '',
      risk_level_applicability: req.risk_level_applicability ? [...req.risk_level_applicability] : [],
      evidence_types: req.evidence_types ? [...req.evidence_types] : [],
      suggested_policy_rules: req.suggested_policy_rules ? req.suggested_policy_rules.map((r: any) => ({ ...r })) : [],
      suggested_questions: req.suggested_questions ? req.suggested_questions.map((q: any) => ({ ...q })) : [],
      order_index: req.order_index || 0,
    }
    this.drawerType = 'requirementForm'
    this.drawerVisible = true
  }

  addPolicyRule(): void {
    this.requirementForm.suggested_policy_rules.push({ metric: 'error_rate', operator: 'lte', threshold: 0.1 })
  }

  removePolicyRule(index: number): void {
    this.requirementForm.suggested_policy_rules.splice(index, 1)
  }

  addQuestion(): void {
    this.requirementForm.suggested_questions.push({ text: '', type: 'yes_no', weight: 1.0 })
  }

  removeQuestion(index: number): void {
    this.requirementForm.suggested_questions.splice(index, 1)
  }

  async saveRequirement(): Promise<any> {
    if (!this.selectedOrg || !this.frameworkDetail) {return}
    if (!this.requirementForm.requirement_code || !this.requirementForm.title) {
      this.messageService.add({ severity: 'warn', summary: 'Code and title are required' })
      return
    }
    try {
      if (this.editingRequirement) {
        await this.dashboardService.updateRequirement(
          this.frameworkDetail.id, this.selectedOrg.id, this.editingRequirement.id, this.requirementForm
        )
        this.messageService.add({ severity: 'success', summary: 'Requirement updated' })
      } else {
        await this.dashboardService.addRequirement(
          this.frameworkDetail.id, this.selectedOrg.id, this.requirementForm
        )
        this.messageService.add({ severity: 'success', summary: 'Requirement added' })
      }
      // Reload framework detail
      await this.reloadFrameworkDetail()
      this.drawerType = 'framework'
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Failed to save requirement' })
    }
  }

  async confirmDeleteRequirement(req: any, event: Event): Promise<any> {
    event.stopPropagation()
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Delete requirement "${req.requirement_code} — ${req.title}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteRequirement(req),
    })
  }

  async deleteRequirement(req: any): Promise<any> {
    if (!this.selectedOrg || !this.frameworkDetail) {return}
    try {
      await this.dashboardService.deleteRequirement(this.frameworkDetail.id, this.selectedOrg.id, req.id)
      this.messageService.add({ severity: 'success', summary: 'Requirement deleted' })
      await this.reloadFrameworkDetail()
    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Failed to delete requirement' })
    }
  }

  async reloadFrameworkDetail(): Promise<any> {
    if (!this.frameworkDetail) {return}
    try {
      const detail = await this.dashboardService.getFramework(this.frameworkDetail.id)
      this.frameworkDetail = detail?.framework || this.frameworkDetail
      this.frameworkRequirements = Array.isArray(detail?.requirements) ? detail.requirements : []
      this.groupedRequirements = this.groupRequirementsByCategory(this.frameworkRequirements)
    } catch (e) {
      console.error('Error reloading framework detail', e)
    }
  }
}
