import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { SelectButtonModule } from 'primeng/selectbutton'
import { SelectModule } from 'primeng/select'
import { TagModule } from 'primeng/tag'
import { TooltipModule } from 'primeng/tooltip'
import { DrawerModule } from 'primeng/drawer'
import { TreeModule } from 'primeng/tree'
import { TabsModule } from 'primeng/tabs'
import { MessageModule } from 'primeng/message'
import { ProgressBarModule } from 'primeng/progressbar'
import { InputTextModule } from 'primeng/inputtext'

import { ExecutionsRoutingModule } from './executions-routing.module'
import { ExecutionsComponent } from './executions.component'
import { ExecutionListComponent } from './components/execution-list/execution-list.component'
import { ExecutionDetailComponent } from './components/execution-detail/execution-detail.component'
import { EmptyStateModule } from '../common/empty-state/empty-state.module'

import { NgIconsModule } from '@ng-icons/core'
import {
  faSolidBrain,
  faSolidCubes,
  faSolidLink,
  faSolidRectangleList,
  faSolidWrench,
} from '@ng-icons/font-awesome/solid'

const PRIME_NG = [
  TableModule,
  ButtonModule,
  SelectButtonModule,
  SelectModule,
  TagModule,
  TooltipModule,
  DrawerModule,
  TreeModule,
  TabsModule,
  MessageModule,
  ProgressBarModule,
  InputTextModule,
]

const CUSTOM = [ExecutionsComponent, ExecutionListComponent]

const ICONS = [
  NgIconsModule.withIcons({
    faSolidBrain,
    faSolidCubes,
    faSolidLink,
    faSolidRectangleList,
    faSolidWrench,
  }),
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    EmptyStateModule,
    ExecutionsRoutingModule,
    ExecutionDetailComponent,
    ...PRIME_NG,
    ...ICONS,
  ],
  declarations: [...CUSTOM],
})
export class ExecutionsModule {}
