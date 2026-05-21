import { Component, OnInit } from '@angular/core'
import { Title, Meta } from '@angular/platform-browser'
import { MessageService } from 'primeng/api'
import { EvalService } from '../services/evals.service'
import { DatasetService } from '../services/datasets.service'
import { OrgService } from '../services/orgs.service'

@Component({
  selector: 'app-experiments',
  templateUrl: './experiments.component.html',
  providers: [MessageService],
  standalone: false,
})
export class ExperimentsComponent implements OnInit {
  orgs: any[] = []
  selectedOrg: any = null
  workspaces: any[] = []
  selectedWorkspace: any = null
  activeTab = '0'

  experiments: any[] = []
  datasets: any[] = []
  evaluatorCatalog: any[] = []
  pollingTimers: Map<string, any> = new Map()

  // Create dialog
  createDialogVisible = false
  experimentForm: any = {}

  // Results dialog
  resultsDialogVisible = false
  currentExperiment: any = null
  currentResults: any = null
  currentSummary: any = null
  resultsTab = '0'

  providerOptions = [
    { label: 'OpenAI', value: 'openai' },
    { label: 'Anthropic', value: 'anthropic' },
    { label: 'Google', value: 'google' },
  ]

  experimentTypeOptions = [
    { label: 'Extraction Accuracy', value: 'extraction' },
    { label: 'LLM Quality', value: 'llm_quality' },
    { label: 'Trajectory', value: 'trajectory' },
  ]

  constructor(
    private evalService: EvalService,
    private datasetService: DatasetService,
    private orgService: OrgService,
    private messageService: MessageService,
    private titleService: Title,
    private metaService: Meta,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('FlowX.AI Observatory - Experiments')
    this.metaService.updateTag({ name: 'description', content: 'Run experiments and evaluations on AI agent outputs.' })
    this.populateOrgs()
  }

  populateOrgs(): void {
    this.orgService.getOrgsWithApps().then((data: any) => {
      this.orgs = data || []
      if (this.orgs.length > 0) {
        // Prefer non-default orgs (auto-provisioned from platform)
        const sortedOrgs = [...this.orgs].sort((a, b) => {
          if (a.name === 'Default') return 1
          if (b.name === 'Default') return -1
          return 0
        })
        this.selectedOrg = sortedOrgs[0].id
        this.workspaces = this.getWorkspaces(this.selectedOrg)
        this.selectedWorkspace = this.workspaces?.[0]?.id || null
        this.loadAll()
      }
    })
  }

  getWorkspaces(org_id: string): any[] {
    const org = this.orgs?.find((item) => item.id === org_id)
    return org?.workspaces || []
  }

  orgChanged(): void {
    this.workspaces = this.getWorkspaces(this.selectedOrg)
    this.selectedWorkspace = this.workspaces?.[0]?.id || null
    this.loadAll()
  }

  workspaceChanged(event: any): void {
    this.loadAll()
  }

  loadAll(): void {
    this.loadExperiments()
    this.loadDatasets()
    this.loadCatalog()
  }

  async loadExperiments(): Promise<any> {
    try {
      const res = await this.evalService.getEvals(1, 50, null, null)
      this.experiments = res?.items || []
    } catch {
      this.experiments = []
    }
  }

  async loadDatasets(): Promise<any> {
    try {
      this.datasets = await this.datasetService.getAllDatasets(this.selectedOrg) || []
    } catch {
      this.datasets = []
    }
  }

  async loadCatalog(): Promise<any> {
    try {
      this.evaluatorCatalog = await this.evalService.getEvaluatorCatalog() || []
    } catch {
      this.evaluatorCatalog = []
    }
  }

  // ── Create Experiment ────────────────────────────

  openCreateDialog(): void {
    this.experimentForm = {
      name: '',
      dataset_id: null,
      experiment_type: 'extraction',
      llm_provider: 'openai',
      llm_name: 'gpt-4.1-nano',
      evaluators: ['field_precision', 'field_recall', 'field_f1'],
    }
    this.createDialogVisible = true
  }

  getEvaluatorOptions(): any[] {
    return this.evaluatorCatalog.map((e: any) => ({
      label: e.name,
      value: e.code,
    }))
  }

  async createExperiment(): Promise<any> {
    try {
      await this.evalService.createEval(
        this.selectedOrg,
        this.experimentForm.name,
        this.experimentForm.dataset_id,
        null,
        1,
        this.experimentForm.experiment_type,
        this.experimentForm.llm_provider,
        this.experimentForm.llm_name,
        this.experimentForm.evaluators,
      )
      this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Experiment created' })
      this.createDialogVisible = false
      this.loadExperiments()
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create experiment' })
    }
  }

  // ── Run Experiment ─────────────────────────────

  async runExperiment(exp: any): Promise<any> {
    try {
      await this.evalService.runExperiment(exp.id)
      exp.status = 'RUNNING'
      this.messageService.add({ severity: 'info', summary: 'Started', detail: 'Experiment is running...' })
      this.startPolling(exp.id)
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to start experiment' })
    }
  }

  startPolling(experimentId: string): void {
    if (this.pollingTimers.has(experimentId)) { return }
    const timer = setInterval(async () => {
      try {
        const res = await this.evalService.getEvals(1, 50, null, null)
        const items = res?.items || []
        const exp = items.find((e: any) => e.id === experimentId)
        if (exp && exp.status !== 'RUNNING') {
          clearInterval(timer)
          this.pollingTimers.delete(experimentId)
          this.experiments = items
          if (exp.status === 'COMPLETED') {
            this.messageService.add({ severity: 'success', summary: 'Completed', detail: `Experiment "${exp.name}" finished` })
          } else if (exp.status === 'FAILED') {
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: exp.error_message || 'Experiment failed' })
          }
        } else {
          this.experiments = items
        }
      } catch { /* ignore polling errors */ }
    }, 3000)
    this.pollingTimers.set(experimentId, timer)
  }

  // ── View Results ──────────────────────────────

  async viewResults(exp: any): Promise<any> {
    this.currentExperiment = exp
    this.resultsTab = '0'
    try {
      const data = await this.evalService.getExperimentResults(exp.id)
      this.currentResults = data?.results || []
      this.currentSummary = data?.summary || {}
      this.resultsDialogVisible = true
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load results' })
    }
  }

  // ── Delete ────────────────────────────────────

  async deleteExperiment(exp: any): Promise<any> {
    try {
      await this.evalService.deleteEval(exp.name)
      this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Experiment deleted' })
      this.loadExperiments()
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' })
    }
  }

  // ── Helpers ───────────────────────────────────

  getStatusSeverity(s: string): string {
    switch (s) {
      case 'COMPLETED': return 'success'
      case 'RUNNING': return 'info'
      case 'CREATED': return 'warn'
      case 'FAILED': return 'danger'
      default: return 'secondary'
    }
  }

  getDatasetName(id: string): string {
    const d = this.datasets.find((ds: any) => ds.id === id)
    return d?.name || (id ? id.substring(0, 8) + '...' : '-')
  }

  getSummaryKeys(): string[] {
    if (!this.currentSummary) { return [] }
    return Object.keys(this.currentSummary).filter(k => k !== 'by_document_type' && k !== 'by_field')
  }

  getDocumentTypes(): string[] {
    return Object.keys(this.currentSummary?.by_document_type || {})
  }

  getDocTypeMetrics(docType: string): any {
    return this.currentSummary?.by_document_type?.[docType] || {}
  }

  getFieldNames(): string[] {
    return Object.keys(this.currentSummary?.by_field || {})
  }

  getFieldMetrics(field: string): any {
    return this.currentSummary?.by_field?.[field] || {}
  }

  getResultKeys(results: any): string[] {
    if (!results) { return [] }
    return Object.keys(results)
  }

  getScoreColor(score: number): string {
    if (score >= 0.9) { return 'var(--flowx-green-300, #54aa94)' }
    if (score >= 0.75) { return 'var(--flowx-yellow-400, #fec742)' }
    return 'var(--flowx-orange-500, #fd6b1c)'
  }
}
