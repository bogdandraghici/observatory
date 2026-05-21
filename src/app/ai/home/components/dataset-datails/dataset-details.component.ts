import {
  Component,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  EventEmitter,
} from '@angular/core'

import { formatTime, processDuration } from '../../../utils/time'
import { ConfirmationService, MessageService } from 'primeng/api'
import { DatasetService } from 'src/app/ai/services/datasets.service'
import { DatasetItemService } from 'src/app/ai/services/datasetItems.service'
@Component({
    selector: 'dataset-details-widget',
    templateUrl: './dataset-details.component.html',
    styleUrl: './dataset-details.component.scss',
    providers: [ConfirmationService, MessageService],
    standalone: false
})
export class DatasetDetailsComponent implements OnChanges {
  @Input() dataset: any
  @Output() datasetChanged: EventEmitter<any> = new EventEmitter()

  datasetItems: any
  activeProjectEdit = false

  formatTime = formatTime
  processDuration = processDuration

  constructor(
    private datasetService: DatasetService,
    private datasetItemService: DatasetItemService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataset']?.currentValue) {
      this.getDatasetCount(changes['dataset']?.currentValue?.id)
    }
  }

  async saveItem(event: any, inplace: any, item: any): Promise<any> {
    const updatedApp = await this.datasetService.updateDataset(item)
    if (updatedApp) {
      this.activeProjectEdit = false
      this.messageService.clear()
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Dataset successfully updated!',
      })
      inplace.deactivate()
    }
  }

  async getDatasetCount(datasetId: any): Promise<any> {
    const items = await this.datasetItemService.getByDatasetId(datasetId)
    this.datasetItems = items.length
  }

  getLatency(duration: any): any {
    if (duration > 8) {
      return 'danger'
    } else if (duration > 4) {
      return 'warning'
    } else {
      return 'success'
    }
  }

  confirmDelete(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure that you want to archive this dataset?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: async (): Promise<void> => {
        const ____value = await this.datasetService.archiveDataset(
          this.dataset?.id,
        )
        this.messageService.add({
          severity: 'info',
          summary: 'Confirmed',
          detail: 'You have archived the dataset',
          life: 3000,
        })
        this.datasetChanged.emit(null)
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Cancelled',
          detail: 'You have cancelled',
          life: 3000,
        })
      },
    })
  }
}
