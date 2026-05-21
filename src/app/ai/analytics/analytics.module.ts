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

import { AnalyticsRoutingModule } from './analytics-routing.module'
import { AnalyticsComponent } from './analytics.component'


import { SingleValueCardComponent } from './components/single-value-card/single-value-card.component'
import { ThirdValuesCardComponent } from './components/third-values-card/third-values-card.component'
import { ActivityCardComponent } from './components/activity-card/activity-card.component'
import { EndpointsCardComponent } from './components/endpoints-card/endpoints-card.component'
import { UsageTimeCardComponent } from './components/usage-time-card/usage-time-card.component'
import { PieValueCardComponent } from './components/pie-value-card/pie-value-card.component'

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
  AnalyticsComponent,
  ActivityCardComponent,
  SingleValueCardComponent,
  ThirdValuesCardComponent,
  EndpointsCardComponent,
  UsageTimeCardComponent,
  PieValueCardComponent
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    EmptyStateModule,
    AnalyticsRoutingModule,
    ...PRIME_NG,
  ],
  providers: [],
  declarations: [...CUSTOM],
})
export class AnalyticsModule {}
