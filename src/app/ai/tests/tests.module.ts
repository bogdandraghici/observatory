import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { TableModule } from 'primeng/table'
import { TagModule } from 'primeng/tag'
import { SelectModule } from 'primeng/select'
import { ButtonModule } from 'primeng/button'
import { DialogModule } from 'primeng/dialog'
import { ToastModule } from 'primeng/toast'
import { ProgressBarModule } from 'primeng/progressbar'
import { TooltipModule } from 'primeng/tooltip'
import { TabsModule } from 'primeng/tabs'
import { ChipModule } from 'primeng/chip'
import { InputTextModule } from 'primeng/inputtext'

import { TestsRoutingModule } from './tests-routing.module'
import { TestsComponent } from './tests.component'

const PRIME_NG = [
  TableModule,
  TagModule,
  SelectModule,
  ButtonModule,
  DialogModule,
  ToastModule,
  ProgressBarModule,
  TooltipModule,
  TabsModule,
  ChipModule,
  InputTextModule,
]

const CUSTOM = [TestsComponent]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TestsRoutingModule,
    ...PRIME_NG,
  ],
  declarations: [...CUSTOM],
})
export class TestsModule {}
