import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { InputTextModule } from 'primeng/inputtext'
import { SelectModule } from 'primeng/select'
import { TagModule } from 'primeng/tag'
import { MultiSelectModule } from 'primeng/multiselect'
import { DialogModule } from 'primeng/dialog'
import { ToastModule } from 'primeng/toast'
import { ToggleSwitchModule } from 'primeng/toggleswitch'
import { TooltipModule } from 'primeng/tooltip'

import { WebhooksRoutingModule } from './webhooks-routing.module'
import { WebhooksComponent } from './webhooks.component'

const PRIME_NG = [
  TableModule,
  ButtonModule,
  InputTextModule,
  SelectModule,
  TagModule,
  MultiSelectModule,
  DialogModule,
  ToastModule,
  ToggleSwitchModule,
  TooltipModule,
]

const CUSTOM = [WebhooksComponent]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    WebhooksRoutingModule,
    ...PRIME_NG,
  ],
  declarations: [...CUSTOM],
})
export class WebhooksModule {}
