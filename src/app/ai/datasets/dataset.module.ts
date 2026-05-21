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
import { PopoverModule } from 'primeng/popover'
import { TreeModule } from 'primeng/tree'
import { TabsModule } from 'primeng/tabs'
import { MessageModule } from 'primeng/message'
import { ProgressBarModule } from 'primeng/progressbar'
import { CheckboxModule } from 'primeng/checkbox'
import { DialogModule } from 'primeng/dialog'
import { ToastModule } from 'primeng/toast'
import { DatasetRoutingModule } from './dataset-routing.module'
import { DatasetComponent } from './dataset.component'
import { LLMCallsModule } from '../llm-calls/llm-calls.module'
import { DatasetListComponent } from './components/dataset-list/dataset-list.component'
import { EmptyStateModule } from '../common/empty-state/empty-state.module'
import { NgIconsModule } from '@ng-icons/core'
import { InputTextModule } from 'primeng/inputtext'

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
  TreeModule,
  TabsModule,
  MessageModule,
  ProgressBarModule,
  InputTextModule,
  CheckboxModule,
  DialogModule,
  ToastModule,
]

const CUSTOM = [DatasetComponent, DatasetListComponent]

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
    DatasetRoutingModule,
    LLMCallsModule,
    ...PRIME_NG,
    ...ICONS,
  ],
  declarations: [...CUSTOM],
})
export class DatasetModule {}
