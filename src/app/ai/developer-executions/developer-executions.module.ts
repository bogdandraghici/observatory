import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { SelectButtonModule } from 'primeng/selectbutton'
import { SelectModule } from 'primeng/select'
import { TagModule } from 'primeng/tag'
import { TooltipModule } from 'primeng/tooltip'
import { ProgressBarModule } from 'primeng/progressbar'
import { InputTextModule } from 'primeng/inputtext'

import { DeveloperExecutionsRoutingModule } from './developer-executions-routing.module'
import { DeveloperExecutionsComponent } from './developer-executions.component'
import { DeveloperExecutionListComponent } from './components/developer-execution-list/developer-execution-list.component'
import { ExecutionDetailComponent } from '../executions/components/execution-detail/execution-detail.component'
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
  ProgressBarModule,
  InputTextModule,
]

const CUSTOM = [DeveloperExecutionsComponent, DeveloperExecutionListComponent]

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
    DeveloperExecutionsRoutingModule,
    ExecutionDetailComponent,
    ...PRIME_NG,
    ...ICONS,
  ],
  declarations: [...CUSTOM],
})
export class DeveloperExecutionsModule {}
