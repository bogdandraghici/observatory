import { Component, OnInit } from '@angular/core'
import { Title, Meta } from '@angular/platform-browser'
import { MessageService } from 'primeng/api'
import { DashboardService } from '../services/dashboard.service'
import { OrgService } from '../services/orgs.service'
import { resolveDefaultAppOrg } from '../utils/default-app'

@Component({
  selector: 'app-evidence',
  templateUrl: './evidence.component.html',
  providers: [MessageService],
  standalone: false,
})
export class EvidenceComponent implements OnInit {
  orgs: any[] = []
  apps: any[] = []
  workspaces: any[] = []
  selectedOrg: any = null
  selectedWorkspace: any = null
  selectedApp: any = null
  selectedStatus: any = null

  evidence: any[] = []
  gaps: any[] = []

  // KPIs
  totalEvidence = 0
  approvedCount = 0
  pendingCount = 0
  expiredCount = 0

  // Dialog
  evidenceDialogVisible = false
  evidenceForm: any = {}

  statusOptions = [
    { label: 'All', value: null },
    { label: 'Collected', value: 'collected' },
    { label: 'Reviewed', value: 'reviewed' },
    { label: 'Approved', value: 'approved' },
    { label: 'Expired', value: 'expired' },
  ]

  sourceOptions = [
    { label: 'Manual', value: 'manual' },
    { label: 'Telemetry', value: 'telemetry' },
    { label: 'Assessment', value: 'assessment' },
  ]

  constructor(
    private dashboardService: DashboardService,
    private orgService: OrgService,
    private messageService: MessageService,
    private titleService: Title,
    private metaService: Meta,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('FlowX.AI Observatory - Evidence')
    this.metaService.updateTag({ name: 'description', content: 'Evidence collection and gap analysis.' })
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
        this.loadEvidence()
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
    this.selectedApp = this.apps.length > 0 ? this.apps[0].id : null
    this.loadEvidence()
  }

  workspaceChanged(event: any): void {
    const org = this.orgs.find((o: any) => o.id === this.selectedOrg)
    this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
    this.selectedApp = this.apps.length > 0 ? this.apps[0].id : null
    this.loadEvidence()
  }

  filterChanged(): void {
    this.loadEvidence()
  }

  async loadEvidence(): Promise<any> {
    const params: any = {}
    if (this.selectedApp) {params.project_id = this.selectedApp}
    if (this.selectedStatus) {params.evidence_status = this.selectedStatus}
    this.evidence = await this.dashboardService.getEvidence(this.selectedOrg, params) || []
    this.totalEvidence = this.evidence.length
    this.approvedCount = this.evidence.filter((e: any) => e.status === 'approved').length
    this.pendingCount = this.evidence.filter((e: any) => e.status === 'collected' || e.status === 'reviewed').length
    this.expiredCount = this.evidence.filter((e: any) => e.status === 'expired').length
  }

  async loadGaps(): Promise<any> {
    if (!this.selectedApp) {
      this.messageService.add({ severity: 'warn', summary: 'Select App', detail: 'Please select an app for gap analysis' })
      return
    }
    this.gaps = await this.dashboardService.getEvidenceGaps({
      project_id: this.selectedApp,
      org_id: this.selectedOrg,
    }) || []
  }

  async collectEvidence(): Promise<any> {
    if (!this.selectedApp) {
      this.messageService.add({ severity: 'warn', summary: 'Select App', detail: 'Please select an app' })
      return
    }
    const result = await this.dashboardService.collectEvidence({
      project_id: this.selectedApp,
      org_id: this.selectedOrg,
    })
    this.messageService.add({ severity: 'success', summary: 'Collected', detail: `${result?.length || 0} evidence items collected` })
    this.loadEvidence()
  }

  async reviewItem(ev: any): Promise<any> {
    await this.dashboardService.reviewEvidence(this.selectedOrg, ev.id)
    this.messageService.add({ severity: 'success', summary: 'Reviewed', detail: 'Evidence marked as reviewed' })
    this.loadEvidence()
  }

  async approveItem(ev: any): Promise<any> {
    await this.dashboardService.approveEvidence(this.selectedOrg, ev.id)
    this.messageService.add({ severity: 'success', summary: 'Approved', detail: 'Evidence approved' })
    this.loadEvidence()
  }

  // Manual evidence
  createEvidence(): void {
    this.evidenceForm = { project_id: this.selectedApp, type: 'manual', source: 'manual', artifact_data: '{}' }
    this.evidenceDialogVisible = true
  }

  async saveEvidence(): Promise<any> {
    let artifact
    try {
      artifact = JSON.parse(this.evidenceForm.artifact_data)
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid artifact JSON' })
      return
    }
    await this.dashboardService.createEvidence(this.selectedOrg, {
      ...this.evidenceForm,
      artifact_data: artifact,
    })
    this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Evidence created' })
    this.evidenceDialogVisible = false
    this.loadEvidence()
  }

  getStatusSeverity(s: string): string {
    switch (s) {
      case 'approved': return 'success'
      case 'reviewed': return 'info'
      case 'collected': return 'warn'
      case 'expired': return 'danger'
      default: return 'secondary'
    }
  }

  getTypeSeverity(t: string): string {
    switch (t) {
      case 'automated': return 'info'
      case 'manual': return 'warn'
      case 'assessment': return 'success'
      default: return 'secondary'
    }
  }
}
