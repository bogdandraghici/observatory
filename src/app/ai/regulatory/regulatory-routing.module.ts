import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { RegulatoryComponent } from './regulatory.component'

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: RegulatoryComponent }
    ])],
    exports: [RouterModule]
})
export class RegulatoryRoutingModule { }
