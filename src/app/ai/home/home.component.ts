import { Component, OnInit } from '@angular/core'
import { OrgService } from '../services/orgs.service'
import { AppService } from '../services/apps.service'
import { processDuration } from '../utils/time'
import { MessageService } from 'primeng/api'
import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'
import { QueueService } from '../services/queues.service'
import { DatasetService } from '../services/datasets.service'
import { Clipboard } from '@angular/cdk/clipboard'
import { Meta, Title } from '@angular/platform-browser'

@Component({
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false
})
export class HomeComponent implements OnInit {
  apps: any[] = []
  selectedApp: any

  orgs: any[] = []
  selectedOrg: any

  workspaces: any[] = []
  selectedWorkspace: any = null

  datasets: any[] = []
  annotations: any[] = []

  newOrganizationName = ''
  newProjectName = ''
  newDatasetName = ''
  newQueueName = ''

  visibleOrganization = false
  visibleProject = false
  visibleDataset = false
  visibleQueue = false
  visibleIntegrate = false
  visibleWorkspace = false

  newWorkspaceName = ''

  isSaaSMode = false

  DEFAULT_ORG_ID = '1621c0c4-5cce-4c91-aea1-4b410b70b82d'

  // Integration dialog state
  integrationMethods = [
    { label: 'OpenAI', value: 'openai', icon: 'pi pi-bolt' },
    { label: 'Anthropic', value: 'anthropic', icon: 'pi pi-comment' },
    { label: 'Google Gemini', value: 'google_gemini', icon: 'pi pi-google' },
    { label: 'Mistral', value: 'mistral', icon: 'pi pi-star' },
    { label: 'LangChain', value: 'langchain', icon: 'pi pi-link' },
    { label: 'OpenAI Agents SDK', value: 'openai_agents', icon: 'pi pi-users' },
    { label: 'CrewAI', value: 'crewai', icon: 'pi pi-sitemap' },
    { label: 'LlamaIndex', value: 'llamaindex', icon: 'pi pi-search' },
    { label: 'OpenTelemetry', value: 'otel', icon: 'pi pi-chart-bar' },
    { label: 'Google ADK', value: 'google_adk', icon: 'pi pi-android' },
    { label: 'Claude Code', value: 'claude_code', icon: 'pi pi-code' },
    { label: 'Environment Variables', value: 'env_vars', icon: 'pi pi-cog' },
  ]
  selectedIntegration = 'openai'
  integrateWorkspace: any = null
  integrateProject: any = null

  constructor(
    private orgService: OrgService,
    private appService: AppService,
    private queueService: QueueService,
    private datasetService: DatasetService,
    private metaService: Meta,
    private titleService: Title,
    private messageService: MessageService,
    public layoutService: LayoutService,
    private clipboard: Clipboard
  ) {}

  ngOnInit(): void {
    this.checkSaaSMode()
    this.populateApps()
    this.titleService.setTitle('FlowX.AI Observatory - Home')
    this.metaService.updateTag({
      name: 'description',
      content: 'The ultimate LLM observatory for AI Agents.',
    })
  }

  checkSaaSMode(): void {
    this.orgService.getOrgsWithApps()
      .then(orgs => {
        // If we successfully got orgs, we can check the API
        fetch('/api/v1/observatory/info')
          .then(res => res.json())
          .then(data => {
            this.isSaaSMode = data.saas_env || false
          })
          .catch(() => {
            this.isSaaSMode = false
          })
      })
      .catch(() => {
        this.isSaaSMode = false
      })
  }

  populateApps(): void {
    this.orgService.getOrgsWithApps().then(async (data) => {
      this.orgs = data
      if (!this.orgs || this.orgs.length === 0) {return}

      const { org, workspace, app_id } = this.getDefaultAppOrg(this.orgs)
      if (!org) {return}

      this.selectedOrg = org.id
      this.workspaces = this.getWorkspaces(org.id)
      this.selectedWorkspace = workspace?.id || null

      const appsStats = await this.appService.getAppStats(org.id)

      this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
        .sort((a: any, b: any) => b.is_default - a.is_default)

      this.datasets = (org.datasets || []).filter(
        (dataset: any) => dataset.is_active === true
      )

      this.apps.forEach((app) => {
        const stats = appsStats?.find((s: any) => s.project_id === app.id)
        if (stats) {
          app.stats = { ...stats }
        }
      })

      this.selectedApp = app_id
    })
  }

  getAPIKeys(org_id: string): any {
    if (!org_id || !Array.isArray(this.orgs)) {
      return []
    }
    return this.orgs.find((item) => item.id === org_id)?.api_keys || []
  }

  getWorkspaces(org_id: string): any[] {
    const org = this.orgs?.find((item) => item.id === org_id)
    return org?.workspaces || []
  }

  getAppsFromWorkspace(org: any, workspace_id: any): any[] {
    if (workspace_id) {
      const ws = org?.workspaces?.find((w: any) => w.id === workspace_id)
      return (ws?.projects || []).filter((app: any) => app.is_active === true)
    }
    return (org?.projects || []).filter((app: any) => app.is_active === true)
  }

  getApps(org_id: string): any {
    return (
      this.orgs
        ?.find((item) => item.id === org_id)
        ?.projects?.filter((app: any) => app.is_active === true) || []
    )
  }

  getDatasets(org_id: string): any {
    return (
      this.orgs
        ?.find((item) => item.id === org_id)
        ?.datasets?.filter((dataset: any) => dataset.is_active === true) || []
    )
  }

  orgChanged(event: any): void {
    this.workspaces = this.getWorkspaces(event.value)
    this.selectedWorkspace = this.workspaces?.[0]?.id || null

    const org = this.orgs?.find((item) => item.id === event.value)
    this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
    this.datasets = this.getDatasets(event.value)
    this.selectedApp = this.apps[0]?.id

    // Reload stats for the new org
    this.appService.getAppStats(event.value).then((appsStats) => {
      this.apps.forEach((app) => {
        const stats = appsStats?.find((s: any) => s.project_id === app.id)
        if (stats) {
          app.stats = { ...stats }
        }
      })
    })
  }

  workspaceChanged(event: any): void {
    const org = this.orgs?.find((item) => item.id === this.selectedOrg)
    this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
      .sort((a: any, b: any) => b.is_default - a.is_default)
    this.selectedApp = this.apps?.[0]?.id

    // Reload stats
    this.appService.getAppStats(this.selectedOrg).then((appsStats) => {
      this.apps.forEach((app) => {
        const stats = appsStats?.find((s: any) => s.project_id === app.id)
        if (stats) {
          app.stats = { ...stats }
        }
      })
    })
  }

  getDefaultAppOrg(orgs: any[]): any {
    let default_app = null
    let parent_org = null
    let parent_workspace = null

    // Search within workspaces first
    orgs.forEach((org) => {
      org.workspaces?.forEach((ws: any) => {
        ws.projects?.forEach((app: any) => {
          if (app.is_default) {
            default_app = app.id
            parent_org = org
            parent_workspace = ws
          }
        })
      })
    })

    // Fallback to org.projects
    if (!parent_org && !default_app) {
      orgs.forEach((org) => {
        org.projects?.forEach((app: any) => {
          if (app.is_default) {
            default_app = app.id
            parent_org = org
          }
        })
      })
    }

    // Fallback to first org/workspace/project
    if (!parent_org && !default_app) {
      parent_org = orgs[0]
      if (parent_org?.workspaces?.length > 0) {
        parent_workspace = parent_org.workspaces[0]
        default_app = parent_workspace?.projects?.[0]?.id
      } else {
        default_app = parent_org?.projects?.[0]?.id
      }
    }

    return { org: parent_org, workspace: parent_workspace, app_id: default_app }
  }

  // Aggregate stats methods
  getTotalRuns(): number {
    if (!this.apps || this.apps.length === 0) {return 0}
    return this.apps.reduce((total, app) => total + (app.stats?.run_cnt || 0), 0)
  }

  getTotalAgents(): number {
    if (!this.apps || this.apps.length === 0) { return 0 }
    return this.apps.reduce((total, app) => total + (app.stats?.agent_cnt || 0), 0)
  }

  getAvgLatency(): string {
    if (!this.apps || this.apps.length === 0) {return '0'}
    const appsWithLatency = this.apps.filter(
      (app) => app.stats?.p50_latency != null
    )
    if (appsWithLatency.length === 0) {return '0'}

    const totalLatency = appsWithLatency.reduce((total, app) => total + (processDuration(app.stats.p50_latency) || 0), 0)

    return (totalLatency / appsWithLatency.length).toFixed(2)
  }

  reloadAll(_____event: any): void {
    this.populateApps()
  }

  // Organization CRUD
  async saveOrganization(): Promise<void> {
    if (!this.newOrganizationName.trim()) {return}

    const new_organization = await this.orgService.createOrg(
      this.newOrganizationName
    )
    if (new_organization) {
      this.messageService.clear()
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Organization successfully created!',
      })
      this.populateApps()
      this.visibleOrganization = false
      this.newOrganizationName = ''
    }
  }

  showDialogOrganization(): void {
    this.newOrganizationName = ''
    this.visibleOrganization = true
  }

  closeDialogOrganization(): void {
    this.visibleOrganization = false
  }

  // Project CRUD
  showDialogProject(): void {
    this.newProjectName = ''
    this.visibleProject = true
  }

  closeDialogProject(): void {
    this.visibleProject = false
  }

  async saveProject(): Promise<void> {
    if (!this.newProjectName.trim()) {return}

    const new_project = await this.appService.createApp(
      this.newProjectName,
      this.selectedOrg,
      this.selectedWorkspace
    )
    if (new_project) {
      this.messageService.clear()
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Project successfully created!',
      })
      this.populateApps()
      this.visibleProject = false
      this.newProjectName = ''
    }
  }

  // Dataset CRUD
  showDialogDataset(): void {
    this.newDatasetName = ''
    this.visibleDataset = true
  }

  closeDialogDataset(): void {
    this.visibleDataset = false
  }

  async saveDataset(): Promise<void> {
    if (!this.newDatasetName.trim()) {return}

    const new_dataset = await this.datasetService.createDataset(
      this.newDatasetName,
      this.selectedOrg
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
      this.newDatasetName = ''
    }
  }

  // Queue CRUD
  showDialogQueue(): void {
    this.newQueueName = ''
    this.visibleQueue = true
  }

  closeDialogQueue(): void {
    this.visibleQueue = false
  }

  async saveQueue(): Promise<void> {
    if (!this.newQueueName.trim()) {return}

    const new_queue = await this.queueService.createQueue(
      this.newQueueName,
      this.selectedOrg
    )
    if (new_queue) {
      this.messageService.clear()
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Queue successfully created!',
      })
      this.populateApps()
      this.visibleQueue = false
      this.newQueueName = ''
    }
  }

  // Clipboard
  public copyToClipboard(event: any, value: string): void {
    const successful = this.clipboard.copy(value)
    if (successful) {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied',
        detail: 'Copied to clipboard',
        life: 3000,
      })
    }
  }

  // Workspace CRUD (only for default org)
  isDefaultOrg(): boolean {
    return this.selectedOrg === this.DEFAULT_ORG_ID
  }

  showDialogWorkspace(): void {
    this.newWorkspaceName = ''
    this.visibleWorkspace = true
  }

  closeDialogWorkspace(): void {
    this.visibleWorkspace = false
  }

  async saveWorkspace(): Promise<void> {
    if (!this.newWorkspaceName.trim()) { return }

    const result = await this.orgService.createWorkspace(
      this.selectedOrg,
      this.newWorkspaceName
    )
    if (result) {
      this.messageService.clear()
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Workspace successfully created!',
      })
      this.populateApps()
      this.visibleWorkspace = false
      this.newWorkspaceName = ''
    }
  }

  // Integration dialog
  showIntegrateDialog(): void {
    this.selectedIntegration = 'openai'
    this.integrateWorkspace = this.selectedWorkspace || this.workspaces?.[0]?.id || null
    this.integrateProject = this.apps?.[0]?.id || null
    this.visibleIntegrate = true
  }

  showIntegrateForProject(app: any): void {
    this.selectedIntegration = 'openai'
    this.integrateWorkspace = app.workspace_id || this.selectedWorkspace || null
    this.integrateProject = app.id
    this.visibleIntegrate = true
  }

  closeIntegrateDialog(): void {
    this.visibleIntegrate = false
  }

  getIntegrateWorkspaces(): any[] {
    return this.getWorkspaces(this.selectedOrg)
  }

  getIntegrateProjects(): any[] {
    const org = this.orgs?.find((item) => item.id === this.selectedOrg)
    if (this.integrateWorkspace) {
      const ws = org?.workspaces?.find((w: any) => w.id === this.integrateWorkspace)
      return (ws?.projects || []).filter((app: any) => app.is_active === true)
    }
    return (org?.projects || []).filter((app: any) => app.is_active === true)
  }

  integrateWorkspaceChanged(): void {
    const projects = this.getIntegrateProjects()
    this.integrateProject = projects?.[0]?.id || null
  }

  getIntegrationCode(): string {
    const orgId = this.selectedOrg || 'YOUR_ORG_ID'
    const wsId = this.integrateWorkspace || 'YOUR_WORKSPACE_ID'
    const projId = this.integrateProject || 'YOUR_PROJECT_ID'
    const apiKey = this.getAPIKeys(this.selectedOrg)?.[0]?.value || 'YOUR_API_KEY'
    const apiUrl = window.location.origin

    switch (this.selectedIntegration) {
      case 'openai':
        return `pip install flowxObservatory[openai]

from openai import OpenAI
from flowxobservatory import configure
from flowxobservatory.wrappers import wrap_openai

# Configure Observatory
configure(
    org_id="${orgId}",
    workspace_id="${wsId}",
    project_id="${projId}",
    api_url="${apiUrl}",
    api_key="${apiKey}"
)

# Wrap your OpenAI client
client = OpenAI()
wrap_openai(client)

# All calls are now traced
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}]
)`

      case 'anthropic':
        return `pip install flowxObservatory[anthropic]

from anthropic import Anthropic
from flowxobservatory import configure
from flowxobservatory.wrappers import wrap_anthropic

configure(
    org_id="${orgId}",
    workspace_id="${wsId}",
    project_id="${projId}",
    api_url="${apiUrl}",
    api_key="${apiKey}"
)

client = Anthropic()
wrap_anthropic(client)

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)`

      case 'google_gemini':
        return `pip install flowxObservatory[google-genai]

import google.generativeai as genai
from flowxobservatory import configure
from flowxobservatory.wrappers import wrap_google_gemini

configure(
    org_id="${orgId}",
    workspace_id="${wsId}",
    project_id="${projId}",
    api_url="${apiUrl}",
    api_key="${apiKey}"
)

model = genai.GenerativeModel("gemini-pro")
wrap_google_gemini(model)

response = model.generate_content("Hello!")`

      case 'mistral':
        return `pip install flowxObservatory[mistral]

from mistralai import Mistral
from flowxobservatory import configure
from flowxobservatory.wrappers import wrap_mistral

configure(
    org_id="${orgId}",
    workspace_id="${wsId}",
    project_id="${projId}",
    api_url="${apiUrl}",
    api_key="${apiKey}"
)

client = Mistral(api_key="your-mistral-key")
wrap_mistral(client)

response = client.chat.complete(
    model="mistral-large-latest",
    messages=[{"role": "user", "content": "Hello!"}]
)`

      case 'langchain':
        return `pip install flowxObservatory[langchain]

from langchain_openai import ChatOpenAI
from flowxobservatory.integrations.langchain import FlowxObservatoryCallbackHandler

handler = FlowxObservatoryCallbackHandler(
    org_id="${orgId}",
    workspace_id="${wsId}",
    app_id="${projId}",
    api_url="${apiUrl}",
    api_key="${apiKey}"
)

llm = ChatOpenAI(model="gpt-4", callbacks=[handler])
response = llm.invoke("Hello!")`

      case 'openai_agents':
        return `pip install flowxObservatory[openai-agents]

from agents import Agent, Runner, set_trace_processors
from flowxobservatory import configure
from flowxobservatory.integrations.openai_agents import ObservatoryTracingProcessor

configure(
    org_id="${orgId}",
    workspace_id="${wsId}",
    project_id="${projId}",
    api_url="${apiUrl}",
    api_key="${apiKey}"
)

processor = ObservatoryTracingProcessor()
set_trace_processors([processor])

agent = Agent(name="my-agent", model="gpt-4")
result = Runner.run_sync(agent, "Hello!")`

      case 'crewai':
        return `pip install flowxObservatory[crewai]

from flowxobservatory import configure
from flowxobservatory.integrations.crewai import instrument_crewai

configure(
    org_id="${orgId}",
    workspace_id="${wsId}",
    project_id="${projId}",
    api_url="${apiUrl}",
    api_key="${apiKey}"
)

instrument_crewai()

# Now use CrewAI normally — all calls are traced
from crewai import Agent, Task, Crew
agent = Agent(role="analyst", goal="analyze data")
task = Task(agent=agent, description="Analyze the dataset")
crew = Crew(agents=[agent], tasks=[task])
crew.kickoff()`

      case 'llamaindex':
        return `pip install flowxObservatory[llamaindex]

from llama_index.core import Settings
from flowxobservatory import configure
from flowxobservatory.integrations.llamaindex import ObservatoryCallbackHandler

configure(
    org_id="${orgId}",
    workspace_id="${wsId}",
    project_id="${projId}",
    api_url="${apiUrl}",
    api_key="${apiKey}"
)

handler = ObservatoryCallbackHandler()
Settings.callback_manager.add_handler(handler)

# Now use LlamaIndex as normal — all calls are traced`

      case 'otel':
        return `pip install flowxObservatory

from opentelemetry.sdk.trace import TracerProvider
from flowxobservatory import configure
from flowxobservatory.integrations.otel import ObservatorySpanProcessor

configure(
    org_id="${orgId}",
    workspace_id="${wsId}",
    project_id="${projId}",
    api_url="${apiUrl}",
    api_key="${apiKey}"
)

provider = TracerProvider()
provider.add_span_processor(ObservatorySpanProcessor())

# Works with any OTEL-instrumented framework:
# AutoGen, Semantic Kernel, PydanticAI, etc.`

      case 'google_adk':
        return `pip install flowxObservatory[google-adk]

from flowxobservatory import configure
from flowxobservatory.integrations.google_adk import instrument_google_adk

configure(
    org_id="${orgId}",
    workspace_id="${wsId}",
    project_id="${projId}",
    api_url="${apiUrl}",
    api_key="${apiKey}"
)

instrument_google_adk()

# Now use Google ADK normally — all calls are traced`

      case 'claude_code':
        return `pip install flowxObservatory

# Option 1: Trace an existing Claude Code transcript
from flowxobservatory.integrations.claude_code import trace_claude_code_session

trace_claude_code_session(
    transcript_path="/path/to/.claude/transcripts/session.json",
    session_id="session-123",
    org_id="${orgId}",
    project_id="${projId}"
)

# Option 2: Enable automatic tracing via environment
export FLOWX_OBSERVATORY_TRACE_CLAUDE_CODE=true
export FLOWX_OBSERVATORY_ORG_ID=${orgId}
export FLOWX_OBSERVATORY_APP_ID=${projId}
export FLOWX_OBSERVATORY_API_URL=${apiUrl}
export FLOWX_OBSERVATORY_API_KEY=${apiKey}`

      case 'env_vars':
        return `# Set these environment variables in your shell or .env file

export FLOWX_OBSERVATORY_ORG_ID=${orgId}
export FLOWX_OBSERVATORY_WORKSPACE_ID=${wsId}
export FLOWX_OBSERVATORY_APP_ID=${projId}
export FLOWX_OBSERVATORY_API_URL=${apiUrl}
export FLOWX_OBSERVATORY_API_KEY=${apiKey}

# Enable tracing
export OBSERVATORY_TRACING=true

# Then in your Python code, just import and use:
from flowxobservatory import configure
configure()  # Reads from environment variables automatically`

      default:
        return ''
    }
  }

  copyIntegrationCode(): void {
    const code = this.getIntegrationCode()
    this.copyToClipboard(null, code)
  }
}
