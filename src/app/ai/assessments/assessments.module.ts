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
import { ToggleSwitchModule } from 'primeng/toggleswitch'
import { TooltipModule } from 'primeng/tooltip'
import { TextareaModule } from 'primeng/textarea'
import { InputNumberModule } from 'primeng/inputnumber'
import { MultiSelectModule } from 'primeng/multiselect'
import { SliderModule } from 'primeng/slider'
import { ProgressBarModule } from 'primeng/progressbar'
import { TabsModule } from 'primeng/tabs'

import { AssessmentsRoutingModule } from './assessments-routing.module'
import { AssessmentsComponent } from './assessments.component'

const PRIME_NG = [
  TableModule,
  ButtonModule,
  InputTextModule,
  SelectModule,
  TagModule,
  DialogModule,
  ToastModule,
  ToggleSwitchModule,
  TooltipModule,
  TextareaModule,
  InputNumberModule,
  MultiSelectModule,
  SliderModule,
  ProgressBarModule,
  TabsModule,
]

const CUSTOM = [AssessmentsComponent]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AssessmentsRoutingModule,
    ...PRIME_NG,
  ],
  declarations: [...CUSTOM],
})
export class AssessmentsModule {}
