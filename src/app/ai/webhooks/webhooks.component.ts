import { Component, OnInit } from '@angular/core'
import { DashboardService } from '../services/dashboard.service'
import { OrgService } from '../services/orgs.service'
import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'
import { MessageService } from 'primeng/api'
import { Meta, Title } from '@angular/platform-browser'
import { resolveDefaultAppOrg } from '../utils/default-app'

@Component({
    templateUrl: './webhooks.component.html',
    providers: [MessageService],
    standalone: false
})
export class WebhooksComponent implements OnInit {
  orgs: any[]
  selectedOrg: any

  webhooks: any[] = []

  // Create/Edit dialog
  webhookDialogVisible = false
  editingWebhook: any = null
  webhookForm: any = { name: '', url: '', secret: '', webhook_type: 'slack', events: [], is_active: true }

  webhookTypes = [
    { label: 'Slack', value: 'slack' },
    { label: 'Microsoft Teams', value: 'teams' },
    { label: 'Generic (JSON)', value: 'generic' },
  ]

  // Delivery dialog
  deliveryDialogVisible = false
  deliveries: any[] = []
  deliveryWebhookName = ''

  availableEvents = [
    { label: 'Alert Triggered', value: 'alert.triggered' },
    { label: 'Alert Resolved', value: 'alert.resolved' },
    { label: 'Drift Detected', value: 'drift.detected' },
    { label: 'Policy Violated', value: 'policy.violated' },
    { label: 'Assessment Completed', value: 'assessment.completed' },
    { label: 'Evidence Approved', value: 'evidence.approved' },
    { label: 'Run Completed', value: 'run.completed' },
    { label: 'Run Error', value: 'run.error' },
  ]

  constructor(
    private dashboardService: DashboardService,
    private orgService: OrgService,
    public layoutService: LayoutService,
    private messageService: MessageService,
    private metaService: Meta,
    private titleService: Title,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('FlowX.AI Observatory - Webhooks')
    this.metaService.updateTag({
      name: 'description',
      content: 'Webhook management for AI Observatory.',
    })
    this.populateOrgs()
  }

  populateOrgs(): void {
    this.orgService.getOrgsWithApps().then((data) => {
      this.orgs = data
      if (this.orgs?.length > 0) {
        const { org } = resolveDefaultAppOrg(this.orgs)
        this.selectedOrg = org?.id || this.orgs[0]?.id
        this.loadWebhooks()
      }
    })
  }

  orgChanged(_____event: any): void {
    this.loadWebhooks()
  }

  async loadWebhooks(): Promise<any> {
    if (!this.selectedOrg) {return}
    this.webhooks = (await this.dashboardService.getWebhooks(this.selectedOrg)) || []
  }

  // ── Create/Edit ─────────────────────────────────────

  showCreateWebhook(): void {
    this.editingWebhook = null
    this.webhookForm = { name: '', url: '', secret: '', webhook_type: 'slack', events: [], is_active: true }
    this.webhookDialogVisible = true
  }

  editWebhook(hook: any): void {
    this.editingWebhook = hook
    this.webhookForm = {
      name: hook.name,
      url: hook.url,
      secret: hook.secret || '',
      webhook_type: hook.webhook_type || 'slack',
      events: [...(hook.events || [])],
      is_active: hook.is_active,
    }
    this.webhookDialogVisible = true
  }

  async saveWebhook(): Promise<any> {
    if (!this.webhookForm.name || !this.webhookForm.url) {return}
    if (this.editingWebhook) {
      await this.dashboardService.updateWebhook(this.selectedOrg, this.editingWebhook.id, this.webhookForm)
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Webhook updated' })
    } else {
      await this.dashboardService.createWebhook(this.selectedOrg, this.webhookForm)
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Webhook created' })
    }
    this.webhookDialogVisible = false
    this.loadWebhooks()
  }

  async deleteWebhook(hook: any): Promise<any> {
    await this.dashboardService.deleteWebhook(this.selectedOrg, hook.id)
    this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Webhook deleted' })
    this.loadWebhooks()
  }

  async testWebhook(hook: any): Promise<any> {
    const result = await this.dashboardService.testWebhook(this.selectedOrg, hook.id)
    if (result) {
      this.messageService.add({ severity: 'success', summary: 'Sent', detail: 'Test webhook dispatched' })
    }
  }

  // ── Deliveries ──────────────────────────────────────

  async showDeliveries(hook: any): Promise<any> {
    this.deliveryWebhookName = hook.name
    this.deliveries = (await this.dashboardService.getDeliveries(this.selectedOrg, hook.id)) || []
    this.deliveryDialogVisible = true
  }
}
