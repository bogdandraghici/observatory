import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { RiskDashboardComponent } from './risk-dashboard.component'

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: RiskDashboardComponent }
    ])],
    exports: [RouterModule]
})
export class RiskDashboardRoutingModule { }
