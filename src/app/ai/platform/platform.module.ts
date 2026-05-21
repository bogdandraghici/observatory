import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { DrawerModule } from 'primeng/drawer'
import { SelectModule } from 'primeng/select'
import { TagModule } from 'primeng/tag'
import { ToastModule } from 'primeng/toast'
import { TabsModule } from 'primeng/tabs'
import { TooltipModule } from 'primeng/tooltip'
import { ProgressBarModule } from 'primeng/progressbar'
import { BadgeModule } from 'primeng/badge'
import { InputTextModule } from 'primeng/inputtext'
import { InputNumberModule } from 'primeng/inputnumber'

import { PlatformRoutingModule } from './platform-routing.module'
import { PlatformComponent } from './platform.component'

const PRIME_NG = [
  TableModule,
  ButtonModule,
  DrawerModule,
  SelectModule,
  TagModule,
  ToastModule,
  TabsModule,
  TooltipModule,
  ProgressBarModule,
  BadgeModule,
  InputTextModule,
  InputNumberModule,
]

const CUSTOM = [PlatformComponent]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PlatformRoutingModule,
    ...PRIME_NG,
  ],
  declarations: [...CUSTOM],
})
export class PlatformModule {}
