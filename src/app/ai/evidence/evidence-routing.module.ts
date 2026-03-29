import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { EvidenceComponent } from './evidence.component'

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: EvidenceComponent }
    ])],
    exports: [RouterModule]
})
export class EvidenceRoutingModule { }
