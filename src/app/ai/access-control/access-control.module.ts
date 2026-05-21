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
import { CheckboxModule } from 'primeng/checkbox'
import { ToastModule } from 'primeng/toast'

import { AccessControlRoutingModule } from './access-control-routing.module'
import { AccessControlComponent } from './access-control.component'

const PRIME_NG = [
  TableModule,
  TabsModule,
  TagModule,
  ButtonModule,
  SelectModule,
  DialogModule,
  InputTextModule,
  CheckboxModule,
  ToastModule,
]

const CUSTOM = [AccessControlComponent]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AccessControlRoutingModule,
    ...PRIME_NG,
  ],
  declarations: [...CUSTOM],
})
export class AccessControlModule {}
