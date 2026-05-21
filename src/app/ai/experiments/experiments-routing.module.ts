import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { ExperimentsComponent } from './experiments.component'

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: ExperimentsComponent }
    ])],
    exports: [RouterModule]
})
export class ExperimentsRoutingModule { }
