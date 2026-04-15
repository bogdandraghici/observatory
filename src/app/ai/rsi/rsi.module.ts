import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { TableModule } from 'primeng/table'
import { TagModule } from 'primeng/tag'
import { SelectModule } from 'primeng/select'
import { ButtonModule } from 'primeng/button'
import { ToastModule } from 'primeng/toast'
import { TooltipModule } from 'primeng/tooltip'
import { CardModule } from 'primeng/card'
import { DialogModule } from 'primeng/dialog'
import { TabsModule } from 'primeng/tabs'
import { BadgeModule } from 'primeng/badge'
import { ProgressBarModule } from 'primeng/progressbar'
import { TimelineModule } from 'primeng/timeline'
import { ChipModule } from 'primeng/chip'
import { InputTextModule } from 'primeng/inputtext'

import { RsiRoutingModule } from './rsi-routing.module'
import { RsiComponent } from './rsi.component'

const PRIME_NG = [
  TableModule,
  TagModule,
  SelectModule,
  ButtonModule,
  ToastModule,
  TooltipModule,
  CardModule,
  DialogModule,
  TabsModule,
  BadgeModule,
  ProgressBarModule,
  TimelineModule,
  ChipModule,
  InputTextModule,
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RsiRoutingModule,
    ...PRIME_NG,
  ],
  declarations: [RsiComponent],
})
export class RsiModule {}
