import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core'


import { formatTime } from 'src/app/ai/utils/time'

@Component({
    selector: 'dataset-list-widget',
    templateUrl: './dataset-list.component.html',
    styleUrl: './dataset-list.component.scss',
    providers: [MessageService],
    standalone: false
})
export class DatasetListComponent implements OnInit, OnChanges {

  @Input() orgId: string = null
  @Output() addDataset = new EventEmitter<void>()

  datasets: any[]
  first = 0
  rows = 10
  totalRecords!: number
  loading = false

  formatTime = formatTime

  items: MenuItem[] | undefined

  selectedItem: any
  sidebarVisible = false
  showClosed: any = false

  selectedAgent: any
  agents: any[] = defaultAgents

  uploadDatasetId: string = null
  deleteDialogVisible = false
  datasetToDelete: any = null

  constructor(
    private datasetService: DatasetService,
    private datasetItemService: DatasetItemService,
    public el: ElementRef,
    private sanitized: DomSanitizer,
    private messageService: MessageService,
    private runService: RunService,
  ) {}

  populateTable(event: any): void {
    let page = 1
    const size = 10
    let query = null

    if (event) {
      page = event?.first / event?.rows + 1
      query = event?.globalFilter
    }
    this.datasetService
      .getDatasets(
        page,
        size,
        query,
        this.orgId
      )
      .then((data) => {
        this.datasets = data?.items
        this.totalRecords = data?.total
      })
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['orgId']?.currentValue || this.orgId)
    ) {
      this.populateTable(null)
    }
  }


  openMenu(event: any, menu: any, item: any): void {
    this.selectedItem = item
    menu.toggle(event)
  }

  ngOnInit(): void {
    this.items = []
  }

  getUserText(llmCall: any): any {
    return llmCall.input
  }

  getAIText(llmCall: any): any {
    return llmCall.output
  }

  getFeedback(llmCall: any): any {
    return llmCall.feedback?.response === 'positive'
      ? 'N/A'
      : '<b>- Reason:</b> ' +
          llmCall.feedback?.reason +
          ' <br/> <b>- User Message:</b>' +
          llmCall.feedback?.user_message
  }

  next(): void {
    this.first = this.first + this.rows
  }

  prev(): void {
    this.first = this.first - this.rows
  }

  reset(): void {
    this.first = 0
  }

  pageChange(event: any): void {
    this.first = event.first
    this.rows = event.rows
  }

  isLastPage(): boolean {
    return this.datasets
      ? this.first === this.datasets.length - this.rows
      : true
  }

  isFirstPage(): boolean {
    return this.datasets ? this.first === 0 : true
  }

  showSidebar(_____item: any): void {
    this.sidebarVisible = true
  }

  rowSelect(_____event: any): void {
    // this.showSidebar(event.data);
  }

  hideDetails(): void {
    this.sidebarVisible = false
  }

  triggerCsvUpload(dataset: any, fileInput: HTMLInputElement): void {
    this.uploadDatasetId = dataset.id
    fileInput.click()
  }

  async onCsvFileSelected(event: Event): Promise<any> {
    const input = event.target as HTMLInputElement
    if (!input.files?.length || !this.uploadDatasetId) {return}

    const file = input.files[0]
    try {
      const result = await this.datasetItemService.uploadCsv(this.uploadDatasetId, file)
      this.messageService.add({
        severity: 'success',
        summary: 'Upload Complete',
        detail: `Imported ${result?.count || 0} items from CSV.`,
      })
      this.populateTable(null)
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Upload Failed',
        detail: error?.message || 'Failed to upload CSV.',
      })
    }
    input.value = ''
    this.uploadDatasetId = null
  }

  confirmDelete(dataset: any): void {
    this.datasetToDelete = dataset
    this.deleteDialogVisible = true
  }

  async deleteDataset(): Promise<any> {
    if (!this.datasetToDelete) {return}
    try {
      await this.datasetService.deleteDataset(this.datasetToDelete.id)
      this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `Dataset "${this.datasetToDelete.name}" deleted.` })
      this.populateTable(null)
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete dataset.' })
    }
    this.deleteDialogVisible = false
    this.datasetToDelete = null
  }

}

import { DomSanitizer } from '@angular/platform-browser'
import { PipeTransform, Pipe } from '@angular/core'
import { MenuItem, MessageService } from 'primeng/api'
import { RunService } from 'src/app/ai/services/runs.service'
import { defaultAgents } from 'src/app/ai/utils/dataEnums'
import { DatasetService } from 'src/app/ai/services/datasets.service'
import { DatasetItemService } from 'src/app/ai/services/datasetItems.service'

@Pipe({
    name: 'safeHtml',
    standalone: false
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) {}
  transform(value: any): any {
    return this.sanitized.bypassSecurityTrustHtml(value)
  }
}
