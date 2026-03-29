import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { TableModule } from 'primeng/table'
import { TagModule } from 'primeng/tag'
import { SelectModule } from 'primeng/select'
import { ButtonModule } from 'primeng/button'
import { ToastModule } from 'primeng/toast'
import { TooltipModule } from 'primeng/tooltip'
import { TabsModule } from 'primeng/tabs'
import { DrawerModule } from 'primeng/drawer'
import { DialogModule } from 'primeng/dialog'
import { TextareaModule } from 'primeng/textarea'
import { InputTextModule } from 'primeng/inputtext'
import { ToggleSwitchModule } from 'primeng/toggleswitch'

import { PromptsRoutingModule } from './prompts-routing.module'
import { PromptsComponent } from './prompts.component'

const PRIME_NG = [
  TableModule,
  TagModule,
  SelectModule,
  ButtonModule,
  ToastModule,
  TooltipModule,
  TabsModule,
  DrawerModule,
  DialogModule,
  TextareaModule,
  InputTextModule,
  ToggleSwitchModule,
]

const CUSTOM = [PromptsComponent]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PromptsRoutingModule,
    ...PRIME_NG,
  ],
  declarations: [...CUSTOM],
})
export class PromptsModule {}
