import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { TableModule } from 'primeng/table'
import { TabsModule } from 'primeng/tabs'
import { TagModule } from 'primeng/tag'
import { ButtonModule } from 'primeng/button'
import { SelectModule } from 'primeng/select'
import { DialogModule } from 'primeng/dialog'
import { InputTextModule } from 'primeng/inputtext'
import { ChipModule } from 'primeng/chip'
import { ToastModule } from 'primeng/toast'
import { CheckboxModule } from 'primeng/checkbox'
import { TextareaModule } from 'primeng/textarea'
import { TooltipModule } from 'primeng/tooltip'
import { InputNumberModule } from 'primeng/inputnumber'
import { AutoCompleteModule } from 'primeng/autocomplete'

import { RegistryRoutingModule } from './registry-routing.module'
import { RegistryComponent } from './registry.component'

const PRIME_NG = [
  TableModule,
  TabsModule,
  TagModule,
  ButtonModule,
  SelectModule,
  DialogModule,
  InputTextModule,
  ChipModule,
  ToastModule,
  CheckboxModule,
  TextareaModule,
  TooltipModule,
  InputNumberModule,
  AutoCompleteModule,
]

const CUSTOM = [RegistryComponent]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RegistryRoutingModule,
    ...PRIME_NG,
  ],
  declarations: [...CUSTOM],
})
export class RegistryModule {}
