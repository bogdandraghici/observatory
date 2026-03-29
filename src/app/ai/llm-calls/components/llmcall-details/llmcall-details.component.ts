import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
} from '@angular/core'
import { Drawer } from 'primeng/drawer'
import { MessageService, TreeNode } from 'primeng/api'
import { DashboardService } from 'src/app/ai/services/dashboard.service'

import { DomSanitizer } from '@angular/platform-browser'
import { getDuration, formatTime } from 'src/app/ai/utils/time'

import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'
import { RunService } from 'src/app/ai/services/runs.service'
import { AppConfigService } from 'src/app/app.config'
import mermaid from 'mermaid'
import { isPlatformBrowser } from '@angular/common'

interface _KeyValuePair {
  key: string
  score: number
  valid: boolean
}
@Component({
    selector: 'llmcall-details',
    templateUrl: './llmcall-details.component.html',
    styleUrl: './llmcall-details.component.scss',
    providers: [MessageService],
    standalone: false
})
export class LLMCallDetailsComponent implements OnInit, OnChanges {
  @ViewChild('sidebarRef') sidebarRef!: Drawer
  @ViewChild('mermaid') mermaid: ElementRef
  @Input() sidebarVisible = false
  @Input() selectedLLMCall: any
  @Output() showChanged = new EventEmitter<boolean>()

  runs!: TreeNode[]
  dataRuns: any[] = []

  selectedRun!: TreeNode
  selectedTableRun: any

  activeTab = 'run'
  waterfallData: any[] = []

  imagePreview: any

  formatTime = formatTime

  editorTheme: any = 'vs-light'


  getCodeModel(value: object): any {
    if (!value) {
      return 'N/A'
    }
    return JSON.stringify(value, null, 2)
  }

  constructor(
    private analyticsService: DashboardService,
    private cd: ChangeDetectorRef,
    public layoutService: LayoutService,
    private messageService: MessageService,
    private runService: RunService,
    private readonly appConfigService: AppConfigService,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private _platformId: object,
  ) {
    this.appConfigService.forcedTheme$.subscribe({
      next: (theme) => {
        if (theme === 'dark') {
          this.editorTheme = 'vs-dark'
        } else {
          this.editorTheme = 'vs-light'
        }
      },
    })
  }

  drawMermaid(): void {
    if (isPlatformBrowser(this._platformId) && this.selectedRun?.data?.graph) {
      setTimeout(async () => {
        let renderGraph = this.selectedRun?.data?.graph.replace(
          "%%{init: {'flowchart': {'curve': 'linear'}}}%%",
          '',
        )
        while (renderGraph.includes(':::current:::current')) {
          renderGraph = renderGraph.replace(
            ':::current:::current',
            ':::current',
          )
        }
        while (
          renderGraph.includes(
            '	classDef current fill:#feb913\n	classDef current fill:#feb913',
          )
        ) {
          renderGraph = renderGraph.replace(
            '	classDef current fill:#feb913\n	classDef current fill:#feb913',
            '	classDef current fill:#feb913',
          )
        }
        renderGraph = renderGraph.replaceAll(
          'fill-opacity:0',
          'fill-opacity:1',
        )
        const result = await mermaid.render('mermaid', renderGraph)
        const element: any = this.mermaid?.nativeElement
        element.innerHTML = result.svg
        result.bindFunctions(element)
      }, 100)
    }
  }

  onNodeSelect(event: any): void {
    this.selectedRun = event.node
    this.getImageFromInput({input: this.selectedRun?.data?.input})
    this.drawMermaid()
  }

  closeCallback(e: any): void {
    this.sidebarRef.close(e)
    this.showChanged.emit(false)
  }

  ngOnInit(): void {
    const config = {
      startOnLoad: true,
      flowchart: {
        useWidth: 400,
        useMaxWidth: false,
        htmlLabels: true,
        curve: 'cardinal',
      },
      securityLevel: 'loose',
    }
    mermaid.initialize(config)
    mermaid.init()
  }

  populateData(request_id: any): void {
    this.activeTab = 'run'
    this.analyticsService.getRunsByRequestId(request_id).then((data) => {
      this.dataRuns = data
      this.dataRuns = this.dataRuns.map((item) => {
        item.duration = getDuration(item)
        if (item.duration > 8) {
          item.latency = 'danger'
        } else if (item.duration > 4) {
          item.latency = 'warning'
        } else {
          item.latency = 'success'
        }
        item.input_text = this.tryParse(typeof item.input === 'object' && item.input !== null ? { ...item.input } : item.input, 'input')
        item.output_text = this.tryParse(typeof item.output === 'object' && item.output !== null ? { ...item.output } : item.output, 'output')
        return item
      })
      this.runs = this.generateTreeData()
      this.computeWaterfall()
      this.cd.markForCheck()
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedLLMCall']?.currentValue) {
      const llmCall = changes['selectedLLMCall']?.currentValue
      this.populateData(llmCall['request_id'])
    } else {
      this.runs = []
      this.selectedRun = null
      this.imagePreview = null
      this.drawMermaid()
    }
    this.drawMermaid()
  }

  generateTreeData(): any {
    const parents = this.dataRuns.filter((node) => !node.parent_run)
    const list = []
    parents.map((parent) => {
      list.push(this.generateNode(parent))
    })
    // Select root node explicitly
    if (list.length > 0) {
      this.selectedRun = list[0]
      this.getImageFromInput({ input: this.selectedRun?.data?.input })
      this.drawMermaid()
    }
    return list
  }

  generateNode(item: any): any {
    const childrens = this.dataRuns.filter(
      (node) => node.parent_run === item.id,
    )
    const generatedNode = {
      key: item.id,
      label: item.name,
      iconData: 'pi pi-fw pi-inbox',
      data: item,
      expanded: true,
      children: childrens.map((node) => this.generateNode(node)),
    }
    return generatedNode
  }

  tryParse(prompt: any, type: any): any {
    // generate object
    prompt = this.parseTextToJson(prompt)
    prompt = this.replaceUrl(prompt)
    if (prompt instanceof Array) {
      if (prompt.length > 1) {
        const filterData = []
        prompt.forEach((item) => {
          if (!item.image_url) {
            filterData.push(item)
          }
        })
        return filterData
      } else if (prompt.length === 1) {
        const aiData = this.getByRole(prompt, 'ai')
        if (aiData) {
          aiData.text = this.parseTextToJson(aiData?.text)
          return aiData
        }
      }
    }
    if (type === 'output') {
      if (prompt instanceof Object) {
        if (prompt) {
          prompt.response = this.parseTextToJson(prompt.response)

          return prompt
        }
      }
    }
    return this.parseTextToJson(prompt)
  }

  replaceUrl(obj: any): any {
    // Check if obj is an object or array to avoid processing non-object types
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          // If the key is "url", replace the value with an empty string
          if (key === 'url' && obj[key].indexOf('data:image') !== -1) {
            // obj[key] = 'base64-image';
          }
          // If the value is an object, recursively call replaceUrl
          else if (typeof obj[key] === 'object') {
            this.replaceUrl(obj[key])
          }
        }
      }
    }
    return obj
  }
  tabChanged(_____event: any): void {
    this.getImageFromInput({input: this.selectedRun?.data?.input})
  }
  getImageFromInput(obj: any): any {
    // Check if obj is an object or array to avoid processing non-object types
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          // If the key is "url", replace the value with an empty string
          if (key === 'url' && obj[key].indexOf('data:image') !== -1) {
            this.imagePreview = this.sanitizer.bypassSecurityTrustUrl(obj[key])
          }
          // If the value is an object, recursively call replaceUrl
          else if (typeof obj[key] === 'object') {
            this.getImageFromInput(obj[key])
          }
        }
      }
    }
    return obj
  }

  parseTextToJson(text: any): any {
    try {
      return JSON.parse(text)
    } catch (ex) {
      return text
    }
  }

  getByRole(array: any, role: any): any {
    return array.find((item) => item.role === role)
  }

  async setCorrectness(event: any, run: any, correctness: any): Promise<void> {
    await this.runService.setCorrectness(run?.data?.request_id, correctness)
    run.data.correctness = correctness
  }

  objectEntries(obj: any): any {
    return Object.entries(obj)
  }

  // --- Ported from execution-detail ---

  getNodeIcon(type: string): string {
    switch (type) {
      case 'llm': return 'faSolidBrain'
      case 'chain': case 'agent': return 'faSolidLink'
      case 'retriever': return 'faSolidRectangleList'
      case 'tool': return 'faSolidWrench'
      case 'node': return 'faSolidCubes'
      default: return 'faSolidLink'
    }
  }

  getTypeSeverity(type: string): string {
    switch (type) {
      case 'llm': return 'warn'
      case 'tool': return 'info'
      case 'retriever': return 'info'
      case 'chain': case 'agent': return 'secondary'
      case 'node': return 'contrast'
      default: return 'secondary'
    }
  }

  getNodeTypeColor(nodeType: string): string {
    if (!nodeType) {return '#9CA3AF'}
    switch (nodeType.toUpperCase()) {
      case 'EXTRACT_TXT': return '#3B82F6'
      case 'CONDITION': return '#F59E0B'
      case 'GENERATION': case 'UNDERSTANDING': case 'CONVERSATION': return '#8B5CF6'
      case 'CUSTOMPYTHON': return '#10B981'
      case 'STT': return '#14B8A6'
      case 'TTS': return '#EC4899'
      case 'WORKFLOW': return '#6366F1'
      case 'AGGREGATOR': return '#F97316'
      case 'EXTRACT_WEB': case 'BROWSER_AUTOMATION': return '#06B6D4'
      case 'START': case 'END': return '#6B7280'
      default: return '#9CA3AF'
    }
  }

  getTraceOcrSummary(): any {
    if (!this.dataRuns || this.dataRuns.length === 0) {return null}
    for (const run of this.dataRuns) {
      const ocr = this.getOcrData(run)
      if (ocr) {return ocr}
    }
    return null
  }

  getOcrData(data: any): any {
    if (!data) {return null}
    // Check dedicated columns first (populated after backend fix)
    if (data.ocr_mean_score != null || data.doc_confidence != null || data.page_count != null) {
      return {
        ocr_mean_score: data.ocr_mean_score,
        doc_confidence: data.doc_confidence,
        page_count: data.page_count,
        ocr_low_score: data.ocr_low_score,
      }
    }
    // Fallback: check params (extra dict stored as JSON)
    const params = data.params
    if (params && typeof params === 'object') {
      if (params.ocr_mean_score != null || params.doc_confidence != null || params.page_count != null) {
        return {
          ocr_mean_score: params.ocr_mean_score,
          doc_confidence: params.doc_confidence,
          page_count: params.page_count,
          ocr_low_score: params.ocr_low_score,
        }
      }
    }
    return null
  }

  formatCost(cost: number): string {
    if (cost == null || cost === 0) {return '-'}
    if (cost < 0.0001) {return '< $0.0001'}
    return '$' + cost.toFixed(4)
  }

  getTotalDuration(): number {
    const root = this.dataRuns.find((r) => !r.parent_run)
    return root?.duration ?? 0
  }

  getTotalTokens(): number {
    return this.dataRuns.reduce((sum, r) => sum + (r.prompt_tokens || 0) + (r.completion_tokens || 0), 0)
  }

  getTotalCost(): number {
    return this.dataRuns.reduce((sum, r) => sum + (r.cost || 0), 0)
  }

  getTypeStats(): { type: string; count: number }[] {
    const counts: Record<string, number> = {}
    this.dataRuns.forEach((r) => {
      const type = r.type || 'unknown'
      counts[type] = (counts[type] || 0) + 1
    })
    return Object.entries(counts).map(([type, count]) => ({ type, count }))
  }

  getParentName(parentId: string): string {
    const parent = this.dataRuns.find((r) => r.id === parentId)
    return parent ? parent.name : parentId?.substring(0, 8) + '...'
  }

  findTreeNodeByKey(nodes: TreeNode[], key: string): TreeNode | null {
    for (const node of nodes || []) {
      if (node.key === key) {return node}
      const found = this.findTreeNodeByKey(node.children, key)
      if (found) {return found}
    }
    return null
  }

  onTableRowSelect(event: any): void {
    const run = event.data
    const treeNode = this.findTreeNodeByKey(this.runs, run.id)
    if (treeNode) {
      this.selectedRun = treeNode
    }
    this.activeTab = 'run'
    this.getImageFromInput({ input: this.selectedRun?.data?.input })
    this.drawMermaid()
  }

  computeWaterfall(): void {
    if (!this.dataRuns || this.dataRuns.length === 0) {
      this.waterfallData = []
      return
    }

    const startedAt = Math.min(...this.dataRuns.map(r => new Date(r.created_at).getTime()))
    const endedAt = Math.max(...this.dataRuns.map(r => {
      const start = new Date(r.created_at).getTime()
      const dur = (r.latency_ms || r.duration * 1000 || 0)
      return start + dur
    }))

    const totalDuration = endedAt - startedAt
    if (totalDuration <= 0) {
      this.waterfallData = []
      return
    }

    const depthMap: Record<string, number> = {}
    const getDepth = (run: any): number => {
      if (depthMap[run.id] != null) {return depthMap[run.id]}
      if (!run.parent_run) {
        depthMap[run.id] = 0
        return 0
      }
      const parent = this.dataRuns.find(r => r.id === run.parent_run)
      depthMap[run.id] = parent ? getDepth(parent) + 1 : 0
      return depthMap[run.id]
    }

    this.waterfallData = this.dataRuns.map(run => {
      const runStart = new Date(run.created_at).getTime()
      const durationMs = run.latency_ms || (run.duration ? run.duration * 1000 : 0)
      const leftPct = ((runStart - startedAt) / totalDuration) * 100
      const widthPct = Math.max((durationMs / totalDuration) * 100, 1)
      const color = this.getTypeColor(run.type)
      const depth = getDepth(run)

      return {
        ...run,
        leftPct: Math.max(0, Math.min(leftPct, 100)),
        widthPct: Math.min(widthPct, 100 - Math.max(0, leftPct)),
        color,
        depth,
        durationMs,
      }
    })
  }

  readonly typeColorMap: Record<string, string> = {
    node: '#8B5CF6',
    chain: '#6B7280',
    llm: '#F59E0B',
    tool: '#3B82F6',
    retriever: '#10B981',
  }

  private getTypeColor(type: string): string {
    if (type === 'agent') {return this.typeColorMap['chain']}
    return this.typeColorMap[type] || '#9CA3AF'
  }

  getWaterfallLegend(): { type: string; color: string }[] {
    const present = new Set(this.dataRuns.map(r => r.type))
    return Object.entries(this.typeColorMap)
      .filter(([type]) => present.has(type))
      .map(([type, color]) => ({ type, color }))
  }
}
