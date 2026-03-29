import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { TracesComponent } from './traces.component'

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: TracesComponent }
    ])],
    exports: [RouterModule]
})
export class TracesRoutingModule { }
