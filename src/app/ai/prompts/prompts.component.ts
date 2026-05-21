import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core'
import { PromptService } from '../services/prompts.service'
import { OrgService } from '../services/orgs.service'
import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'
import { Meta, Title } from '@angular/platform-browser'
import { MessageService } from 'primeng/api'
import { resolveDefaultAppOrg } from '../utils/default-app'

@Component({
    templateUrl: './prompts.component.html',
    standalone: false,
    providers: [MessageService],
})
export class PromptsComponent implements OnInit, OnDestroy {
  @ViewChild('diffContainer') diffContainer!: ElementRef

  private diffEditor: any = null
  private monacoLoaded = false
  diffSideBySide = true
  orgs: any[] = []
  selectedOrg: any
  workspaces: any[] = []
  selectedWorkspace: any
  apps: any[] = []
  selectedApp: any = null

  activeTab = '0'

  // Detected prompts
  detectedPrompts: any[] = []

  // Managed prompts
  managedPrompts: any[] = []

  // Version history drawer
  showHistory = false
  historyPrompts: any[] = []
  selectedPromptName = ''
  selectedHistoryVersion: any = null

  // Diff drawer
  showDiff = false
  diffA: any = null
  diffB: any = null

  // Prompt dialog
  promptDialogVisible = false
  promptEditMode = false
  promptForm: any = {}

  constructor(
    private promptService: PromptService,
    private orgService: OrgService,
    public layoutService: LayoutService,
    private metaService: Meta,
    private titleService: Title,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('FlowX.AI Observatory - Prompts')
    this.metaService.updateTag({ name: 'description', content: 'System prompt management and auto-detection.' })
    this.populateOrgs()
  }

  getWorkspaces(org_id: any): any[] {
    const org = this.orgs?.find((item: any) => item.id === org_id)
    return org?.workspaces || []
  }

  getAppsFromWorkspace(org: any, workspace_id: any): any[] {
    if (workspace_id) {
      const ws = org?.workspaces?.find((w: any) => w.id === workspace_id)
      return (ws?.projects || []).filter((a: any) => a.is_active)
    }
    return (org?.projects || []).filter((a: any) => a.is_active)
  }

  getDefaultAppOrg(): { org: any, workspace: any, app: any } {
    return resolveDefaultAppOrg(this.orgs)
  }

  populateOrgs(): void {
    this.orgService.getOrgsWithApps().then((data: any) => {
      this.orgs = data || []
      if (this.orgs.length > 0) {
        const { org, workspace, app } = this.getDefaultAppOrg()
        this.selectedOrg = org?.id
        this.workspaces = this.getWorkspaces(org?.id)
        this.selectedWorkspace = workspace?.id || null
        this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
        this.selectedApp = app?.id || null
        this.loadAll()
      }
    })
  }

  orgChanged(): void {
    const org = this.orgs.find((o: any) => o.id === this.selectedOrg)
    this.workspaces = this.getWorkspaces(this.selectedOrg)
    this.selectedWorkspace = this.workspaces.length > 0 ? this.workspaces[0].id : null
    this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
    this.selectedApp = this.apps.length > 0 ? this.apps[0].id : null
    this.loadAll()
  }

  workspaceChanged(event: any): void {
    const org = this.orgs.find((o: any) => o.id === this.selectedOrg)
    this.apps = this.getAppsFromWorkspace(org, this.selectedWorkspace)
    this.selectedApp = this.apps.length > 0 ? this.apps[0].id : null
    this.loadAll()
  }

  appChanged(): void {
    this.loadAll()
  }

  loadAll(): void {
    this.loadDetectedPrompts()
    this.loadManagedPrompts()
  }

  async loadDetectedPrompts(): Promise<void> {
    if (!this.selectedApp) {
      this.detectedPrompts = []
      return
    }
    const data = await this.promptService.getDetectedPrompts(this.selectedApp)
    this.detectedPrompts = Array.isArray(data) ? data : []
  }

  async loadManagedPrompts(): Promise<void> {
    if (!this.selectedOrg) {
      this.managedPrompts = []
      return
    }
    const data = await this.promptService.getAllPrompts(this.selectedOrg)
    this.managedPrompts = Array.isArray(data) ? data : []
  }

  async viewHistory(prompt: any): Promise<void> {
    this.selectedPromptName = prompt.name
    const data = await this.promptService.getDetectedPromptHistory(
      this.selectedApp,
      prompt.agent,
      prompt.model_name,
    )
    this.historyPrompts = Array.isArray(data) ? data : []
    this.selectedHistoryVersion = this.historyPrompts.length > 0 ? this.historyPrompts[0] : null
    this.showHistory = true
  }

  async viewManagedHistory(prompt: any): Promise<void> {
    this.selectedPromptName = prompt.name
    const data = await this.promptService.getPromptsByName(prompt.name)
    this.historyPrompts = Array.isArray(data) ? data : []
    this.selectedHistoryVersion = this.historyPrompts.length > 0 ? this.historyPrompts[0] : null
    this.showHistory = true
  }

  async viewDiff(a: any, b: any): Promise<void> {
    const data = await this.promptService.getPromptDiff(a.id, b.id)
    if (data) {
      this.diffA = data.a
      this.diffB = data.b
      this.showDiff = true
      // Wait for DOM to render, then initialize Monaco
      setTimeout(() => this.initDiffEditor(), 100)
    }
  }

  private async loadMonaco(): Promise<void> {
    if (this.monacoLoaded) return
    return new Promise<void>((resolve) => {
      const win = window as any
      if (win.monaco) {
        this.monacoLoaded = true
        resolve()
        return
      }
      const onGotAmdLoader = () => {
        win.require.config({ paths: { vs: 'assets/monaco/vs' } })
        win.require(['vs/editor/editor.main'], () => {
          this.monacoLoaded = true
          resolve()
        })
      }
      if (win.require) {
        onGotAmdLoader()
      } else {
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = 'assets/monaco/vs/loader.js'
        script.addEventListener('load', onGotAmdLoader)
        document.body.appendChild(script)
      }
    })
  }

  private async initDiffEditor(): Promise<void> {
    await this.loadMonaco()
    const container = this.diffContainer?.nativeElement
    if (!container) return

    this.disposeDiffEditor()

    const monaco = (window as any).monaco
    const isDark = this.layoutService.config().colorScheme === 'dark'

    const originalModel = monaco.editor.createModel(this.diffB?.content || '', 'plaintext')
    const modifiedModel = monaco.editor.createModel(this.diffA?.content || '', 'plaintext')

    this.diffEditor = monaco.editor.createDiffEditor(container, {
      readOnly: true,
      renderSideBySide: this.diffSideBySide,
      automaticLayout: true,
      theme: isDark ? 'vs-dark' : 'vs',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      fontSize: 13,
      lineHeight: 20,
    })

    this.diffEditor.setModel({
      original: originalModel,
      modified: modifiedModel,
    })
  }

  toggleDiffLayout(): void {
    this.diffSideBySide = !this.diffSideBySide
    if (this.diffEditor) {
      this.diffEditor.updateOptions({ renderSideBySide: this.diffSideBySide })
    }
  }

  private disposeDiffEditor(): void {
    if (this.diffEditor) {
      const model = this.diffEditor.getModel()
      if (model) {
        model.original?.dispose()
        model.modified?.dispose()
      }
      this.diffEditor.dispose()
      this.diffEditor = null
    }
  }

  ngOnDestroy(): void {
    this.disposeDiffEditor()
  }

  // ── Managed Prompt CRUD ─────────────────────────

  createPrompt(): void {
    this.promptEditMode = false
    this.promptForm = {
      name: '',
      agent: '',
      llm_provider: '',
      llm_name: '',
      content: '',
      prompt_type: 'system',
      tags: [],
      is_active: true,
    }
    this.promptDialogVisible = true
  }

  editPrompt(prompt: any): void {
    this.promptEditMode = true
    this.promptForm = {
      ...prompt,
      tags: prompt.tags || [],
      is_active: prompt.is_active !== false,
    }
    this.promptDialogVisible = true
  }

  async savePrompt(): Promise<void> {
    const tags = typeof this.promptForm.tags === 'string'
      ? this.promptForm.tags.split(',').map((s: string) => s.trim()).filter((s: string) => s)
      : (this.promptForm.tags || [])

    if (this.promptEditMode && this.promptForm.id) {
      await this.promptService.updatePrompt(
        this.promptForm.id,
        this.selectedOrg,
        this.promptForm.name,
        this.promptForm.agent,
        this.promptForm.llm_provider,
        this.promptForm.llm_name,
        this.promptForm.content,
        this.promptForm.prompt_type || 'system',
        this.promptForm.config || {},
        tags,
        this.promptForm.is_active,
      )
      this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Prompt updated (new version created)' })
    } else {
      await this.promptService.createPrompt(
        this.selectedOrg,
        this.promptForm.name,
        this.promptForm.agent,
        this.promptForm.llm_provider,
        this.promptForm.llm_name,
        this.promptForm.content,
        this.promptForm.prompt_type || 'system',
        this.promptForm.config || {},
        tags,
        this.promptForm.is_active,
      )
      this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Prompt created' })
    }
    this.promptDialogVisible = false
    this.loadManagedPrompts()
  }

  async deletePrompt(prompt: any): Promise<void> {
    await this.promptService.deletePrompt(prompt.name)
    this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Prompt deleted' })
    this.loadManagedPrompts()
  }

  truncate(text: string, len: number = 120): string {
    if (!text) return ''
    return text.length > len ? text.substring(0, len) + '...' : text
  }

  getSourceSeverity(source: string): string {
    return source === 'detected' ? 'info' : 'success'
  }

  getActiveSeverity(isActive: boolean): string {
    return isActive ? 'success' : 'secondary'
  }

  estimateTokens(content: string): number {
    if (!content) return 0
    return Math.ceil(content.length / 4)
  }
}
