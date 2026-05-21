import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { SelectModule } from 'primeng/select'
import { TagModule } from 'primeng/tag'
import { DialogModule } from 'primeng/dialog'
import { ToastModule } from 'primeng/toast'
import { TooltipModule } from 'primeng/tooltip'
import { ProgressBarModule } from 'primeng/progressbar'
import { InputTextModule } from 'primeng/inputtext'
import { TextareaModule } from 'primeng/textarea'

import { EvidenceRoutingModule } from './evidence-routing.module'
import { EvidenceComponent } from './evidence.component'

const PRIME_NG = [
  TableModule,
  ButtonModule,
  SelectModule,
  TagModule,
  DialogModule,
  ToastModule,
  TooltipModule,
  ProgressBarModule,
  InputTextModule,
  TextareaModule,
]

const CUSTOM = [EvidenceComponent]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    EvidenceRoutingModule,
    ...PRIME_NG,
  ],
  declarations: [...CUSTOM],
})
export class EvidenceModule {}
