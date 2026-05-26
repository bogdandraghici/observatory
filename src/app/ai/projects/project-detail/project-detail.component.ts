import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Meta, Title } from '@angular/platform-browser'
import { DashboardService } from '../../services/dashboard.service'
import { AppService } from '../../services/apps.service'
import { OrgService } from '../../services/orgs.service'
import { RoiService } from '../../services/roi.service'
import { EvaluatorService } from '../../services/evaluator.service'
import { formatTime, processDuration, getDurationLLM } from '../../utils/time'

@Component({
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss'],
  standalone: false,
})
export class ProjectDetailComponent implements OnInit {
  projectId: string
  project: any = null
  activeTab = 'overview'
  hours = 168
  editDialogVisible = false

  lifecycleOptions = [
    { label: 'Research', value: 'research' },
    { label: 'Development', value: 'development' },
    { label: 'Staging', value: 'staging' },
    { label: 'Production', value: 'production' },
    { label: 'Deprecated', value: 'deprecated' },
    { label: 'Retired', value: 'retired' },
  ]
  riskOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' },
  ]

  // Overview
  stats: any = null

  // Executions
  executions: any[] = []

  // Agents
  agents: any[] = []
  agentBaselines: any[] = []
  baselineDialogVisible = false
  baselineForm: any = {}
  editingBaseline: any = null
  frequencyOptions = [
    { label: 'Per Execution', value: 'per_execution' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
  ]

  // Evaluators
  evaluators: any[] = []
  evaluatorSummaries: any[] = []
  evaluatorDialogVisible = false
  evaluatorForm: any = {}
  editingEvaluator: any = null
  suggestLoading = false
  selectedAgentForEval: any = null
  selectedEvaluator: any = null
  evaluationResults: any[] = []
  resultsDialogVisible = false
  suggestedEvaluators: any[] = []
  suggestDialogVisible = false
  scoringOptions = [
    { label: 'Binary (Pass/Fail)', value: 'binary' },
    { label: 'Scale (1-5)', value: 'scale' },
    { label: 'Continuous (0-1)', value: 'continuous' },
  ]
  runModeOptions = [
    { label: 'Auto (on every LLM call)', value: 'auto' },
    { label: 'Manual (on-demand)', value: 'manual' },
  ]
  providerOptions = [
    { label: 'OpenAI', value: 'openai' },
    { label: 'Anthropic', value: 'anthropic' },
    { label: 'Ollama', value: 'ollama' },
  ]

  formatTime = formatTime
  processDuration = processDuration

  periods = [
    { name: 'Last Hour', value: 1 },
    { name: '3H', value: 3 },
    { name: '24H', value: 24 },
    { name: '7D', value: 168 },
    { name: '1M', value: 720 },
    { name: '6M', value: 4320 },
  ]

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService,
    private appService: AppService,
    private orgService: OrgService,
    private roiService: RoiService,
    private evaluatorService: EvaluatorService,
    private metaService: Meta,
    private titleService: Title,
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id')
    this.loadProject()
  }

  async loadProject(): Promise<void> {
    const orgs = await this.orgService.getOrgsWithApps()
    if (Array.isArray(orgs)) {
      for (const org of orgs) {
        for (const ws of org.workspaces || []) {
          for (const p of ws.projects || []) {
            if (p.id === this.projectId) {
              this.project = { ...p, org_name: org.name, org_id: org.id, workspace_name: ws.name }
            }
          }
        }
        if (!this.project) {
          for (const p of org.projects || []) {
            if (p.id === this.projectId) {
              this.project = { ...p, org_name: org.name, org_id: org.id }
            }
          }
        }
      }
    }

    if (this.project) {
      this.titleService.setTitle(`FlowX.AI Observatory - ${this.project.name}`)
      // Load stats
      try {
        const stats = await this.appService.getAppStats(this.project.org_id)
        if (Array.isArray(stats)) {
          const projectStats = stats.find((s: any) => s.project_id === this.projectId)
          if (projectStats) {
            this.project.stats = projectStats
          }
        }
      } catch {}
    }

    this.loadAll()
  }

  loadAll(): void {
    this.loadExecutions()
    this.loadAgents()
    this.loadEvaluators()
  }

  periodChanged(): void {
    this.loadAll()
  }

  async loadExecutions(): Promise<void> {
    try {
      const data = await this.dashboardService.getExecutions(this.projectId, this.hours, 1, 20, null)
      this.executions = Array.isArray(data?.items) ? data.items : []
      this.executions = this.executions.map((item) => {
        item.duration = getDurationLLM(item)
        return item
      })
    } catch {
      this.executions = []
    }
  }

  async loadAgents(): Promise<void> {
    try {
      const data = await this.dashboardService.getDistinctAgents(this.projectId, this.hours)
      this.agents = Array.isArray(data) ? data : []
    } catch {
      this.agents = []
    }
    await this.loadBaselines()
  }

  async loadBaselines(): Promise<void> {
    if (!this.project?.org_id) return
    try {
      const data = await this.roiService.listBaselines(this.project.org_id, this.projectId)
      this.agentBaselines = Array.isArray(data) ? data : []
    } catch {
      this.agentBaselines = []
    }
  }

  getBaselineForAgent(agentName: string): any {
    return this.agentBaselines.find((b) => b.agent_name === agentName)
  }

  openBaselineDialog(agentName: string): void {
    const existing = this.getBaselineForAgent(agentName)
    if (existing) {
      this.editingBaseline = existing
      this.baselineForm = { ...existing }
    } else {
      this.editingBaseline = null
      this.baselineForm = {
        agent_name: agentName,
        value_outcome_unit: '',
        task_description: '',
        manual_effort_hours_per_execution: 0,
        manual_effort_hourly_rate: 50,
        execution_frequency: 'per_execution',
        avg_executions_per_period: 0,
      }
    }
    this.baselineDialogVisible = true
  }

  async saveBaseline(): Promise<void> {
    if (!this.project?.org_id) return
    try {
      if (this.editingBaseline) {
        await this.roiService.updateBaseline(this.project.org_id, this.editingBaseline.id, {
          value_outcome_unit: this.baselineForm.value_outcome_unit,
          task_description: this.baselineForm.task_description,
          manual_effort_hours_per_execution: this.baselineForm.manual_effort_hours_per_execution,
          manual_effort_hourly_rate: this.baselineForm.manual_effort_hourly_rate,
          execution_frequency: this.baselineForm.execution_frequency,
          avg_executions_per_period: this.baselineForm.avg_executions_per_period,
        })
      } else {
        await this.roiService.createBaseline(this.project.org_id, {
          project_id: this.projectId,
          agent_name: this.baselineForm.agent_name,
          value_outcome_unit: this.baselineForm.value_outcome_unit,
          task_description: this.baselineForm.task_description,
          manual_effort_hours_per_execution: this.baselineForm.manual_effort_hours_per_execution,
          manual_effort_hourly_rate: this.baselineForm.manual_effort_hourly_rate,
          execution_frequency: this.baselineForm.execution_frequency,
          avg_executions_per_period: this.baselineForm.avg_executions_per_period,
        })
      }
      this.baselineDialogVisible = false
      await this.loadBaselines()
    } catch {}
  }

  // ── Evaluators ──────────────────────────────────

  async loadEvaluators(): Promise<void> {
    try {
      this.evaluators = await this.evaluatorService.listEvaluators(this.projectId) || []
      this.evaluatorSummaries = await this.evaluatorService.getSummary(this.projectId) || []
    } catch {
      this.evaluators = []
      this.evaluatorSummaries = []
    }
  }

  getEvalSummary(evaluatorId: string): any {
    return this.evaluatorSummaries.find((s) => s.evaluator_id === evaluatorId) || {}
  }

  openCreateEvaluator(): void {
    this.editingEvaluator = null
    this.evaluatorForm = {
      project_id: this.projectId,
      agent_name: null,
      name: '',
      description: '',
      prompt_template: 'Evaluate the following LLM response.\n\nINPUT: {input}\n\nOUTPUT: {output}\n\nRespond with JSON: {"score": <0 or 1>, "passed": <true or false>, "comment": "<your reasoning>"}',
      scoring_type: 'binary',
      judge_provider: 'openai',
      judge_model: 'gpt-5.4-nano',
      run_mode: 'auto',
    }
    this.evaluatorDialogVisible = true
  }

  openEditEvaluator(ev: any): void {
    this.editingEvaluator = ev
    this.evaluatorForm = { ...ev }
    this.evaluatorDialogVisible = true
  }

  async saveEvaluator(): Promise<void> {
    try {
      if (this.editingEvaluator) {
        await this.evaluatorService.updateEvaluator(this.editingEvaluator.id, this.evaluatorForm)
      } else {
        await this.evaluatorService.createEvaluator(this.evaluatorForm)
      }
      this.evaluatorDialogVisible = false
      await this.loadEvaluators()
    } catch {}
  }

  async deleteEvaluator(ev: any): Promise<void> {
    await this.evaluatorService.deleteEvaluator(ev.id)
    await this.loadEvaluators()
  }

  async toggleEvaluator(ev: any): Promise<void> {
    await this.evaluatorService.toggleEvaluator(ev.id)
    await this.loadEvaluators()
  }

  async runEvaluator(ev: any): Promise<void> {
    await this.evaluatorService.runEvaluator(ev.id, 50, this.hours)
  }

  async viewResults(ev: any): Promise<void> {
    this.selectedEvaluator = ev
    try {
      this.evaluationResults = await this.evaluatorService.getResults(ev.id, 100) || []
    } catch {
      this.evaluationResults = []
    }
    this.resultsDialogVisible = true
  }

  async suggestEvaluators(): Promise<void> {
    this.suggestLoading = true
    try {
      this.suggestedEvaluators = await this.evaluatorService.suggestEvaluators(this.projectId, 'openai', 'gpt-5.4', this.selectedAgentForEval) || []
      this.suggestDialogVisible = true
    } catch {
      this.suggestedEvaluators = []
    }
    this.suggestLoading = false
  }

  async acceptSuggested(suggestion: any): Promise<void> {
    await this.evaluatorService.createEvaluator({
      project_id: this.projectId,
      agent_name: this.selectedAgentForEval || null,
      name: suggestion.name,
      description: suggestion.description,
      prompt_template: suggestion.prompt_template,
      scoring_type: suggestion.scoring_type,
      is_recommended: true,
      run_mode: 'auto',
      judge_provider: 'openai',
      judge_model: 'gpt-5.4-nano',
    })
    this.suggestedEvaluators = this.suggestedEvaluators.filter((s) => s !== suggestion)
    await this.loadEvaluators()
    if (this.suggestedEvaluators.length === 0) {
      this.suggestDialogVisible = false
    }
  }

  showEditDialog(): void {
    this.editDialogVisible = true
  }

  async saveProject(): Promise<void> {
    try {
      await this.appService.updateApp(this.project)
      this.editDialogVisible = false
    } catch {}
  }

  goBack(): void {
    this.router.navigate(['/ai/projects'])
  }

  getLatency(val: number): string {
    if (val > 8) return 'danger'
    if (val > 4) return 'warn'
    return 'success'
  }

  formatCost(cost: number): string {
    if (cost == null || cost === 0) return '-'
    if (cost < 0.0001) return '< $0.0001'
    return '$' + cost.toFixed(4)
  }
}
