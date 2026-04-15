import { Component, OnInit } from '@angular/core'
import { Meta, Title } from '@angular/platform-browser'
import { MessageService } from 'primeng/api'

import { TestsService } from './tests.service'
import { OrgService } from '../services/orgs.service'
import { DashboardService } from '../services/dashboard.service'
import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'

@Component({
  templateUrl: './tests.component.html',
  styleUrl: './tests.component.scss',
  standalone: false,
  providers: [MessageService],
})
export class TestsComponent implements OnInit {
  // Filters
  orgs: any[] = []
  selectedOrg: any
  workspaces: any[] = []
  selectedWorkspace: any
  apps: any[] = []
  selectedApp: any = null

  // Agents (workflows)
  agents: any[] = []
  selectedAgent = ''

  // Datasets
  datasets: any[] = []
  selectedDataset: any = null

  // Test Cases
  testCases: any[] = []

  // Test Runs
  testRuns: any[] = []
  selectedRun: any = null
  showRunDialog = false

  // Create dataset dialog
  showCreateDatasetDialog = false
  newDatasetName = ''
  newDatasetDesc = ''

  // State
  activeTab = 'cases'
  loading = false
  running = false
  unavailable = false
  private pollTimer: any = null

  constructor(
    private testsService: TestsService,
    private orgService: OrgService,
    private dashboardService: DashboardService,
    public layoutService: LayoutService,
    private metaService: Meta,
    private titleService: Title,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('FlowX.AI Observatory - Test Cases')
    this.metaService.updateTag({ name: 'description', content: 'Manage test datasets and run regression tests for AI agents.' })
    this.populateOrgs()
  }

  // ── Org → Workspace → App cascade ────────────────────────────────

  populateOrgs(): void {
    this.orgService.getOrgsWithApps().then((data: any) => {
      this.orgs = data || []
      if (this.orgs.length > 0) {
        const sortedOrgs = [...this.orgs].sort((a, b) => {
          if (a.name === 'Default') return 1
          if (b.name === 'Default') return -1
          return 0
        })
        this.selectedOrg = sortedOrgs[0].id
        this.orgChanged()
      }
    })
  }

  orgChanged(): void {
    if (!this.selectedOrg) return
    const org = this.orgs.find((o: any) => o.id === this.selectedOrg)
    this.workspaces = org?.workspaces || []
    if (this.workspaces.length > 0) {
      this.selectedWorkspace = this.workspaces[0].id
      this.workspaceChanged()
    }
  }

  workspaceChanged(): void {
    if (!this.selectedWorkspace) return
    const org = this.orgs.find((o: any) => o.id === this.selectedOrg)
    const workspace = org?.workspaces?.find((w: any) => w.id === this.selectedWorkspace)
    this.apps = (workspace?.projects || []).filter((a: any) => a.is_active)
    if (this.apps.length > 0) {
      this.selectedApp = this.apps[0].id
      this.loadAgents()
    }
  }

  appChanged(): void {
    this.loadAgents()
  }

  async loadAgents(): Promise<void> {
    if (!this.selectedApp) return
    try {
      const result = await this.dashboardService.getInsightsAgents(this.selectedApp)
      if (result?.error) {
        this.agents = []
        return
      }
      const seen = new Set()
      this.agents = (result || [])
        .map((a: any) => {
          const id = a.agent_id || a.id
          return { label: a.name || id, value: id }
        })
        .filter((a: any) => {
          if (seen.has(a.value)) return false
          seen.add(a.value)
          return true
        })
      if (this.agents.length > 0) {
        this.selectedAgent = this.agents[0].value
        this.loadDatasets()
      } else {
        this.selectedAgent = ''
        this.datasets = []
        this.testCases = []
        this.testRuns = []
      }
    } catch {
      this.agents = []
    }
  }

  agentChanged(): void {
    this.selectedDataset = null
    this.datasets = []
    this.testCases = []
    this.testRuns = []
    this.loadDatasets()
  }

  // ── Datasets ────────────────────────────────────────────────────

  async loadDatasets(): Promise<void> {
    if (!this.selectedAgent) return
    this.loading = true
    try {
      const result = await this.testsService.getDatasets(this.selectedAgent)
      this.datasets = Array.isArray(result) ? result : []
      this.unavailable = false
      if (this.datasets.length > 0 && !this.selectedDataset) {
        this.selectedDataset = this.datasets[0]
        this.loadTestCases()
        this.loadTestRuns()
      } else if (this.datasets.length === 0) {
        this.selectedDataset = null
        this.testCases = []
        this.testRuns = []
      }
    } catch {
      this.unavailable = true
      this.datasets = []
    }
    this.loading = false
  }

  datasetChanged(): void {
    this.testCases = []
    this.testRuns = []
    if (this.selectedDataset) {
      this.loadTestCases()
      this.loadTestRuns()
    }
  }

  async createDataset(): Promise<void> {
    if (!this.selectedAgent || !this.newDatasetName.trim()) return
    try {
      await this.testsService.createDataset(this.selectedAgent, this.newDatasetName.trim(), this.newDatasetDesc.trim())
      this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Test dataset created' })
      this.showCreateDatasetDialog = false
      this.newDatasetName = ''
      this.newDatasetDesc = ''
      await this.loadDatasets()
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create dataset' })
    }
  }

  async deleteDataset(dataset: any): Promise<void> {
    try {
      await this.testsService.deleteDataset(dataset.id)
      this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Dataset removed' })
      if (this.selectedDataset?.id === dataset.id) {
        this.selectedDataset = null
        this.testCases = []
        this.testRuns = []
      }
      await this.loadDatasets()
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete dataset' })
    }
  }

  // ── Test Cases ──────────────────────────────────────────────────

  async loadTestCases(): Promise<void> {
    if (!this.selectedDataset) return
    try {
      const result = await this.testsService.getTestCases(this.selectedDataset.id)
      this.testCases = Array.isArray(result) ? result : []
    } catch {
      this.testCases = []
    }
  }

  async deleteTestCase(tc: any): Promise<void> {
    try {
      await this.testsService.deleteTestCase(tc.id)
      this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Test case removed' })
      await this.loadTestCases()
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete test case' })
    }
  }

  async runSingleTest(tc: any): Promise<void> {
    try {
      tc._running = true
      await this.testsService.runSingleTest(tc.id)
      this.messageService.add({ severity: 'success', summary: 'Started', detail: 'Test run started' })
      await this.loadTestRuns()
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to start test' })
    } finally {
      tc._running = false
    }
  }

  // ── Test Runs ───────────────────────────────────────────────────

  async loadTestRuns(): Promise<void> {
    if (!this.selectedDataset) return
    try {
      const result = await this.testsService.getTestRuns(this.selectedDataset.id)
      this.testRuns = Array.isArray(result) ? result : []
    } catch {
      this.testRuns = []
    }
  }

  async runAllTests(): Promise<void> {
    if (!this.selectedDataset) return
    this.running = true
    try {
      const result = await this.testsService.runAllTests(this.selectedDataset.id)
      this.messageService.add({ severity: 'success', summary: 'Started', detail: 'Test run started for all cases' })
      if (result?.id) {
        this.pollRunStatus(result.id)
      }
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to start test run' })
      this.running = false
    }
  }

  private pollRunStatus(runId: string): void {
    this.clearPoll()
    this.pollTimer = setInterval(async () => {
      try {
        const run = await this.testsService.getTestRun(runId)
        if (run?.status === 'COMPLETED' || run?.status === 'FAILED') {
          this.clearPoll()
          this.running = false
          await this.loadTestRuns()
          const severity = run.status === 'COMPLETED' ? 'success' : 'error'
          const msg = run.status === 'COMPLETED'
            ? `Completed: ${run.summary?.passed || 0}/${run.summary?.total || 0} passed`
            : 'Test run failed'
          this.messageService.add({ severity, summary: 'Test Run', detail: msg })
        }
      } catch {
        this.clearPoll()
        this.running = false
      }
    }, 3000)
  }

  private clearPoll(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
  }

  async viewRunDetail(run: any): Promise<void> {
    try {
      this.selectedRun = await this.testsService.getTestRun(run.id)
      this.showRunDialog = true
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load run details' })
    }
  }

  // ── Tab ─────────────────────────────────────────────────────────

  onTabChange(tab: string): void {
    this.activeTab = tab
    if (tab === 'cases') { this.loadTestCases() }
    if (tab === 'runs') { this.loadTestRuns() }
  }

  // ── Helpers ─────────────────────────────────────────────────────

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'PASSED': case 'COMPLETED': return 'success'
      case 'FAILED': case 'ERROR': return 'danger'
      case 'RUNNING': case 'PENDING': return 'info'
      default: return 'secondary'
    }
  }

  formatScore(score: number | null): string {
    if (score == null) return '-'
    return (score * 100).toFixed(0) + '%'
  }

  formatDuration(ms: number | null): string {
    if (ms == null) return '-'
    if (ms >= 1000) return (ms / 1000).toFixed(1) + 's'
    return ms + 'ms'
  }

  previewText(value: any, maxLen = 80): string {
    if (value == null) return '-'
    const str = typeof value === 'string' ? value : JSON.stringify(value)
    return str.length > maxLen ? str.substring(0, maxLen) + '...' : str
  }

  getScoreColor(score: number | null): string {
    if (score == null) return '#94a3b8'
    if (score >= 0.8) return '#22c55e'
    if (score >= 0.5) return '#f59e0b'
    return '#ef4444'
  }
}
