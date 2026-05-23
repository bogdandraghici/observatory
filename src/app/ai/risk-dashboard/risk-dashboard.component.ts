import { Component, OnInit, ViewChild } from '@angular/core'
import { Drawer } from 'primeng/drawer'
import { DashboardService } from '../services/dashboard.service'
import { OrgService } from '../services/orgs.service'
import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'
import { Meta, Title } from '@angular/platform-browser'
import { MessageService } from 'primeng/api'
import Chart from 'chart.js/auto'
import { resolveDefaultAppOrg } from '../utils/default-app'

@Component({
    templateUrl: './risk-dashboard.component.html',
    styleUrl: './risk-dashboard.component.scss',
    standalone: false,
    providers: [MessageService],
})
export class RiskDashboardComponent implements OnInit {
  orgs: any[]
  selectedOrg: any
  hours = 720

  periodOptions = [
    { label: 'Last 24h', value: 24 },
    { label: 'Last 7d', value: 168 },
    { label: 'Last 30d', value: 720 },
    { label: 'Last 6m', value: 4320 },
  ]

  // KPI
  totalProjects = 0
  highRiskCount = 0
  avgScore = 0
  assessmentCount = 0

  // Heatmap
  heatmapData: any[] = []
  dimensions = ['safety', 'bias', 'privacy', 'performance', 'quality', 'regulatory']

  // Ranking
  ranking: any[] = []

  // Risk Profile Drawer
  @ViewChild('profileDrawerRef') profileDrawerRef!: Drawer
  profileDrawerVisible = false
  selectedProfile: any = null
  radarChart: Chart | null = null

  // Trending
  trendingChart: Chart | null = null
  selectedTrendApp = ''

  constructor(
    private dashboardService: DashboardService,
    private orgService: OrgService,
    public layoutService: LayoutService,
    private metaService: Meta,
    private titleService: Title,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('FlowX.AI Observatory - Risk Dashboard')
    this.metaService.updateTag({ name: 'description', content: 'Risk scoring dashboard for AI applications.' })
    this.populateOrgs()
  }

  populateOrgs(): void {
    this.orgService.getOrgsWithApps().then((data) => {
      this.orgs = data
      if (this.orgs?.length > 0) {
        const { org } = resolveDefaultAppOrg(this.orgs)
        this.selectedOrg = org?.id || this.orgs[0]?.id
        this.loadAll()
      }
    })
  }

  orgChanged(): void { this.loadAll() }
  periodChanged(): void { this.loadAll() }

  async loadAll(): Promise<any> {
    if (!this.selectedOrg) {return}
    await Promise.all([
      this.loadHeatmap(),
      this.loadRanking(),
    ])
    this.computeKPIs()
  }

  async loadHeatmap(): Promise<any> {
    this.heatmapData = await this.dashboardService.getRiskHeatmap(this.selectedOrg, this.hours) || []
  }

  async loadRanking(): Promise<any> {
    this.ranking = await this.dashboardService.getRiskRanking(this.selectedOrg, this.hours) || []
  }

  computeKPIs(): void {
    this.totalProjects = this.heatmapData.length
    this.highRiskCount = this.heatmapData.filter(
      a => a.overall_risk === 'high' || a.overall_risk === 'critical'
    ).length

    const allScores: number[] = []
    for (const app of this.heatmapData) {
      for (const dim of this.dimensions) {
        if (app[dim] != null) {allScores.push(app[dim])}
      }
    }
    this.avgScore = allScores.length > 0
      ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 100) / 100
      : 0
    this.assessmentCount = allScores.length
  }

  getCellColor(score: number | null): string {
    if (score == null) {return 'var(--flowx-text-disabled, #a6b0be)'}
    if (score >= 0.8) {return 'var(--flowx-success, #008060)'}
    if (score >= 0.6) {return 'var(--flowx-warning, #feb913)'}
    if (score >= 0.3) {return 'var(--flowx-orange-500, #fd6b1c)'}
    return 'var(--flowx-error, #e62200)'
  }

  getCellText(score: number | null): string {
    if (score == null) {return '-'}
    return (score * 100).toFixed(0) + '%'
  }

  getRiskSeverity(level: string): string {
    switch (level) {
      case 'critical': return 'danger'
      case 'high': return 'warn'
      case 'medium': return 'info'
      case 'low': return 'success'
      default: return 'secondary'
    }
  }

  closeProfileDrawer(e: Event): void {
    this.profileDrawerRef.close(e)
  }

  async showProfile(item: any): Promise<any> {
    const profile = await this.dashboardService.getRiskProfile(item.project_id)
    if (profile) {
      this.selectedProfile = profile
      this.profileDrawerVisible = true
      setTimeout(() => this.renderRadar(), 100)
    }
  }

  renderRadar(): void {
    if (this.radarChart) {this.radarChart.destroy()}
    const canvas = document.getElementById('radarCanvas') as HTMLCanvasElement
    if (!canvas || !this.selectedProfile) {return}

    const dimMap: any = {}
    for (const d of this.selectedProfile.dimensions || []) {
      dimMap[d.dimension] = d.score
    }

    const style = getComputedStyle(document.documentElement)
    const textColor = style.getPropertyValue('--text-color').trim() || '#ccc'
    const textSecondary = style.getPropertyValue('--text-color-secondary').trim() || '#888'
    const surfaceBorder = style.getPropertyValue('--surface-border').trim() || '#444'

    this.radarChart = new Chart(canvas, {
      type: 'radar',
      data: {
        labels: this.dimensions.map(d => d.charAt(0).toUpperCase() + d.slice(1)),
        datasets: [{
          label: 'Risk Score',
          data: this.dimensions.map(d => dimMap[d] != null ? dimMap[d] * 100 : 0),
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderColor: 'rgba(99, 102, 241, 1)',
          pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 25, color: textSecondary, backdropColor: 'transparent' },
            pointLabels: { color: textColor, font: { size: 12 } },
            grid: { color: surfaceBorder },
            angleLines: { color: surfaceBorder },
          },
        },
        plugins: { legend: { display: false } },
      },
    })
  }

  async computeRiskForApp(appId: string): Promise<any> {
    await this.dashboardService.computeRisk(appId)
    this.messageService.add({ severity: 'success', summary: 'Computed', detail: 'Risk assessment updated' })
    this.loadAll()
  }
}
