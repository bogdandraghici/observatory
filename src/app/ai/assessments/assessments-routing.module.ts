import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { AssessmentsComponent } from './assessments.component'

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: AssessmentsComponent }
    ])],
    exports: [RouterModule]
})
export class AssessmentsRoutingModule { }
