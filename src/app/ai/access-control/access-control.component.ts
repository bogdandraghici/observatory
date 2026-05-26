import { Component, OnInit } from '@angular/core'
import { DashboardService } from '../services/dashboard.service'
import { OrgService } from '../services/orgs.service'
import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'
import { MessageService } from 'primeng/api'
import { Meta, Title } from '@angular/platform-browser'
import { resolveDefaultAppOrg } from '../utils/default-app'

@Component({
    templateUrl: './access-control.component.html',
    styleUrls: ['./access-control.component.scss'],
    providers: [MessageService],
    standalone: false
})
export class AccessControlComponent implements OnInit {
  orgs: any[]
  selectedOrg: any

  // Members
  members: any[] = []
  roles: any[] = []

  // Invite dialog
  inviteDialogVisible = false
  newMember: any = { user_id: '', user_email: '', role_id: null }

  // Roles
  roleDialogVisible = false
  editingRole: any = null
  newRole: any = { name: '', permissions: [] }

  allPermissions: string[] = [
    'app.read', 'app.write', 'app.delete',
    'prompt.read', 'prompt.write', 'prompt.delete',
    'dataset.read', 'dataset.write', 'dataset.delete',
    'eval.read', 'eval.write',
    'audit.read',
    'settings.write',
    'member.read', 'member.write',
    'webhook.read', 'webhook.write',
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
    this.titleService.setTitle('FlowX.AI Observatory - Access Control')
    this.metaService.updateTag({
      name: 'description',
      content: 'Access control for AI Observatory.',
    })
    this.populateOrgs()
  }

  populateOrgs(): void {
    this.orgService.getOrgsWithApps().then((data) => {
      this.orgs = data
      if (this.orgs?.length > 0) {
        const { org } = resolveDefaultAppOrg(this.orgs)
        this.selectedOrg = org?.id || this.orgs[0]?.id
        this.loadData()
      }
    })
  }

  orgChanged(_____event: any): void {
    this.loadData()
  }

  async loadData(): Promise<any> {
    if (!this.selectedOrg) {return}
    const [members, roles] = await Promise.all([
      this.dashboardService.getMembers(this.selectedOrg),
      this.dashboardService.getRoles(this.selectedOrg),
    ])
    this.members = members || []
    this.roles = roles || []
  }

  // ── Members ─────────────────────────────────────────

  showInviteDialog(): void {
    this.newMember = { user_id: '', user_email: '', role_id: null }
    this.inviteDialogVisible = true
  }

  async inviteMember(): Promise<any> {
    if (!this.newMember.user_id || !this.newMember.role_id) {return}
    await this.dashboardService.addMember(this.selectedOrg, this.newMember)
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Member added' })
    this.inviteDialogVisible = false
    this.loadData()
  }

  async changeMemberRole(member: any, role_id: string): Promise<any> {
    await this.dashboardService.updateMember(this.selectedOrg, member.id, { role_id })
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role updated' })
    this.loadData()
  }

  async removeMember(member: any): Promise<any> {
    await this.dashboardService.removeMember(this.selectedOrg, member.id)
    this.messageService.add({ severity: 'info', summary: 'Removed', detail: 'Member removed' })
    this.loadData()
  }

  getRoleName(role_id: string): string {
    return this.roles.find((r) => r.id === role_id)?.name || 'Unknown'
  }

  // ── Roles ───────────────────────────────────────────

  showCreateRole(): void {
    this.editingRole = null
    this.newRole = { name: '', permissions: [] }
    this.roleDialogVisible = true
  }

  editRole(role: any): void {
    this.editingRole = role
    this.newRole = { name: role.name, permissions: [...(role.permissions || [])] }
    this.roleDialogVisible = true
  }

  togglePermission(perm: string): void {
    const idx = this.newRole.permissions.indexOf(perm)
    if (idx >= 0) {
      this.newRole.permissions.splice(idx, 1)
    } else {
      this.newRole.permissions.push(perm)
    }
  }

  hasPermission(perm: string): boolean {
    return this.newRole.permissions.includes(perm)
  }

  async saveRole(): Promise<any> {
    if (!this.newRole.name) {return}
    if (this.editingRole) {
      await this.dashboardService.updateRole(this.selectedOrg, this.editingRole.id, this.newRole)
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role updated' })
    } else {
      await this.dashboardService.createRole(this.selectedOrg, this.newRole)
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role created' })
    }
    this.roleDialogVisible = false
    this.loadData()
  }

  async deleteRole(role: any): Promise<any> {
    await this.dashboardService.deleteRole(this.selectedOrg, role.id)
    this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Role deleted' })
    this.loadData()
  }
}
