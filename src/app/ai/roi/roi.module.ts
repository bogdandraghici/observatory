import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { InputTextModule } from 'primeng/inputtext'
import { SelectModule } from 'primeng/select'
import { TagModule } from 'primeng/tag'
import { ToastModule } from 'primeng/toast'
import { TabsModule } from 'primeng/tabs'
import { TooltipModule } from 'primeng/tooltip'
import { InputNumberModule } from 'primeng/inputnumber'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { ConfirmationService } from 'primeng/api'
import { ChartModule } from 'primeng/chart'
import { ProgressBarModule } from 'primeng/progressbar'
import { BadgeModule } from 'primeng/badge'
import { MultiSelectModule } from 'primeng/multiselect'
import { TextareaModule } from 'primeng/textarea'
import { DialogModule } from 'primeng/dialog'

import { RoiRoutingModule } from './roi-routing.module'
import { RoiComponent } from './roi.component'

const PRIME_NG = [
  TableModule,
  ButtonModule,
  InputTextModule,
  SelectModule,
  TagModule,
  ToastModule,
  TabsModule,
  TooltipModule,
  InputNumberModule,
  ConfirmDialogModule,
  ChartModule,
  ProgressBarModule,
  BadgeModule,
  MultiSelectModule,
  TextareaModule,
  DialogModule,
]

const CUSTOM = [RoiComponent]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RoiRoutingModule,
    ...PRIME_NG,
  ],
  declarations: [...CUSTOM],
  providers: [ConfirmationService],
})
export class RoiModule {}
