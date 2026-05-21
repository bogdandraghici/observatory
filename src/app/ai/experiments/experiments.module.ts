import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { InputTextModule } from 'primeng/inputtext'
import { SelectModule } from 'primeng/select'
import { TagModule } from 'primeng/tag'
import { DialogModule } from 'primeng/dialog'
import { ToastModule } from 'primeng/toast'
import { TooltipModule } from 'primeng/tooltip'
import { MultiSelectModule } from 'primeng/multiselect'
import { ProgressBarModule } from 'primeng/progressbar'
import { TabsModule } from 'primeng/tabs'
import { CheckboxModule } from 'primeng/checkbox'

import { ExperimentsRoutingModule } from './experiments-routing.module'
import { ExperimentsComponent } from './experiments.component'

const PRIME_NG = [
  TableModule,
  ButtonModule,
  InputTextModule,
  SelectModule,
  TagModule,
  DialogModule,
  ToastModule,
  TooltipModule,
  MultiSelectModule,
  ProgressBarModule,
  TabsModule,
  CheckboxModule,
]

const CUSTOM = [ExperimentsComponent]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ExperimentsRoutingModule,
    ...PRIME_NG,
  ],
  declarations: [...CUSTOM],
})
export class ExperimentsModule {}
