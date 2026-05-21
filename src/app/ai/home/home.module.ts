import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { HomeRoutingModule } from './home-routing.module'
import { HomeComponent } from './home.component'

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
import { InplaceModule } from 'primeng/inplace'
import { ToastModule } from 'primeng/toast'
import { InputTextModule } from 'primeng/inputtext'
import { MessageService } from 'primeng/api'
import { DialogModule } from 'primeng/dialog'
import { ToolbarModule } from 'primeng/toolbar'
import { DividerModule } from 'primeng/divider'
import { ConfirmDialogModule } from 'primeng/confirmdialog'

import { AppDetailsComponent } from './components/app-details/app-details.component'
import { DatasetDetailsComponent } from './components/dataset-datails/dataset-details.component'
import { EmptyStateModule } from '../common/empty-state/empty-state.module'
import { SplitButtonModule } from 'primeng/splitbutton'

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
  InplaceModule,
  InputTextModule,
  ToastModule,
  DividerModule,
  DialogModule,
  SplitButtonModule,
  ConfirmDialogModule,
  ToolbarModule
]

const CUSTOM = [HomeComponent, AppDetailsComponent, DatasetDetailsComponent]

@NgModule({
  imports: [CommonModule, FormsModule,EmptyStateModule, ...PRIME_NG, HomeRoutingModule],
  providers: [MessageService],
  declarations: [...CUSTOM],
})
export class HomeModule {}
