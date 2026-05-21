import { ChangeDetectorRef, Component, OnInit } from '@angular/core'

import { OrgService } from '../services/orgs.service'
import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'
import { AppService } from '../services/apps.service'
import { MessageService } from 'primeng/api'
import { Clipboard } from '@angular/cdk/clipboard'
import { Meta, Title } from '@angular/platform-browser'

interface _Column {
  field: string
  header: string
}

@Component({
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss',
    providers: [MessageService],
    standalone: false
})
export class SettingsComponent implements OnInit {
  periods: any[]
  selectedPeriod: any

  apps: any[]
  selectedApp: any

  orgs: any[]
  selectedOrg: any

  workspaces: any[]
  selectedWorkspace: any

  currentApp: any

  constructor(
    private orgService: OrgService,
    private appService: AppService,
    private cd: ChangeDetectorRef,
    public layoutService: LayoutService,
    private messageService: MessageService,
    private clipboard: Clipboard,
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
    this.titleService.setTitle('FlowX.AI Observatory - Settings')
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
      this.selectedWorkspace = workspace?.id
      this.apps = this.getAppsFromWorkspace(org, workspace?.id)
        ?.sort((a, b) => b.is_default - a.is_default)
      this.selectedApp = app?.id
      this.currentApp = this.apps?.find((item) => item.id === app?.id)
      if (!this.currentApp?.settings) {
        if (this.currentApp) {
          this.currentApp.settings = {
            period: 168,
          }
        }
      }
    })
  }

  getWorkspaces(org_id: any): any[] {
    const org = this.orgs?.find((item) => item.id === org_id)
    return org?.workspaces || []
  }

  getAppsFromWorkspace(org: any, workspace_id: any): any[] {
    if (workspace_id) {
      const ws = org?.workspaces?.find((item) => item.id === workspace_id)
      return ws?.projects?.filter((app) => app.is_active === true) || []
    }
    return org?.projects?.filter((app) => app.is_active === true) || []
  }

  orgChanged(event: any): void {
    const org = this.orgs?.find((item) => item.id === event.value)
    this.workspaces = this.getWorkspaces(event.value)
    this.selectedWorkspace = this.workspaces?.[0]?.id
    this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
    this.currentApp = this.apps?.[0]
    if (!this.currentApp?.settings) {
      if (this.currentApp) {
        this.currentApp.settings = {
          period: 168,
        }
      }
    }
    this.selectedApp = this.apps?.[0]?.id
  }

  workspaceChanged(event: any): void {
    const org = this.orgs?.find((item) => item.id === this.selectedOrg)
    this.apps = this.getAppsFromWorkspace(org, event.value)
    this.currentApp = this.apps?.[0]
    if (!this.currentApp?.settings) {
      if (this.currentApp) {
        this.currentApp.settings = {
          period: 168,
        }
      }
    }
    this.selectedApp = this.apps?.[0]?.id
  }

  appChanged(_____event: any): void {
    this.currentApp = this.apps?.find((item) => item.id === this.selectedApp)
    if (!this.currentApp?.settings) {
      if (this.currentApp) {
        this.currentApp.settings = {
          period: 168,
        }
      }
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
          if (app.is_default) {
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
          if (app.is_default) {
            default_app = app
            parent_org = org
          }
        })
      })
    }
    // Fallback to first available
    if (!default_app && sortedOrgs?.length > 0) {
      parent_org = sortedOrgs[0]
      if (parent_org?.workspaces?.length > 0) {
        parent_workspace = parent_org.workspaces[0]
        default_app = parent_workspace?.projects?.[0]
      } else {
        default_app = parent_org?.projects?.[0]
      }
    }
    return { org: parent_org, workspace: parent_workspace, app: default_app }
  }

  async updateAppSettings(): Promise<any> {
    const updatedApp = await this.appService.updateApp(this.currentApp)
    if (updatedApp) {

      this.messageService.clear()
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Project successfully updated!',
      })
    }
  }
  public copyToClipboard(_____event: any): void {
    const successful = this.clipboard.copy(this.currentApp.id)
    if (successful) {
      this.messageService.add({
        severity: 'info',
        summary: 'Clipboard',
        detail: 'You have copied the id to clipboard',
        life: 3000,
      })
    }
}

}
