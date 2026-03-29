import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { ExecutionsComponent } from './executions.component'

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: ExecutionsComponent }
    ])],
    exports: [RouterModule]
})
export class ExecutionsRoutingModule { }
