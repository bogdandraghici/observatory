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
import { MultiSelectModule } from 'primeng/multiselect'
import { ChipModule } from 'primeng/chip'
import { TagModule } from 'primeng/tag'
import { TooltipModule } from 'primeng/tooltip'
import { DrawerModule } from 'primeng/drawer'
import { PopoverModule } from 'primeng/popover'
import { TreeModule } from 'primeng/tree'
import { TabsModule } from 'primeng/tabs'
import { MessageModule } from 'primeng/message'
import { ProgressBarModule } from 'primeng/progressbar'
import { DataViewModule } from 'primeng/dataview'
import { UsersRoutingModule } from './settings-routing.module'
import { SettingsComponent } from './settings.component'
import { LLMCallsModule } from '../llm-calls/llm-calls.module'
import { EmptyStateModule } from '../common/empty-state/empty-state.module'
import { NgIconsModule } from '@ng-icons/core'
import { InputTextModule } from 'primeng/inputtext'
import { DividerModule } from 'primeng/divider'
import { ToastModule } from 'primeng/toast'
import { AccordionModule } from 'primeng/accordion'

import {
  faSolidCoins,
  faSolidBrain,
  faSolidLink,
  faSolidRectangleList,
} from '@ng-icons/font-awesome/solid'

import {
  bootstrapHandThumbsUp,
  bootstrapHandThumbsDown,
  bootstrapChatLeftDotsFill,
  bootstrapDot,
  bootstrapDash,
} from '@ng-icons/bootstrap-icons'


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
  MultiSelectModule,
  ChipModule,
  TagModule,
  TooltipModule,
  PopoverModule,
  DrawerModule,
  TreeModule,
  TabsModule,
  MessageModule,
  ProgressBarModule,
  DataViewModule,
  InputTextModule,
  DividerModule,
  ToastModule,
  AccordionModule
]

const CUSTOM = [SettingsComponent]

const ICONS = [
  NgIconsModule.withIcons({
    faSolidCoins,
    faSolidBrain,
    faSolidLink,
    faSolidRectangleList,
    bootstrapHandThumbsUp,
    bootstrapHandThumbsDown,
    bootstrapChatLeftDotsFill,
    bootstrapDot,
    bootstrapDash,
  }),
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    EmptyStateModule,
    UsersRoutingModule,
    LLMCallsModule,
    ...PRIME_NG,
    ...ICONS,
  ],
  declarations: [...CUSTOM],
})
export class SettingsModule {}
