import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { DrawerModule } from 'primeng/drawer'
import { InputTextModule } from 'primeng/inputtext'
import { SelectModule } from 'primeng/select'
import { TagModule } from 'primeng/tag'
import { DialogModule } from 'primeng/dialog'
import { ToastModule } from 'primeng/toast'
import { TabsModule } from 'primeng/tabs'
import { TextareaModule } from 'primeng/textarea'
import { TooltipModule } from 'primeng/tooltip'
import { ProgressBarModule } from 'primeng/progressbar'
import { AccordionModule } from 'primeng/accordion'
import { BadgeModule } from 'primeng/badge'
import { InputNumberModule } from 'primeng/inputnumber'
import { MultiSelectModule } from 'primeng/multiselect'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { ConfirmationService } from 'primeng/api'

import { RegulatoryRoutingModule } from './regulatory-routing.module'
import { RegulatoryComponent } from './regulatory.component'

const PRIME_NG = [
  TableModule,
  ButtonModule,
  DrawerModule,
  InputTextModule,
  SelectModule,
  TagModule,
  DialogModule,
  ToastModule,
  TabsModule,
  TextareaModule,
  TooltipModule,
  ProgressBarModule,
  AccordionModule,
  BadgeModule,
  InputNumberModule,
  MultiSelectModule,
  ConfirmDialogModule,
]

const CUSTOM = [RegulatoryComponent]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RegulatoryRoutingModule,
    ...PRIME_NG,
  ],
  declarations: [...CUSTOM],
  providers: [ConfirmationService],
})
export class RegulatoryModule {}
