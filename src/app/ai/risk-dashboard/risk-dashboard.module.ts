import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { TableModule } from 'primeng/table'
import { TagModule } from 'primeng/tag'
import { SelectModule } from 'primeng/select'
import { DrawerModule } from 'primeng/drawer'
import { ButtonModule } from 'primeng/button'
import { ToastModule } from 'primeng/toast'
import { CardModule } from 'primeng/card'
import { TooltipModule } from 'primeng/tooltip'
import { RiskDashboardRoutingModule } from './risk-dashboard-routing.module'
import { RiskDashboardComponent } from './risk-dashboard.component'

const PRIME_NG = [
  TableModule,
  TagModule,
  SelectModule,
  DrawerModule,
  ButtonModule,
  ToastModule,
  CardModule,
  TooltipModule,
]

const CUSTOM = [RiskDashboardComponent]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RiskDashboardRoutingModule,
    ...PRIME_NG,
  ],
  declarations: [...CUSTOM],
})
export class RiskDashboardModule {}
