import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core'
import { MessageService } from 'primeng/api'
import { Drawer } from 'primeng/drawer'
import { PlatformService } from '../services/platform.service'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-platform',
  templateUrl: './platform.component.html',
  providers: [MessageService],
  standalone: false,
})
export class PlatformComponent implements OnInit, OnDestroy {
  @ViewChild('platformDrawerRef') platformDrawerRef!: Drawer

  activeTab = '0'
  loading = false
  refreshInterval: any = null

  // Health
  health: any = null

  // Cluster summary
  cluster: any = null

  // Namespaces
  namespaces: any[] = []
  selectedNamespace: any = null
  namespaceOptions: any[] = []

  // Pods
  pods: any[] = []
  podStatusFilter: any = null
  podStatusOptions = [
    { label: 'All', value: null },
    { label: 'Running', value: 'Running' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Failed', value: 'Failed' },
    { label: 'Succeeded', value: 'Succeeded' },
  ]

  // Nodes
  nodes: any[] = []

  // Deployments
  deployments: any[] = []

  // Events
  events: any[] = []
  eventTypeFilter: any = null
  eventTypeOptions = [
    { label: 'All', value: null },
    { label: 'Normal', value: 'Normal' },
    { label: 'Warning', value: 'Warning' },
  ]

  // Logs drawer
  drawerVisible = false
  drawerType = 'logs' // logs | pod-detail | node-detail
  selectedPod: any = null
  selectedNode: any = null
  logLines: string[] = []
  logTailLines = 200
  logContainer = ''
  logLoading = false

  constructor(
    private platformService: PlatformService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.loadInitialData()
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  }

  async loadInitialData(): Promise<any> {
    this.loading = true
    try {
      const [health, cluster, namespaces] = await Promise.all([
        this.platformService.getHealth(),
        this.platformService.getClusterSummary(),
        this.platformService.getNamespaces(),
      ])
      this.health = health
      this.cluster = cluster
      this.namespaces = Array.isArray(namespaces) ? namespaces : []
      this.namespaceOptions = this.namespaces.map((ns: any) => ({
        label: `${ns.name} (${ns.pod_count} pods)`,
        value: ns.name,
      }))
      if (this.namespaceOptions.length > 0) {
        const defaultNs = (environment as any).defaultNamespace || 'flowx'
        const hasDefault = this.namespaceOptions.some((o: any) => o.value === defaultNs)
        this.selectedNamespace = hasDefault ? defaultNs : this.namespaceOptions[0].value
        this.loadNamespaceData()
      }
    } catch (e: any) {
      this.messageService.add({ severity: 'error', summary: 'Connection Failed', detail: e.message || 'Could not reach observatory-platform' })
    } finally {
      this.loading = false
    }
  }

  async loadNamespaceData(): Promise<any> {
    if (!this.selectedNamespace) {return}
    await Promise.all([
      this.loadPods(),
      this.loadDeployments(),
      this.loadEvents(),
    ])
  }

  onNamespaceChange(): void {
    this.loadNamespaceData()
  }

  // --- Cluster tab ---
  async refreshCluster(): Promise<any> {
    try {
      this.cluster = await this.platformService.getClusterSummary()
      this.messageService.add({ severity: 'success', summary: 'Refreshed' })
    } catch (e: any) {
      this.messageService.add({ severity: 'error', summary: 'Refresh failed', detail: e.message })
    }
  }

  // --- Pods tab ---
  async loadPods(): Promise<any> {
    if (!this.selectedNamespace) {return}
    try {
      const data = await this.platformService.getPods(this.selectedNamespace, this.podStatusFilter)
      this.pods = Array.isArray(data) ? data : []
    } catch (e: any) {
      this.pods = []
      this.messageService.add({ severity: 'error', summary: 'Failed to load pods', detail: e.message })
    }
  }

  onPodStatusChange(): void {
    this.loadPods()
  }

  getTotalRestarts(pod: any): number {
    return (pod.containers || []).reduce((sum: number, c: any) => sum + (c.restart_count || 0), 0)
  }

  getContainerSummary(pod: any): string {
    const total = pod.containers?.length || 0
    const ready = (pod.containers || []).filter((c: any) => c.ready).length
    return `${ready}/${total}`
  }

  openPodDetail(pod: any): void {
    this.selectedPod = pod
    this.drawerType = 'pod-detail'
    this.drawerVisible = true
  }

  openPodLogs(pod: any): void {
    this.selectedPod = pod
    this.logContainer = pod.containers?.[0]?.name || ''
    this.logLines = []
    this.drawerType = 'logs'
    this.drawerVisible = true
    this.fetchLogs()
  }

  async fetchLogs(): Promise<any> {
    if (!this.selectedPod) {return}
    this.logLoading = true
    try {
      const data = await this.platformService.getPodLogs(
        this.selectedPod.namespace,
        this.selectedPod.name,
        this.logContainer || undefined,
        this.logTailLines,
      )
      this.logLines = data?.logs || []
    } catch (e: any) {
      this.logLines = [`Error: ${e.message}`]
    } finally {
      this.logLoading = false
    }
  }

  // --- Nodes tab ---
  async loadNodes(): Promise<any> {
    try {
      const data = await this.platformService.getNodes()
      this.nodes = Array.isArray(data) ? data : []
    } catch (e: any) {
      this.nodes = []
      this.messageService.add({ severity: 'error', summary: 'Failed to load nodes', detail: e.message })
    }
  }

  openNodeDetail(node: any): void {
    this.selectedNode = node
    this.drawerType = 'node-detail'
    this.drawerVisible = true
  }

  // --- Deployments tab ---
  async loadDeployments(): Promise<any> {
    if (!this.selectedNamespace) {return}
    try {
      const data = await this.platformService.getDeployments(this.selectedNamespace)
      this.deployments = Array.isArray(data) ? data : []
    } catch (e: any) {
      this.deployments = []
      this.messageService.add({ severity: 'error', summary: 'Failed to load deployments', detail: e.message })
    }
  }

  getDeploymentHealth(dep: any): string {
    if (dep.replicas_ready >= dep.replicas_desired && dep.replicas_desired > 0) {return 'success'}
    if (dep.replicas_ready > 0) {return 'warn'}
    return 'danger'
  }

  getDeploymentHealthLabel(dep: any): string {
    if (dep.replicas_ready >= dep.replicas_desired && dep.replicas_desired > 0) {return 'Healthy'}
    if (dep.replicas_ready > 0) {return 'Degraded'}
    return 'Unhealthy'
  }

  // --- Events tab ---
  async loadEvents(): Promise<any> {
    try {
      const data = await this.platformService.getEvents(this.selectedNamespace, this.eventTypeFilter, 100)
      this.events = Array.isArray(data) ? data : []
    } catch (e: any) {
      this.events = []
      this.messageService.add({ severity: 'error', summary: 'Failed to load events', detail: e.message })
    }
  }

  onEventTypeChange(): void {
    this.loadEvents()
  }

  // --- Tab change ---
  onTabChange(): void {
    switch (this.activeTab) {
      case '0':
        this.refreshCluster()
        break
      case '1':
        this.loadPods()
        break
      case '2':
        this.loadNodes()
        break
      case '3':
        this.loadDeployments()
        break
      case '4':
        this.loadEvents()
        break
    }
  }

  // --- Helpers ---
  getPodStatusSeverity(status: string): string {
    switch (status) {
      case 'Running': return 'success'
      case 'Succeeded': return 'success'
      case 'Pending': return 'warn'
      case 'Failed': return 'danger'
      default: return 'secondary'
    }
  }

  getNodeStatusSeverity(status: string): string {
    return status === 'Ready' ? 'success' : 'danger'
  }

  getEventSeverity(type: string): string {
    return type === 'Warning' ? 'warn' : 'info'
  }

  getDrawerTitle(): string {
    if (this.drawerType === 'logs' && this.selectedPod) {return `Logs — ${this.selectedPod.name}`}
    if (this.drawerType === 'pod-detail' && this.selectedPod) {return `Pod — ${this.selectedPod.name}`}
    if (this.drawerType === 'node-detail' && this.selectedNode) {return `Node — ${this.selectedNode.name}`}
    return ''
  }

  closeDrawer(e: Event): void {
    this.platformDrawerRef.close(e)
  }

  formatDate(dateStr: string): string {
    if (!dateStr) {return '—'}
    const d = new Date(dateStr)
    return d.toLocaleString()
  }
}
