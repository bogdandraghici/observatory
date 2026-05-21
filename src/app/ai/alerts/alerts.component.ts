import { Component, OnInit } from '@angular/core'
import { DashboardService } from '../services/dashboard.service'
import { OrgService } from '../services/orgs.service'
import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'
import { Meta, Title } from '@angular/platform-browser'
import { MessageService } from 'primeng/api'
import { resolveDefaultAppOrg } from '../utils/default-app'

@Component({
    templateUrl: './alerts.component.html',
    standalone: false,
    providers: [MessageService],
})
export class AlertsComponent implements OnInit {
  orgs: any[] = []
  selectedOrg: any
  workspaces: any[] = []
  selectedWorkspace: any
  apps: any[] = []
  selectedApp: any = null
  hours = 24

  periodOptions = [
    { label: 'Last 24h', value: 24 },
    { label: 'Last 7d', value: 168 },
    { label: 'Last 30d', value: 720 },
    { label: 'Last 6m', value: 4320 },
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
  ]

  severityOptions = [
    { label: 'Info', value: 'info' },
    { label: 'Warning', value: 'warning' },
    { label: 'Critical', value: 'critical' },
  ]

  // Data
  rules: any[] = []
  history: any[] = []
  slaStatus: any[] = []

  // KPIs
  activeRules = 0
  alertsToday = 0
  unacknowledged = 0
  criticalCount = 0

  // Rule Dialog
  ruleDialogVisible = false
  editingRule = false
  ruleForm: any = {}

  // Confirm dialog
  deleteDialogVisible = false
  ruleToDelete: any = null

  constructor(
    private dashboardService: DashboardService,
    private orgService: OrgService,
    public layoutService: LayoutService,
    private metaService: Meta,
    private titleService: Title,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('FlowX.AI Observatory - Alerts')
    this.metaService.updateTag({ name: 'description', content: 'Alert rules and threshold monitoring.' })
    this.populateOrgs()
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
        this.loadAll()
        if (this.selectedApp) {this.loadSla()}
      }
    })
  }

  orgChanged(): void {
    const org = this.orgs.find((o: any) => o.id === this.selectedOrg)
    this.workspaces = this.getWorkspaces(this.selectedOrg)
    this.selectedWorkspace = this.workspaces.length > 0 ? this.workspaces[0].id : null
    this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
    this.selectedApp = this.apps.length > 0 ? this.apps[0].id : null
    this.slaStatus = []
    this.loadAll()
    if (this.selectedApp) {this.loadSla()}
  }

  workspaceChanged(event: any): void {
    const org = this.orgs.find((o: any) => o.id === this.selectedOrg)
    this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
    this.selectedApp = this.apps.length > 0 ? this.apps[0].id : null
    this.slaStatus = []
    this.loadAll()
    if (this.selectedApp) {this.loadSla()}
  }

  appChanged(): void {
    this.loadHistory()
    if (this.selectedApp) {
      this.loadSla()
    } else {
      this.slaStatus = []
    }
  }

  periodChanged(): void { this.loadHistory() }

  async loadAll(): Promise<any> {
    if (!this.selectedOrg) {return}
    await Promise.all([this.loadRules(), this.loadHistory()])
    this.computeKPIs()
  }

  async loadRules(): Promise<any> {
    this.rules = await this.dashboardService.getAlertRules(this.selectedOrg) || []
  }

  async loadHistory(): Promise<any> {
    const query: any = { org_id: this.selectedOrg, hours: this.hours }
    if (this.selectedApp) {query.project_id = this.selectedApp}
    this.history = await this.dashboardService.getAlertHistory(query) || []
    this.computeKPIs()
  }

  async loadSla(): Promise<any> {
    if (!this.selectedApp || !this.selectedOrg) {return}
    this.slaStatus = await this.dashboardService.getSlaStatus(this.selectedApp, this.selectedOrg) || []
  }

  computeKPIs(): void {
    this.activeRules = this.rules.filter((r: any) => r.is_active).length
    this.alertsToday = this.history.length
    this.unacknowledged = this.history.filter((e: any) => e.status === 'fired').length
    this.criticalCount = this.history.filter((e: any) => e.severity === 'critical').length
  }

  // CRUD
  createRule(): void {
    this.editingRule = false
    this.ruleForm = {
      name: '',
      project_id: null,
      metric: 'latency_p95',
      operator: 'gt',
      threshold: 1000,
      window_minutes: 60,
      cooldown_minutes: 60,
      severity: 'warning',
    }
    this.ruleDialogVisible = true
  }

  editRule(rule: any): void {
    this.editingRule = true
    this.ruleForm = { ...rule }
    this.ruleDialogVisible = true
  }

  async saveRule(): Promise<any> {
    if (this.editingRule) {
      await this.dashboardService.updateAlertRule(this.selectedOrg, this.ruleForm.id, this.ruleForm)
      this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Alert rule updated' })
    } else {
      await this.dashboardService.createAlertRule(this.selectedOrg, this.ruleForm)
      this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Alert rule created' })
    }
    this.ruleDialogVisible = false
    this.loadRules()
  }

  confirmDelete(rule: any): void {
    this.ruleToDelete = rule
    this.deleteDialogVisible = true
  }

  async deleteRule(): Promise<any> {
    if (!this.ruleToDelete) {return}
    await this.dashboardService.deleteAlertRule(this.selectedOrg, this.ruleToDelete.id)
    this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Alert rule deleted' })
    this.deleteDialogVisible = false
    this.ruleToDelete = null
    this.loadRules()
  }

  async toggleActive(rule: any): Promise<any> {
    await this.dashboardService.updateAlertRule(this.selectedOrg, rule.id, { is_active: rule.is_active })
  }

  // Actions
  async evaluateNow(): Promise<any> {
    const events = await this.dashboardService.evaluateAlerts(this.selectedOrg)
    const count = events?.length || 0
    this.messageService.add({
      severity: count > 0 ? 'warn' : 'success',
      summary: 'Evaluated',
      detail: `${count} alert(s) fired`,
    })
    this.loadHistory()
  }

  async acknowledgeAlert(event: any): Promise<any> {
    await this.dashboardService.acknowledgeAlert(event.id)
    this.messageService.add({ severity: 'info', summary: 'Acknowledged', detail: 'Alert acknowledged' })
    this.loadHistory()
  }

  async resolveAlert(event: any): Promise<any> {
    await this.dashboardService.resolveAlert(event.id)
    this.messageService.add({ severity: 'success', summary: 'Resolved', detail: 'Alert resolved' })
    this.loadHistory()
  }

  // Helpers
  getSeverity(severity: string): string {
    switch (severity) {
      case 'critical': return 'danger'
      case 'warning': return 'warn'
      case 'info': return 'info'
      default: return 'secondary'
    }
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'fired': return 'danger'
      case 'acknowledged': return 'warn'
      case 'resolved': return 'success'
      default: return 'secondary'
    }
  }

  getMetricLabel(metric: string): string {
    return this.metricOptions.find(m => m.value === metric)?.label || metric
  }

  getOperatorLabel(operator: string): string {
    return this.operatorOptions.find(o => o.value === operator)?.label || operator
  }
}
