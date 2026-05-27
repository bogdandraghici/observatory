import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { AuditsComponent } from './audits.component'

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: AuditsComponent }
    ])],
    exports: [RouterModule]
})
export class AuditsRoutingModule { }
