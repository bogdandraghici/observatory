import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { TableModule } from 'primeng/table'
import { TagModule } from 'primeng/tag'
import { SelectModule } from 'primeng/select'
import { ButtonModule } from 'primeng/button'
import { ChartModule } from 'primeng/chart'
import { ToastModule } from 'primeng/toast'
import { TooltipModule } from 'primeng/tooltip'

import { DriftRoutingModule } from './drift-routing.module'
import { DriftComponent } from './drift.component'

const PRIME_NG = [
  TableModule,
  TagModule,
  SelectModule,
  ButtonModule,
  ChartModule,
  ToastModule,
  TooltipModule,
]

const CUSTOM = [DriftComponent]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DriftRoutingModule,
    ...PRIME_NG,
  ],
  declarations: [...CUSTOM],
})
export class DriftModule {}
