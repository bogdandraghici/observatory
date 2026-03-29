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
import { TreeNode } from 'primeng/api'
import { DashboardService } from 'src/app/ai/services/dashboard.service'
import { getDuration, formatTime } from 'src/app/ai/utils/time'
import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'
import mermaid from 'mermaid'
import { CommonModule, isPlatformBrowser, JsonPipe } from '@angular/common'
import { DrawerModule } from 'primeng/drawer'
import { TreeModule } from 'primeng/tree'
import { TabsModule } from 'primeng/tabs'
import { TagModule } from 'primeng/tag'
import { MessageModule } from 'primeng/message'
import { TableModule } from 'primeng/table'
import { TooltipModule } from 'primeng/tooltip'
import { NgIconsModule } from '@ng-icons/core'
import { ButtonModule } from 'primeng/button'

@Component({
    selector: 'execution-detail',
    templateUrl: './execution-detail.component.html',
    standalone: true,
    imports: [
      CommonModule,
      JsonPipe,
      DrawerModule,
      TreeModule,
      TabsModule,
      TagModule,
      MessageModule,
      TableModule,
      TooltipModule,
      ButtonModule,
      NgIconsModule,
    ],
})
export class ExecutionDetailComponent implements OnInit, OnChanges {
  @ViewChild('sidebarRef') sidebarRef!: Drawer
  @ViewChild('mermaidEl') mermaidEl: ElementRef
  @Input() detailVisible = false
  @Input() selectedExecution: any
  @Output() detailVisibleChange = new EventEmitter<boolean>()

  runs!: TreeNode[]
  selectedRun!: TreeNode
  selectedTableRun: any
  dataRuns: any[] = []
  executionTrace: any = null
  waterfallData: any[] = []
  formatTime = formatTime
  activeTab = 'overview'

  constructor(
    private dashboardService: DashboardService,
    private cd: ChangeDetectorRef,
    public layoutService: LayoutService,
    @Inject(PLATFORM_ID) private _platformId: any,
  ) {}

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedExecution']?.currentValue) {
      const execution = changes['selectedExecution']?.currentValue
      this.activeTab = 'overview'
      this.populateData(execution['request_id'])
    } else {
      this.runs = []
      this.selectedRun = null
      this.dataRuns = []
      this.drawMermaid()
    }
  }

  closeCallback(e: any): void {
    this.sidebarRef.close(e)
    this.detailVisibleChange.emit(false)
  }

  populateData(request_id: any): void {
    this.dashboardService.getExecutionTrace(request_id).then((trace) => {
      if (trace?.runs) {
        this.executionTrace = trace
        this.dataRuns = trace.runs
      } else {
        // Fallback: endpoint returned flat array (old API)
        this.executionTrace = null
        this.dataRuns = Array.isArray(trace) ? trace : []
      }
      this.dataRuns = this.dataRuns.map((item) => {
        item.duration = getDuration(item)
        if (item.duration > 8) {
          item.latency = 'danger'
        } else if (item.duration > 4) {
          item.latency = 'warning'
        } else {
          item.latency = 'success'
        }
        return item
      })
      this.runs = this.generateTreeData()
      this.computeWaterfall()
      this.cd.markForCheck()
    }).catch(() => {
      // Fallback to old API if new endpoint not available
      this.dashboardService.getRunsByRequestId(request_id).then((data) => {
        this.executionTrace = null
        this.dataRuns = data || []
        this.dataRuns = this.dataRuns.map((item) => {
          item.duration = getDuration(item)
          if (item.duration > 8) {
            item.latency = 'danger'
          } else if (item.duration > 4) {
            item.latency = 'warning'
          } else {
            item.latency = 'success'
          }
          return item
        })
        this.runs = this.generateTreeData()
        this.computeWaterfall()
        this.cd.markForCheck()
      })
    })
  }

  generateTreeData(): TreeNode[] {
    const parents = this.dataRuns.filter((node) => !node.parent_run)
    const list = []
    parents.map((parent) => {
      list.push(this.generateNode(parent))
    })
    return list
  }

  generateNode(item: any): TreeNode {
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
    if (!item.parent_run) {
      this.selectedRun = generatedNode
      this.drawMermaid()
    }
    return generatedNode
  }

  onNodeSelect(event: any): void {
    this.selectedRun = event.node
    this.activeTab = 'detail'
    this.drawMermaid()
  }

  onTableRowSelect(event: any): void {
    const run = event.data
    const treeNode = this.findTreeNodeByKey(this.runs, run.id)
    if (treeNode) {
      this.selectedRun = treeNode
    }
    this.activeTab = 'detail'
    this.drawMermaid()
  }

  findTreeNodeByKey(nodes: TreeNode[], key: string): TreeNode | null {
    for (const node of nodes || []) {
      if (node.key === key) {
        return node
      }
      const found = this.findTreeNodeByKey(node.children, key)
      if (found) {
        return found
      }
    }
    return null
  }

  getParentName(parentId: string): string {
    const parent = this.dataRuns.find((r) => r.id === parentId)
    return parent ? parent.name : parentId?.substring(0, 8) + '...'
  }

  getTotalDuration(): number {
    const root = this.dataRuns.find((r) => !r.parent_run)
    return root?.duration ?? 0
  }

  getTotalTokens(): number {
    return this.dataRuns.reduce((sum, r) => sum + (r.prompt_tokens || 0) + (r.completion_tokens || 0), 0)
  }

  getTypeStats(): { type: string; count: number }[] {
    const counts: Record<string, number> = {}
    this.dataRuns.forEach((r) => {
      const type = r.type || 'unknown'
      counts[type] = (counts[type] || 0) + 1
    })
    return Object.entries(counts).map(([type, count]) => ({ type, count }))
  }

  getTypeSeverity(type: string): string {
    switch (type) {
      case 'llm':
        return 'warn'
      case 'tool':
        return 'info'
      case 'retriever':
        return 'info'
      case 'chain':
      case 'agent':
        return 'secondary'
      case 'node':
        return 'contrast'
      default:
        return 'secondary'
    }
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
            '\tclasDef current fill:#feb913\n\tclasDef current fill:#feb913',
          )
        ) {
          renderGraph = renderGraph.replace(
            '\tclasDef current fill:#feb913\n\tclasDef current fill:#feb913',
            '\tclasDef current fill:#feb913',
          )
        }
        renderGraph = renderGraph.replaceAll(
          'fill-opacity:0',
          'fill-opacity:1',
        )
        try {
          const result = await mermaid.render('mermaid-exec', renderGraph)
          const element: any = this.mermaidEl?.nativeElement
          if (element) {
            element.innerHTML = result.svg
            result.bindFunctions(element)
          }
        } catch (e) {
          // mermaid rendering may fail on some graphs
        }
      }, 100)
    }
  }

  getNodeIcon(type: string): string {
    switch (type) {
      case 'llm':
        return 'faSolidBrain'
      case 'chain':
      case 'agent':
        return 'faSolidLink'
      case 'retriever':
        return 'faSolidRectangleList'
      case 'tool':
        return 'faSolidWrench'
      case 'node':
        return 'faSolidCubes'
      default:
        return 'faSolidLink'
    }
  }

  getNodeTypeColor(nodeType: string): string {
    if (!nodeType) {return '#9CA3AF'}
    switch (nodeType.toUpperCase()) {
      case 'EXTRACT_TXT':
        return '#3B82F6'
      case 'CONDITION':
        return '#F59E0B'
      case 'GENERATION':
      case 'UNDERSTANDING':
      case 'CONVERSATION':
        return '#8B5CF6'
      case 'CUSTOMPYTHON':
        return '#10B981'
      case 'STT':
        return '#14B8A6'
      case 'TTS':
        return '#EC4899'
      case 'WORKFLOW':
        return '#6366F1'
      case 'AGGREGATOR':
        return '#F97316'
      case 'EXTRACT_WEB':
      case 'BROWSER_AUTOMATION':
        return '#06B6D4'
      case 'START':
      case 'END':
        return '#6B7280'
      default:
        return '#9CA3AF'
    }
  }

  getNodeTypeLabel(run: any): string {
    return run?.node_type || run?.type || 'unknown'
  }

  formatCost(cost: number): string {
    if (cost == null || cost === 0) {return '-'}
    if (cost < 0.0001) {return '< $0.0001'}
    return '$' + cost.toFixed(4)
  }

  getTotalCost(): number {
    if (this.executionTrace?.total_cost != null) {
      return this.executionTrace.total_cost
    }
    return this.dataRuns.reduce((sum, r) => sum + (r.cost || 0), 0)
  }

  computeWaterfall(): void {
    if (!this.dataRuns || this.dataRuns.length === 0) {
      this.waterfallData = []
      return
    }

    const startedAt = this.executionTrace?.started_at
      ? new Date(this.executionTrace.started_at).getTime()
      : Math.min(...this.dataRuns.map(r => new Date(r.created_at).getTime()))

    const endedAt = this.executionTrace?.ended_at
      ? new Date(this.executionTrace.ended_at).getTime()
      : Math.max(...this.dataRuns.map(r => {
          const start = new Date(r.created_at).getTime()
          const dur = (r.latency_ms || r.duration * 1000 || 0)
          return start + dur
        }))

    const totalDuration = endedAt - startedAt
    if (totalDuration <= 0) {
      this.waterfallData = []
      return
    }

    // Compute depth based on parent hierarchy
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
