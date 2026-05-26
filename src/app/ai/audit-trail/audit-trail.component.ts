import { Component, OnInit } from '@angular/core'
import { DashboardService } from '../services/dashboard.service'
import { OrgService } from '../services/orgs.service'
import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'
import { Meta, Title } from '@angular/platform-browser'
import { resolveDefaultAppOrg } from '../utils/default-app'

@Component({
    templateUrl: './audit-trail.component.html',
    styleUrls: ['./audit-trail.component.scss'],
    standalone: false
})
export class AuditTrailComponent implements OnInit {
  orgs: any[]
  selectedOrg: any

  logs: any[] = []
  totalRecords = 0
  page = 1
  size = 50

  // Filters
  filterUser = ''
  filterAction = ''
  filterResourceType = ''

  // Detail dialog
  detailDialogVisible = false
  selectedLog: any = null

  resourceTypes = [
    { label: 'All', value: '' },
    { label: 'Project', value: 'app' },
    { label: 'Org', value: 'org' },
    { label: 'Prompt', value: 'prompt' },
    { label: 'Dataset', value: 'dataset' },
    { label: 'Experiment', value: 'experiment' },
    { label: 'Role', value: 'role' },
    { label: 'Member', value: 'member' },
    { label: 'Webhook', value: 'webhook' },
  ]

  constructor(
    private dashboardService: DashboardService,
    private orgService: OrgService,
    public layoutService: LayoutService,
    private metaService: Meta,
    private titleService: Title,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('FlowX.AI Observatory - Audit Trail')
    this.metaService.updateTag({
      name: 'description',
      content: 'Audit trail for AI Observatory.',
    })
    this.populateOrgs()
  }

  populateOrgs(): void {
    this.orgService.getOrgsWithApps().then((data) => {
      this.orgs = data
      if (this.orgs?.length > 0) {
        const { org } = resolveDefaultAppOrg(this.orgs)
        this.selectedOrg = org?.id || this.orgs[0]?.id
        this.loadLogs()
      }
    })
  }

  orgChanged(_____event: any): void {
    this.page = 1
    this.loadLogs()
  }

  async loadLogs(): Promise<any> {
    if (!this.selectedOrg) {return}
    const query: any = { page: this.page, size: this.size }
    if (this.filterUser) {query.user_id = this.filterUser}
    if (this.filterAction) {query.action = this.filterAction}
    if (this.filterResourceType) {query.resource_type = this.filterResourceType}

    const result = await this.dashboardService.getAuditLogs(this.selectedOrg, query)
    if (result) {
      this.logs = result.items || []
      this.totalRecords = result.total || 0
    }
  }

  onPageChange(event: any): void {
    this.page = Math.floor(event.first / event.rows) + 1
    this.size = event.rows
    this.loadLogs()
  }

  applyFilters(): void {
    this.page = 1
    this.loadLogs()
  }

  showDetails(log: any): void {
    this.selectedLog = log
    this.detailDialogVisible = true
  }

  getActionTone(action: string): string {
    if (action?.includes('deleted')) {return 'danger'}
    if (action?.includes('created')) {return 'success'}
    if (action?.includes('updated')) {return 'info'}
    return 'neutral'
  }
}
