import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { DeveloperExecutionsComponent } from './developer-executions.component'

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: DeveloperExecutionsComponent }
    ])],
    exports: [RouterModule]
})
export class DeveloperExecutionsRoutingModule { }
