import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { ChartModule } from 'primeng/chart'
import { MenuModule } from 'primeng/menu'
import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { StyleClassModule } from 'primeng/styleclass'
import { PanelMenuModule } from 'primeng/panelmenu'
import { SelectButtonModule } from 'primeng/selectbutton'
import { AvatarModule } from 'primeng/avatar'
import { SelectModule } from 'primeng/select'
import { AvatarGroupModule } from 'primeng/avatargroup'
import { TagModule } from 'primeng/tag'

import { DashboardRoutingModule } from './dashboard-routing.module'
import { DashboardComponent } from './dashboard.component'

import { LLMUsageComponent } from './components/llm-usage/llm-usage.component'
import { AgentUsageComponent } from './components/agent-usage/agent-usage.component'
import { TokensUsageComponent } from './components/tokens-usage/tokens-usage.component'
import { ErrorRateComponent } from './components/error-rate/error-rate.component'
import { ModelPerformanceComponent } from './components/model-performance/model-performance.component'
import { CostTrendComponent } from './components/cost-trend/cost-trend.component'
import { CorrectnessOverviewComponent } from './components/correctness-overview/correctness-overview.component'

import { ShortNumberPipe } from '../utils/short-number.pipe'
import { EmptyStateModule } from '../common/empty-state/empty-state.module'

const PRIME_NG = [
  ChartModule,
  MenuModule,
  TableModule,
  StyleClassModule,
  PanelMenuModule,
  ButtonModule,
  SelectButtonModule,
  AvatarModule,
  SelectModule,
  AvatarGroupModule,
  TagModule
]

const CUSTOM = [
  DashboardComponent,
  ShortNumberPipe,
  AgentUsageComponent,
  LLMUsageComponent,
  TokensUsageComponent,
  ErrorRateComponent,
  ModelPerformanceComponent,
  CostTrendComponent,
  CorrectnessOverviewComponent
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    EmptyStateModule,
    DashboardRoutingModule,
    ...PRIME_NG,
  ],
  providers: [],
  declarations: [...CUSTOM],
})
export class DashboardModule {}
