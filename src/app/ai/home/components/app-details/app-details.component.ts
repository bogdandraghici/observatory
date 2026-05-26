import {
  Component,
  Input,
  Output,

  EventEmitter
} from '@angular/core'
import { AppService } from 'src/app/ai/services/apps.service'
import { formatTime, processDuration } from '../../../utils/time'
import { ConfirmationService, MessageService } from 'primeng/api'
import { Clipboard } from '@angular/cdk/clipboard'
@Component({
    selector: 'app-details-widget',
    templateUrl: './app-details.component.html',
    styleUrl: './app-details.component.scss',
    providers: [ConfirmationService, MessageService],
    standalone: false
})
export class AppDetailsComponent {
  @Input() app: any
  @Output() appChanged: EventEmitter<any> = new EventEmitter()
  @Output() integrate: EventEmitter<any> = new EventEmitter()

  activeProjectEdit = false

  formatTime = formatTime
  processDuration = processDuration

  constructor(
    private appService: AppService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private clipboard: Clipboard
  ) {}

  private originalName = ''

  onEditActivate(): void {
    this.originalName = this.app?.name ?? ''
  }

  cancelEdit(inplace: any): void {
    if (this.app) {
      this.app.name = this.originalName
    }
    this.activeProjectEdit = false
    inplace.deactivate()
  }

  async saveItem(event: any, inplace: any, item: any): Promise<any> {
    const updatedApp = await this.appService.updateApp(item)
    if (updatedApp) {
      this.activeProjectEdit = false
      this.messageService.clear()
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Project successfully updated!',
      })
      inplace.deactivate()
    }
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
      message: 'Are you sure that you want to archive this project?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: async (): Promise<void> => {
       const ____value = await this.appService.archiveApp(this.app?.id)
        this.messageService.add({
          severity: 'info',
          summary: 'Confirmed',
          detail: 'You have archived the project',
          life: 3000,
        })
        this.appChanged.emit(null)
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

  async setDefault(____event: any): Promise<any> {
    const ____value = await this.appService.setDefault(this.app?.id)
    this.messageService.add({
      severity: 'info',
      summary: 'Confirmed',
      detail: `You've set the project ${this.app.name} as default`,
      life: 3000,
    })
    this.appChanged.emit(null)
  }

  public copyToClipboard(____event: any): void {
    const successful = this.clipboard.copy(this.app.id)
    if (successful) {
      this.messageService.add({
        severity: 'info',
        summary: 'Clipboard',
        detail: 'You have copied the id to clipboard',
        life: 3000,
      })
    }
}
}
