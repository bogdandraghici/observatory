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
import { InputNumberModule } from 'primeng/inputnumber'

import { AlertsRoutingModule } from './alerts-routing.module'
import { AlertsComponent } from './alerts.component'

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
  InputNumberModule,
]

const CUSTOM = [AlertsComponent]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AlertsRoutingModule,
    ...PRIME_NG,
  ],
  declarations: [...CUSTOM],
})
export class AlertsModule {}
