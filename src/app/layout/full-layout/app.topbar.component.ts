import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core'
import { MenuItem } from 'primeng/api'
import { AppConfig, LayoutService } from './service/app.layout.service'
import { OAuthService } from 'angular-oauth2-oidc'
import { parseJwt } from '../../landing/utils/utils'
import { NavigationEnd, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { filter } from 'rxjs/operators'
import { AssistantService } from '../../assistant/assistant.service'

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    standalone: false
})
export class AppTopBarComponent implements OnInit, OnDestroy {
  darkMode = false
  items!: MenuItem[]

  @ViewChild('menubutton') menuButton!: ElementRef
  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef
  @ViewChild('topbarmenu') menu!: ElementRef

  userProfile: any
  userName = 'User'
  userEmail = ''
  userInitial = 'U'

  breadcrumbs: { label: string; url?: string }[] = []
  private routerSub!: Subscription

  private routeMap: { [path: string]: { category: string; label: string } } = {
    '/ai': { category: 'Events', label: 'Home' },
    '/ai/dashboard': { category: 'Events', label: 'Dashboard' },
    '/ai/analytics': { category: 'Events', label: 'API Calls' },
    '/ai/llm-calls': { category: 'Events', label: 'LLM Calls' },
    '/ai/traces': { category: 'Events', label: 'Traces' },
    '/ai/executions': { category: 'Events', label: 'Agent Executions' },
    '/ai/developer-executions': { category: 'Events', label: 'Developer Agents' },
    '/ai/feedbacks': { category: 'Events', label: 'Feedbacks' },
    '/ai/users': { category: 'Events', label: 'Users' },
    '/ai/datasets': { category: 'Management', label: 'Datasets' },
    '/ai/prompts': { category: 'Management', label: 'Prompts' },
    '/ai/evals': { category: 'Management', label: 'Evaluation' },
    '/ai/settings': { category: 'Management', label: 'Settings' },
    '/ai/audit': { category: 'Management', label: 'Audit Trail' },
    '/ai/access': { category: 'Management', label: 'Access Control' },
    '/ai/webhooks': { category: 'Management', label: 'Webhooks' },
    '/ai/registry': { category: 'Governance', label: 'AI Registry' },
    '/ai/risk': { category: 'Governance', label: 'Risk Dashboard' },
    '/ai/insights': { category: 'Governance', label: 'Insights' },
    '/ai/alerts': { category: 'Governance', label: 'Alerts' },
    '/ai/drift': { category: 'Governance', label: 'Drift Monitor' },
    '/ai/policies': { category: 'Governance', label: 'Policies' },
    '/ai/evidence': { category: 'Governance', label: 'Evidence' },
    '/ai/assessments': { category: 'Governance', label: 'Assessments' },
    '/ai/experiments': { category: 'Governance', label: 'Experiments' },
  }

  tourLoading = false

  constructor(
    public layoutService: LayoutService,
    private oauthService: OAuthService,
    private router: Router,
    private assistantService: AssistantService
  ) {}

  ngOnInit(): void {
    try {
      const jwt = this.oauthService.authorizationHeader().split('Bearer ')[1]
      this.userProfile = parseJwt<any>(jwt)
      this.userName = this.userProfile?.preferred_username || this.userProfile?.name || 'User'
      this.userEmail = this.userProfile?.email || ''
      this.userInitial = this.userName ? this.userName[0].toUpperCase() : 'U'
    } catch (e) {
      this.userName = 'User'
      this.userInitial = 'U'
    }

    this.darkMode = this.layoutService.config().colorScheme === 'dark'
    this.updateBreadcrumbs(this.router.url)
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateBreadcrumbs(event.urlAfterRedirects || event.url)
    })
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe()
    }
  }

  private updateBreadcrumbs(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0]
    const match = this.routeMap[cleanUrl]
    if (match) {
      this.breadcrumbs = [
        { label: match.category },
        { label: match.label },
      ]
    } else {
      this.breadcrumbs = [{ label: 'Observatory' }]
    }
  }

  changeTheme(_____event: any): void {
    if (this.darkMode) {
      this.setLightTheme()
      this.darkMode = false
    } else {
      this.setDarkTheme()
      this.darkMode = true
    }
  }

  setLightTheme(): void {
    const config: AppConfig = {
      ripple: true,
      inputStyle: 'outlined',
      menuMode: 'static',
      colorScheme: 'light',
      theme: 'flowx-light',
      scale: 13,
    }
    this.layoutService.config.set(config)
  }

  setDarkTheme(): void {
    const config: AppConfig = {
      ripple: true,
      inputStyle: 'outlined',
      menuMode: 'static',
      colorScheme: 'dark',
      theme: 'flowx-dark',
      scale: 13,
    }
    this.layoutService.config.set(config)
  }

  async startPageTour(): Promise<void> {
    const mainEl = document.querySelector('.layout-main')
    if (!mainEl) {return}

    this.tourLoading = true
    try {
      const html = mainEl.innerHTML
      const data = await this.assistantService.getScreenHelp(html)
      const steps = Array.isArray(data?.steps) ? data.steps : []
      if (steps.length === 0) {return}

      const Shepherd = (await import('shepherd.js')).default

      const tour = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
          classes: 'observatory-shepherd-theme',
          scrollTo: true,
        },
      })

      for (const step of steps) {
        const buttons: any[] = []

        // Always add Cancel as the first (leftmost) button
        buttons.push({
          text: 'Cancel',
          action: tour.cancel,
          classes: 'shepherd-button-cancel',
        })

        for (const btn of (step.buttons || [])) {
          if (btn.type === 'cancel') {continue} // skip LLM-generated cancel (we add our own)
          if (btn.type === 'back') {
            buttons.push({ text: btn.text || 'Back', action: tour.back, classes: btn.classes || '' })
          } else {
            buttons.push({ text: btn.text || 'Next', action: tour.next, classes: btn.classes || '' })
          }
        }

        tour.addStep({
          id: step.id,
          text: step.text,
          attachTo: step.attachTo?.element
            ? { element: step.attachTo.element, on: step.attachTo.on || 'bottom' }
            : undefined,
          buttons,
          classes: step.classes || 'observatory-shepherd-theme',
        })
      }

      tour.start()
    } catch (e) {
      console.error('Page tour error:', e)
    } finally {
      this.tourLoading = false
    }
  }

  logout(): void {
    this.oauthService.logOut()
    this.router.navigate(['/'])
  }
}
