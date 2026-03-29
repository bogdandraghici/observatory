import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { AuditTrailComponent } from './audit-trail.component'

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: AuditTrailComponent }
    ])],
    exports: [RouterModule]
})
export class AuditTrailRoutingModule { }
