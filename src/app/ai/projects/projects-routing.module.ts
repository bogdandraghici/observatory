import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { ProjectsComponent } from './projects.component'
import { ProjectDetailComponent } from './project-detail/project-detail.component'

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', component: ProjectsComponent },
      { path: ':id', component: ProjectDetailComponent },
    ]),
  ],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {}
