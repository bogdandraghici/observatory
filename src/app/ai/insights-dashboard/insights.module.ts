import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { TableModule } from 'primeng/table'
import { TagModule } from 'primeng/tag'
import { SelectModule } from 'primeng/select'
import { ButtonModule } from 'primeng/button'
import { CardModule } from 'primeng/card'
import { ToastModule } from 'primeng/toast'
import { SelectButtonModule } from 'primeng/selectbutton'
import { TabsModule } from 'primeng/tabs'
import { DrawerModule } from 'primeng/drawer'
import { AccordionModule } from 'primeng/accordion'
import { DialogModule } from 'primeng/dialog'
import { ProgressBarModule } from 'primeng/progressbar'
import { TooltipModule } from 'primeng/tooltip'

import { InsightsRoutingModule } from './insights-routing.module'
import { InsightsComponent } from './insights.component'

const PRIME_NG = [
  TableModule,
  TagModule,
  SelectModule,
  ButtonModule,
  CardModule,
  ToastModule,
  SelectButtonModule,
  TabsModule,
  DrawerModule,
  AccordionModule,
  DialogModule,
  ProgressBarModule,
  TooltipModule,
]

const CUSTOM = [InsightsComponent]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    InsightsRoutingModule,
    ...PRIME_NG,
  ],
  declarations: [...CUSTOM],
})
export class InsightsModule {}
