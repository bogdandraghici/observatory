import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { RoiComponent } from './roi.component'

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: RoiComponent }
    ])],
    exports: [RouterModule]
})
export class RoiRoutingModule { }
