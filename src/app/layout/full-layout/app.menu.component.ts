import { Input, OnInit } from '@angular/core'
import { Component } from '@angular/core'
import { LayoutService } from './service/app.layout.service'
import { OAuthService } from 'angular-oauth2-oidc'
import { parseJwt } from '../../landing/utils/utils'

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html',
    standalone: false
})
export class AppMenuComponent implements OnInit {
  @Input() section!: any
  model: any[] = []

  userProfile: any

  constructor(
    public layoutService: LayoutService,
    private oauthService: OAuthService,
  ) {}

  ngOnInit(): void {
    const jwt = this.oauthService.authorizationHeader().split('Bearer ')[1]
    this.userProfile = parseJwt<any>(jwt)

      this.model = [
        {
          label: 'Governance',
          icon: 'pi pi-fw pi-verified',
          routerLink: ['/ai'],
          items: [
            {
              label: 'AI Registry',
              icon: 'pi pi-fw pi-book',
              routerLink: ['/ai/registry'],
            },
            {
              label: 'Risk Dashboard',
              icon: 'pi pi-fw pi-exclamation-triangle',
              routerLink: ['/ai/risk'],
            },
            {
              label: 'ROI Dashboard',
              icon: 'pi pi-fw pi-dollar',
              routerLink: ['/ai/roi'],
            },
            {
              label: 'Insights Dashboard',
              icon: 'pi pi-fw pi-chart-line',
              routerLink: ['/ai/insights'],
            },
            {
              label: 'Alerts',
              icon: 'pi pi-fw pi-bell',
              routerLink: ['/ai/alerts'],
            },
            {
              label: 'Drift Monitor',
              icon: 'pi pi-fw pi-arrows-h',
              routerLink: ['/ai/drift'],
            },
            {
              label: 'Policies',
              icon: 'pi pi-fw pi-file-check',
              routerLink: ['/ai/policies'],
            },
            {
              label: 'Evidence',
              icon: 'pi pi-fw pi-folder',
              routerLink: ['/ai/evidence'],
            },
            {
              label: 'Assessments',
              icon: 'pi pi-fw pi-list-check',
              routerLink: ['/ai/assessments'],
            },
            {
              label: 'Compliance',
              icon: 'pi pi-fw pi-check-square',
              routerLink: ['/ai/regulatory'],
            },
            {
              label: 'Experiments',
              icon: 'pi pi-fw pi-chart-bar',
              routerLink: ['/ai/experiments'],
            },

          ],
        },
        {
          label: 'Platform',
          icon: 'pi pi-fw pi-server',
          routerLink: ['/ai'],
          items: [
            {
              label: 'Deployment Overview',
              icon: 'pi pi-fw pi-objects-column',
              routerLink: ['/ai/platform'],
            },
          ],
        },
        {
          label: 'Observability',
          icon: 'pi pi-fw pi-compass',
          routerLink: ['/ai'],
          items: [
            { label: 'Home', icon: 'pi pi-fw pi-home', routerLink: ['/ai'] },
            {
              label: 'Dashboard',
              icon: 'pi pi-fw pi-chart-bar',
              routerLink: ['/ai/dashboard'],
            },
            {
              label: 'API Calls',
              icon: 'pi pi-fw pi-chart-pie',
              routerLink: ['/ai/analytics'],
            },
            {
              label: 'LLM Calls',
              icon: 'pi pi-fw pi-box',
              routerLink: ['/ai/llm-calls'],
            },
            {
              label: 'Traces',
              icon: 'pi pi-fw pi-forward',
              routerLink: ['/ai/traces'],
            },
            {
              label: 'Agent Executions',
              icon: 'pi pi-fw pi-play',
              routerLink: ['/ai/executions'],
            },
            {
              label: 'Developer Agents',
              icon: 'pi pi-fw pi-code',
              routerLink: ['/ai/developer-executions'],
            },
            {
              label: 'Users',
              icon: 'pi pi-fw pi-users',
              routerLink: ['/ai/users'],
            },
          ],
        },
        {
          label: 'Management',
          icon: 'pi pi-fw pi-box',
          routerLink: ['/ai'],
          items: [
            {
              label: 'Prompts',
              icon: 'pi pi-fw pi-file-word',
              routerLink: ['/ai/prompts'],
            },
            {
              label: 'Datasets',
              icon: 'pi pi-fw pi-database',
              routerLink: ['/ai/datasets'],
            },
            {
              label: 'Settings',
              icon: 'pi pi-fw pi-cog',
              routerLink: ['/ai/settings'],
            },
            {
              label: 'Audit Trail',
              icon: 'pi pi-fw pi-history',
              routerLink: ['/ai/audit'],
            },
            {
              label: 'Access Control',
              icon: 'pi pi-fw pi-shield',
              routerLink: ['/ai/access'],
            },
            {
              label: 'Webhooks',
              icon: 'pi pi-fw pi-bell',
              routerLink: ['/ai/webhooks'],
            },
          ],
        }

      ]

  }
}
