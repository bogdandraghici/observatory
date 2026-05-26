import { Component, OnInit } from '@angular/core'
import { Title, Meta } from '@angular/platform-browser'
import { MessageService } from 'primeng/api'
import { DashboardService } from '../services/dashboard.service'
import { OrgService } from '../services/orgs.service'
import { resolveDefaultAppOrg } from '../utils/default-app'

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.scss'],
  providers: [MessageService],
  standalone: false,
})
export class AssessmentsComponent implements OnInit {
  orgs: any[] = []
  apps: any[] = []
  workspaces: any[] = []
  selectedOrg: any = null
  selectedWorkspace: any = null
  activeTab = '0'

  templates: any[] = []
  assessments: any[] = []

  // Template dialog
  templateDialogVisible = false
  templateEditMode = false
  templateForm: any = {}

  // Assessment dialog
  assessmentDialogVisible = false
  assessmentForm: any = {}

  // Take assessment dialog
  takeDialogVisible = false
  currentAssessment: any = null
  currentTemplate: any = null
  responses: any = {}
  lastScore: number | null = null

  // Signature verification
  signatureStatus: Map<string, { valid: boolean; loading: boolean }> = new Map()

  // Predefined templates
  predefinedDialogVisible = false
  predefinedTemplates: any[] = []
  loadingPredefined = false

  // Delete
  deleteDialogVisible = false
  itemToDelete: any = null
  deleteType = ''

  categoryOptions = [
    { label: 'General', value: 'general' },
    { label: 'Fairness', value: 'fairness' },
    { label: 'Safety', value: 'safety' },
    { label: 'Privacy', value: 'privacy' },
    { label: 'Transparency', value: 'transparency' },
    { label: 'Regulatory', value: 'regulatory' },
  ]

  questionTypeOptions = [
    { label: 'Boolean (Yes/No)', value: 'boolean' },
    { label: 'Scale', value: 'scale' },
    { label: 'Select', value: 'select' },
    { label: 'Multi-select', value: 'multiselect' },
    { label: 'Text', value: 'text' },
  ]

  constructor(
    private dashboardService: DashboardService,
    private orgService: OrgService,
    private messageService: MessageService,
    private titleService: Title,
    private metaService: Meta,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('FlowX.AI Observatory - Assessments')
    this.metaService.updateTag({ name: 'description', content: 'Assessment templates and scoring.' })
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
    return resolveDefaultAppOrg(this.orgs)
  }

  orgChanged(): void {
    const org = this.orgs.find((o: any) => o.id === this.selectedOrg)
    this.workspaces = this.getWorkspaces(this.selectedOrg)
    this.selectedWorkspace = this.workspaces.length > 0 ? this.workspaces[0].id : null
    this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
    this.loadAll()
  }

  workspaceChanged(event: any): void {
    const org = this.orgs.find((o: any) => o.id === this.selectedOrg)
    this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
    this.loadAll()
  }

  loadAll(): void {
    this.loadTemplates()
    this.loadAssessments()
  }

  async loadTemplates(): Promise<any> {
    this.templates = await this.dashboardService.getAssessmentTemplates(this.selectedOrg) || []
  }

  async loadAssessments(): Promise<any> {
    this.assessments = await this.dashboardService.getAssessments(this.selectedOrg) || []
  }

  // ── Template CRUD ────────────────────────────────

  createTemplate(): void {
    this.templateEditMode = false
    this.templateForm = { name: '', description: '', category: 'general', questions: [] }
    this.templateDialogVisible = true
  }

  editTemplate(t: any): void {
    this.templateEditMode = true
    this.templateForm = { ...t, questions: (t.questions || []).map((q: any) => ({ ...q })) }
    this.templateDialogVisible = true
  }

  addQuestion(): void {
    const idx = (this.templateForm.questions?.length || 0) + 1
    this.templateForm.questions = [
      ...(this.templateForm.questions || []),
      { id: 'q' + idx, type: 'boolean', text: '', weight: 1 },
    ]
  }

  removeQuestion(index: number): void {
    this.templateForm.questions = this.templateForm.questions.filter((_: any, i: number) => i !== index)
  }

  parseOptions(value: string): string[] {
    return value.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
  }

  async saveTemplate(): Promise<any> {
    const questions = this.templateForm.questions || []
    const invalid = questions.some((q: any) => !q.text || !q.type)
    if (questions.length > 0 && invalid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill in question text and type for all questions' })
      return
    }
    // Auto-assign IDs if missing
    questions.forEach((q: any, i: number) => { if (!q.id) {q.id = 'q' + (i + 1)} })

    if (this.templateEditMode) {
      await this.dashboardService.updateAssessmentTemplate(this.selectedOrg, this.templateForm.id, this.templateForm)
      this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Template updated' })
    } else {
      await this.dashboardService.createAssessmentTemplate(this.selectedOrg, this.templateForm)
      this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Template created' })
    }
    this.templateDialogVisible = false
    this.loadTemplates()
  }

  // ── Assessment CRUD ──────────────────────────────

  createAssessment(): void {
    this.assessmentForm = { template_id: null, project_id: null, policy_id: null }
    this.assessmentDialogVisible = true
  }

  async saveAssessment(): Promise<any> {
    await this.dashboardService.createAssessment(this.selectedOrg, this.assessmentForm)
    this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Assessment started' })
    this.assessmentDialogVisible = false
    this.loadAssessments()
  }

  // ── Take Assessment ──────────────────────────────

  async takeAssessment(assessment: any): Promise<any> {
    this.currentAssessment = assessment
    this.currentTemplate = this.templates.find((t: any) => t.id === assessment.template_id)
    if (!this.currentTemplate) {
      const detail = await this.dashboardService.getAssessment(this.selectedOrg, assessment.id)
      this.currentTemplate = this.templates.find((t: any) => t.id === detail?.template_id)
    }
    this.responses = { ...(assessment.responses || {}) }
    this.lastScore = null
    this.takeDialogVisible = true
  }

  async submitAssessment(): Promise<any> {
    const result = await this.dashboardService.submitAssessment(
      this.selectedOrg,
      this.currentAssessment.id,
      { responses: this.responses }
    )
    this.lastScore = result?.score || 0
    this.messageService.add({
      severity: 'success',
      summary: 'Submitted',
      detail: `Score: ${((this.lastScore ?? 0) * 100).toFixed(1)}%`,
    })
    this.loadAssessments()
  }

  // ── Delete ───────────────────────────────────────

  confirmDelete(item: any, type: string): void {
    this.itemToDelete = item
    this.deleteType = type
    this.deleteDialogVisible = true
  }

  async deleteItem(): Promise<any> {
    if (this.deleteType === 'template') {
      await this.dashboardService.deleteAssessmentTemplate(this.selectedOrg, this.itemToDelete.id)
      this.loadTemplates()
    }
    this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `${this.deleteType} deleted` })
    this.deleteDialogVisible = false
  }

  // ── Signature Verification ─────────────────────

  async verifySignature(assessment: any): Promise<any> {
    this.signatureStatus.set(assessment.id, { valid: false, loading: true })
    try {
      const result = await this.dashboardService.verifyAssessmentSignature(this.selectedOrg, assessment.id)
      const valid = result?.is_valid === true
      this.signatureStatus.set(assessment.id, { valid, loading: false })
      this.messageService.add({
        severity: valid ? 'success' : 'error',
        summary: 'Signature Verification',
        detail: valid ? 'Signature is valid' : 'Signature is invalid or missing',
      })
    } catch (err) {
      this.signatureStatus.set(assessment.id, { valid: false, loading: false })
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to verify signature' })
    }
  }

  getSignatureStatus(assessmentId: string): { valid: boolean; loading: boolean } | undefined {
    return this.signatureStatus.get(assessmentId)
  }

  // ── Predefined Templates ────────────────────────

  async openPredefinedDialog(): Promise<any> {
    this.predefinedDialogVisible = true
    this.loadingPredefined = true
    try {
      this.predefinedTemplates = await this.dashboardService.getPredefinedAssessmentTemplates() || []
    } catch {
      this.predefinedTemplates = []
    }
    this.loadingPredefined = false
  }

  async applyPredefinedTemplate(framework: string): Promise<any> {
    try {
      const result = await this.dashboardService.createTemplateFromPredefined(this.selectedOrg, framework)
      this.messageService.add({
        severity: 'success',
        summary: 'Template Created',
        detail: `Created "${result?.name}" with ${result?.questions?.length || 0} questions`,
      })
      this.predefinedDialogVisible = false
      this.loadTemplates()
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create template' })
    }
  }

  getFrameworkIcon(framework: string): string {
    switch (framework) {
      case 'eu_ai_act': return 'pi pi-globe'
      case 'nist_rmf': return 'pi pi-shield'
      case 'iso_42001': return 'pi pi-verified'
      case 'soc2_ai': return 'pi pi-lock'
      case 'dora': return 'pi pi-server'
      default: return 'pi pi-file'
    }
  }

  // ── Helpers ──────────────────────────────────────

  getStatusSeverity(s: string): string {
    switch (s) {
      case 'completed': return 'success'
      case 'in_progress': return 'info'
      case 'draft': return 'warn'
      case 'expired': return 'danger'
      default: return 'secondary'
    }
  }

  getTemplateName(templateId: string): string {
    const t = this.templates.find((tpl: any) => tpl.id === templateId)
    return t?.name || templateId
  }

  getAppName(appId: string): string {
    const a = this.apps.find((app: any) => app.id === appId)
    return a?.name || appId
  }

}
