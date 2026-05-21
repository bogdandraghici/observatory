import { ChangeDetectorRef, Component, OnInit } from '@angular/core'

import { OrgService } from '../services/orgs.service'
import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'
import { MessageService } from 'primeng/api'
import { Meta, Title } from '@angular/platform-browser'
import { DatasetService } from '../services/datasets.service'

interface _Column {
  field: string
  header: string
}

@Component({
    templateUrl: './dataset.component.html',
    styleUrl: './dataset.component.scss',
    providers: [MessageService],
    standalone: false
})
export class DatasetComponent implements OnInit {
  periods: any[]
  selectedPeriod: any

  apps: any[]
  selectedApp: any

  orgs: any[]
  selectedOrg: any

  workspaces: any[]
  selectedWorkspace: any

  newDatasetName: any
  visibleDataset = false


  constructor(
    private orgService: OrgService,
    private cd: ChangeDetectorRef,
    public layoutService: LayoutService,
    private datasetService: DatasetService,
    private messageService: MessageService,
    private metaService: Meta,
    private titleService: Title,
  ) {}

  ngOnInit(): void {
    this.periods = [
      { name: 'Last Hour', value: 1 },
      { name: '3H', value: 3 },
      { name: '24H', value: 24 },
      { name: '7D', value: 168 },
      { name: '1M', value: 720 },
      { name: '6M', value: 4320 },
    ]
    this.selectedPeriod = 168
    this.titleService.setTitle('FlowX.AI Observatory - Datasets')
    this.metaService.updateTag({
      name: 'description',
      content:
        'The ultimate LLM observatory for AI Agents.',
    })
    this.populateApps()
  }


  populateApps(): void {
    this.orgService.getOrgsWithApps().then((data) => {
      this.orgs = data
      const { org, workspace, app } = this.getDefaultAppOrg(this.orgs)
      this.selectedOrg = org?.id
      this.workspaces = this.getWorkspaces(org?.id)
      this.selectedWorkspace = workspace?.id || null
      this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
      this.selectedApp = app?.id
      if (app?.settings) {
        this.selectedPeriod = app.settings?.period
      } else {
        this.selectedPeriod = 168
      }
    })
  }

  getWorkspaces(org_id: any): any[] {
    const org = this.orgs?.find((item) => item.id === org_id)
    return org?.workspaces || []
  }

  getAppsFromWorkspace(org: any, workspace_id: any): any[] {
    if (workspace_id) {
      const ws = org?.workspaces?.find((w) => w.id === workspace_id)
      return (ws?.projects || [])
        .filter((app) => app.is_active === true)
        .sort((a, b) => b.is_default - a.is_default)
    }
    return (org?.projects || [])
      .filter((app) => app.is_active === true)
      .sort((a, b) => b.is_default - a.is_default)
  }

  orgChanged(event: any): void {
    const org = this.orgs?.find((item) => item.id === event.value)
    this.workspaces = this.getWorkspaces(event.value)
    this.selectedWorkspace = this.workspaces?.[0]?.id || null
    this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
    this.selectedApp = this.apps?.[0]?.id
    if (this.apps?.[0]?.settings) {
      this.selectedPeriod = this.apps[0].settings?.period
    } else {
      this.selectedPeriod = 168
    }
  }

  workspaceChanged(event: any): void {
    const org = this.orgs?.find((item) => item.id === this.selectedOrg)
    this.apps = this.getAppsFromWorkspace(org, event.value)
    this.selectedApp = this.apps?.[0]?.id
    if (this.apps?.[0]?.settings) {
      this.selectedPeriod = this.apps[0].settings?.period
    } else {
      this.selectedPeriod = 168
    }
  }



    // DATASET
    showDialogDataset(): void {
      this.newDatasetName = ''
      this.visibleDataset = true
    }

    closeDialogDataset(): void {
      this.visibleDataset = false
    }

    async saveDataset(): Promise<any> {
      const new_dataset = await this.datasetService.createDataset(
        this.newDatasetName,
        this.selectedOrg,
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
      }
    }
  appChanged(event: any): void {
    const currentApp = this.apps?.find((item) => item.id === event.value)
    if (currentApp.settings) {
      this.selectedPeriod = currentApp.settings?.period
    } else {
      this.selectedPeriod = 168
    }
  }

  getDefaultAppOrg(orgs: any): any {
    // Prefer non-default orgs (auto-provisioned from platform)
    const sortedOrgs = [...(orgs || [])].sort((a, b) => {
      if (a.name === 'Default') return 1
      if (b.name === 'Default') return -1
      return 0
    })
    let default_app = null
    let parent_org = null
    let parent_workspace = null

    // Search in workspaces first
    sortedOrgs?.forEach((org) => {
      org?.workspaces?.forEach((ws) => {
        ws?.projects?.forEach((app) => {
          if (app.is_default && !default_app) {
            default_app = app
            parent_org = org
            parent_workspace = ws
          }
        })
      })
    })

    // Fallback to org.projects
    if (!default_app) {
      sortedOrgs?.forEach((org) => {
        org?.projects?.forEach((app) => {
          if (app.is_default && !default_app) {
            default_app = app
            parent_org = org
          }
        })
      })
    }

    // Fallback to first org/workspace/project
    if (!default_app && sortedOrgs?.length > 0) {
      parent_org = sortedOrgs[0]
      if (parent_org?.workspaces?.length > 0) {
        parent_workspace = parent_org.workspaces[0]
        if (parent_workspace?.projects?.length > 0) {
          default_app = parent_workspace.projects[0]
        }
      }
      if (!default_app && parent_org?.projects?.length > 0) {
        default_app = parent_org.projects[0]
      }
    }

    return { org: parent_org, workspace: parent_workspace, app: default_app }
  }

}
