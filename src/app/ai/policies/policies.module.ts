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
import { TabsModule } from 'primeng/tabs'
import { TextareaModule } from 'primeng/textarea'
import { InputNumberModule } from 'primeng/inputnumber'
import { MultiSelectModule } from 'primeng/multiselect'

import { PoliciesRoutingModule } from './policies-routing.module'
import { PoliciesComponent } from './policies.component'

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
  TabsModule,
  TextareaModule,
  InputNumberModule,
  MultiSelectModule,
]

const CUSTOM = [PoliciesComponent]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PoliciesRoutingModule,
    ...PRIME_NG,
  ],
  declarations: [...CUSTOM],
})
export class PoliciesModule {}
