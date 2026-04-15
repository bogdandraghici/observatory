import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { SelectModule } from 'primeng/select'
import { SelectButtonModule } from 'primeng/selectbutton'
import { TagModule } from 'primeng/tag'
import { TooltipModule } from 'primeng/tooltip'
import { TabsModule } from 'primeng/tabs'
import { MessageModule } from 'primeng/message'
import { ProgressBarModule } from 'primeng/progressbar'
import { ChipModule } from 'primeng/chip'
import { InputTextModule } from 'primeng/inputtext'
import { DialogModule } from 'primeng/dialog'
import { TextareaModule } from 'primeng/textarea'

import { ProjectsRoutingModule } from './projects-routing.module'
import { ProjectsComponent } from './projects.component'
import { ProjectDetailComponent } from './project-detail/project-detail.component'
import { EmptyStateModule } from '../common/empty-state/empty-state.module'

const PRIME_NG = [
  TableModule,
  ButtonModule,
  SelectModule,
  SelectButtonModule,
  TagModule,
  TooltipModule,
  TabsModule,
  MessageModule,
  ProgressBarModule,
  ChipModule,
  InputTextModule,
  DialogModule,
  TextareaModule,
]

@NgModule({
  imports: [CommonModule, FormsModule, EmptyStateModule, ProjectsRoutingModule, ...PRIME_NG],
  declarations: [ProjectsComponent, ProjectDetailComponent],
})
export class ProjectsModule {}
