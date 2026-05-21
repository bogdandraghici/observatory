import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { TableModule } from 'primeng/table'
import { TagModule } from 'primeng/tag'
import { SelectModule } from 'primeng/select'
import { DialogModule } from 'primeng/dialog'
import { TooltipModule } from 'primeng/tooltip'
import { ButtonModule } from 'primeng/button'
import { SelectButtonModule } from 'primeng/selectbutton'
import { InputTextModule } from 'primeng/inputtext'
import { ToastModule } from 'primeng/toast'

import { AuditTrailRoutingModule } from './audit-trail-routing.module'
import { AuditTrailComponent } from './audit-trail.component'

const PRIME_NG = [
  TableModule,
  TagModule,
  SelectModule,
  DialogModule,
  TooltipModule,
  ButtonModule,
  SelectButtonModule,
  InputTextModule,
  ToastModule,
]

const CUSTOM = [AuditTrailComponent]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AuditTrailRoutingModule,
    ...PRIME_NG,
  ],
  declarations: [...CUSTOM],
})
export class AuditTrailModule {}
