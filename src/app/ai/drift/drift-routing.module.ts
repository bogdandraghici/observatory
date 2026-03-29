import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { DriftComponent } from './drift.component'

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: DriftComponent }
    ])],
    exports: [RouterModule]
})
export class DriftRoutingModule { }
