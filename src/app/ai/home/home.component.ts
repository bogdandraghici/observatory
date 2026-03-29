import { Component, OnInit } from '@angular/core'
import { OrgService } from '../services/orgs.service'
import { AppService } from '../services/apps.service'
import { processDuration } from '../utils/time'
import { MessageService } from 'primeng/api'
import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'
import { QueueService } from '../services/queues.service'
import { DatasetService } from '../services/datasets.service'
import { Clipboard } from '@angular/cdk/clipboard'
import { Meta, Title } from '@angular/platform-browser'

@Component({
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false
})
export class HomeComponent implements OnInit {
  apps: any[] = []
  selectedApp: any

  orgs: any[] = []
  selectedOrg: any

  workspaces: any[] = []
  selectedWorkspace: any = null

  datasets: any[] = []
  annotations: any[] = []

  newOrganizationName = ''
  newProjectName = ''
  newDatasetName = ''
  newQueueName = ''

  visibleOrganization = false
  visibleProject = false
  visibleDataset = false
  visibleQueue = false

  isSaaSMode = false

  constructor(
    private orgService: OrgService,
    private appService: AppService,
    private queueService: QueueService,
    private datasetService: DatasetService,
    private metaService: Meta,
    private titleService: Title,
    private messageService: MessageService,
    public layoutService: LayoutService,
    private clipboard: Clipboard
  ) {}

  ngOnInit(): void {
    this.checkSaaSMode()
    this.populateApps()
    this.titleService.setTitle('FlowX.AI Observatory - Home')
    this.metaService.updateTag({
      name: 'description',
      content: 'The ultimate LLM observatory for AI Agents.',
    })
  }

  checkSaaSMode(): void {
    this.orgService.getOrgsWithApps()
      .then(orgs => {
        // If we successfully got orgs, we can check the API
        fetch('/api/v1/observatory/info')
          .then(res => res.json())
          .then(data => {
            this.isSaaSMode = data.saas_env || false
          })
          .catch(() => {
            this.isSaaSMode = false
          })
      })
      .catch(() => {
        this.isSaaSMode = false
      })
  }

  populateApps(): void {
    this.orgService.getOrgsWithApps().then(async (data) => {
      this.orgs = data
      if (!this.orgs || this.orgs.length === 0) {return}

      const { org, workspace, app_id } = this.getDefaultAppOrg(this.orgs)
      if (!org) {return}

      this.selectedOrg = org.id
      this.workspaces = this.getWorkspaces(org.id)
      this.selectedWorkspace = workspace?.id || null

      const appsStats = await this.appService.getAppStats(org.id)

      this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
        .sort((a: any, b: any) => b.is_default - a.is_default)

      this.datasets = (org.datasets || []).filter(
        (dataset: any) => dataset.is_active === true
      )

      this.apps.forEach((app) => {
        const stats = appsStats?.find((s: any) => s.project_id === app.id)
        if (stats) {
          app.stats = { ...stats }
        }
      })

      this.selectedApp = app_id
    })
  }

  getAPIKeys(org_id: string): any {
    if (!org_id || !Array.isArray(this.orgs)) {
      return []
    }
    return this.orgs.find((item) => item.id === org_id)?.api_keys || []
  }

  getWorkspaces(org_id: string): any[] {
    const org = this.orgs?.find((item) => item.id === org_id)
    return org?.workspaces || []
  }

  getAppsFromWorkspace(org: any, workspace_id: any): any[] {
    if (workspace_id) {
      const ws = org?.workspaces?.find((w: any) => w.id === workspace_id)
      return (ws?.projects || []).filter((app: any) => app.is_active === true)
    }
    return (org?.projects || []).filter((app: any) => app.is_active === true)
  }

  getApps(org_id: string): any {
    return (
      this.orgs
        ?.find((item) => item.id === org_id)
        ?.projects?.filter((app: any) => app.is_active === true) || []
    )
  }

  getDatasets(org_id: string): any {
    return (
      this.orgs
        ?.find((item) => item.id === org_id)
        ?.datasets?.filter((dataset: any) => dataset.is_active === true) || []
    )
  }

  orgChanged(event: any): void {
    this.workspaces = this.getWorkspaces(event.value)
    this.selectedWorkspace = this.workspaces?.[0]?.id || null

    const org = this.orgs?.find((item) => item.id === event.value)
    this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
    this.datasets = this.getDatasets(event.value)
    this.selectedApp = this.apps[0]?.id

    // Reload stats for the new org
    this.appService.getAppStats(event.value).then((appsStats) => {
      this.apps.forEach((app) => {
        const stats = appsStats?.find((s: any) => s.project_id === app.id)
        if (stats) {
          app.stats = { ...stats }
        }
      })
    })
  }

  workspaceChanged(event: any): void {
    const org = this.orgs?.find((item) => item.id === this.selectedOrg)
    this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
      .sort((a: any, b: any) => b.is_default - a.is_default)
    this.selectedApp = this.apps?.[0]?.id

    // Reload stats
    this.appService.getAppStats(this.selectedOrg).then((appsStats) => {
      this.apps.forEach((app) => {
        const stats = appsStats?.find((s: any) => s.project_id === app.id)
        if (stats) {
          app.stats = { ...stats }
        }
      })
    })
  }

  getDefaultAppOrg(orgs: any[]): any {
    let default_app = null
    let parent_org = null
    let parent_workspace = null

    // Search within workspaces first
    orgs.forEach((org) => {
      org.workspaces?.forEach((ws: any) => {
        ws.projects?.forEach((app: any) => {
          if (app.is_default) {
            default_app = app.id
            parent_org = org
            parent_workspace = ws
          }
        })
      })
    })

    // Fallback to org.projects
    if (!parent_org && !default_app) {
      orgs.forEach((org) => {
        org.projects?.forEach((app: any) => {
          if (app.is_default) {
            default_app = app.id
            parent_org = org
          }
        })
      })
    }

    // Fallback to first org/workspace/project
    if (!parent_org && !default_app) {
      parent_org = orgs[0]
      if (parent_org?.workspaces?.length > 0) {
        parent_workspace = parent_org.workspaces[0]
        default_app = parent_workspace?.projects?.[0]?.id
      } else {
        default_app = parent_org?.projects?.[0]?.id
      }
    }

    return { org: parent_org, workspace: parent_workspace, app_id: default_app }
  }

  // Aggregate stats methods
  getTotalRuns(): number {
    if (!this.apps || this.apps.length === 0) {return 0}
    return this.apps.reduce((total, app) => total + (app.stats?.run_cnt || 0), 0)
  }

  getAvgLatency(): string {
    if (!this.apps || this.apps.length === 0) {return '0'}
    const appsWithLatency = this.apps.filter(
      (app) => app.stats?.p50_latency != null
    )
    if (appsWithLatency.length === 0) {return '0'}

    const totalLatency = appsWithLatency.reduce((total, app) => total + (processDuration(app.stats.p50_latency) || 0), 0)

    return (totalLatency / appsWithLatency.length).toFixed(2)
  }

  reloadAll(_____event: any): void {
    this.populateApps()
  }

  // Organization CRUD
  async saveOrganization(): Promise<void> {
    if (!this.newOrganizationName.trim()) {return}

    const new_organization = await this.orgService.createOrg(
      this.newOrganizationName
    )
    if (new_organization) {
      this.messageService.clear()
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Organization successfully created!',
      })
      this.populateApps()
      this.visibleOrganization = false
      this.newOrganizationName = ''
    }
  }

  showDialogOrganization(): void {
    this.newOrganizationName = ''
    this.visibleOrganization = true
  }

  closeDialogOrganization(): void {
    this.visibleOrganization = false
  }

  // Project CRUD
  showDialogProject(): void {
    this.newProjectName = ''
    this.visibleProject = true
  }

  closeDialogProject(): void {
    this.visibleProject = false
  }

  async saveProject(): Promise<void> {
    if (!this.newProjectName.trim()) {return}

    const new_project = await this.appService.createApp(
      this.newProjectName,
      this.selectedOrg
    )
    if (new_project) {
      this.messageService.clear()
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Project successfully created!',
      })
      this.populateApps()
      this.visibleProject = false
      this.newProjectName = ''
    }
  }

  // Dataset CRUD
  showDialogDataset(): void {
    this.newDatasetName = ''
    this.visibleDataset = true
  }

  closeDialogDataset(): void {
    this.visibleDataset = false
  }

  async saveDataset(): Promise<void> {
    if (!this.newDatasetName.trim()) {return}

    const new_dataset = await this.datasetService.createDataset(
      this.newDatasetName,
      this.selectedOrg
    )
    if (new_dataset) {
      this.messageService.clear()
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Dataset successfully created!',
      })
      this.populateApps()
      this.visibleDataset = false
      this.newDatasetName = ''
    }
  }

  // Queue CRUD
  showDialogQueue(): void {
    this.newQueueName = ''
    this.visibleQueue = true
  }

  closeDialogQueue(): void {
    this.visibleQueue = false
  }

  async saveQueue(): Promise<void> {
    if (!this.newQueueName.trim()) {return}

    const new_queue = await this.queueService.createQueue(
      this.newQueueName,
      this.selectedOrg
    )
    if (new_queue) {
      this.messageService.clear()
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Queue successfully created!',
      })
      this.populateApps()
      this.visibleQueue = false
      this.newQueueName = ''
    }
  }

  // Clipboard
  public copyToClipboard(event: any, value: string): void {
    const successful = this.clipboard.copy(value)
    if (successful) {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied',
        detail: 'API key copied to clipboard',
        life: 3000,
      })
    }
  }
}
