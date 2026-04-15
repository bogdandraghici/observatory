import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Meta, Title } from '@angular/platform-browser'
import { OrgService } from '../services/orgs.service'
import { AppService } from '../services/apps.service'
import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'
import { formatTime, processDuration } from '../utils/time'

@Component({
  templateUrl: './projects.component.html',
  standalone: false,
})
export class ProjectsComponent implements OnInit {
  orgs: any[] = []
  selectedOrg: any
  workspaces: any[] = []
  selectedWorkspace: any = null
  apps: any[] = []

  formatTime = formatTime
  processDuration = processDuration

  constructor(
    private orgService: OrgService,
    private appService: AppService,
    public layoutService: LayoutService,
    private router: Router,
    private metaService: Meta,
    private titleService: Title,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('FlowX.AI Observatory - Projects')
    this.metaService.updateTag({ name: 'description', content: 'Browse and manage your AI projects.' })
    this.populateApps()
  }

  populateApps(): void {
    this.orgService.getOrgsWithApps().then((data) => {
      this.orgs = data
      const { org, workspace } = this.getDefaultAppOrg(this.orgs)
      if (org) {
        this.selectedOrg = org.id
        this.workspaces = this.getWorkspaces(org.id)
        this.selectedWorkspace = workspace?.id || null
        this.loadApps()
      }
    })
  }

  getWorkspaces(org_id: any): any[] {
    const org = this.orgs?.find((item) => item.id === org_id)
    return org?.workspaces || []
  }

  getAppsFromWorkspace(org: any, workspace_id: any): any[] {
    if (workspace_id) {
      const ws = (org.workspaces || []).find((w: any) => w.id === workspace_id)
      return (ws?.projects || []).filter((app: any) => app.is_active === true)
    }
    return (org?.projects || []).filter((app: any) => app.is_active === true)
  }

  getDefaultAppOrg(orgs: any): any {
    const sortedOrgs = [...orgs].sort((a, b) => {
      if (a.name === 'Default') return 1
      if (b.name === 'Default') return -1
      return 0
    })
    for (const org of sortedOrgs) {
      if (org.workspaces?.length) {
        for (const ws of org.workspaces) {
          const active = (ws.projects || []).filter((p: any) => p.is_active)
          if (active.length > 0) return { org, workspace: ws, app: active[0] }
        }
      }
    }
    return { org: sortedOrgs[0], workspace: sortedOrgs[0]?.workspaces?.[0] || null, app: null }
  }

  async loadApps(): Promise<void> {
    const org = this.orgs?.find((item) => item.id === this.selectedOrg)
    this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
    // Load stats for each project
    if (this.selectedOrg) {
      try {
        const stats = await this.appService.getAppStats(this.selectedOrg)
        if (Array.isArray(stats)) {
          for (const app of this.apps) {
            app.stats = stats.find((s: any) => s.project_id === app.id) || null
          }
        }
      } catch {}
    }
  }

  orgChanged(event: any): void {
    this.workspaces = this.getWorkspaces(event.value)
    this.selectedWorkspace = this.workspaces[0]?.id || null
    this.loadApps()
  }

  workspaceChanged(event: any): void {
    this.loadApps()
  }

  openProject(app: any): void {
    this.router.navigate(['/ai/projects', app.id])
  }

  getLatency(val: number): string {
    if (val > 8) return 'danger'
    if (val > 4) return 'warn'
    return 'success'
  }
}
