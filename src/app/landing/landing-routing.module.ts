import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { LandingComponent } from './landing.component'
import { FeatureLayoutComponent } from './components/feature-layout/feature-layout.component'
import { ObservabilityPageComponent } from './pages/observability-page.component'
import { GovernancePageComponent } from './pages/governance-page.component'
import { CompliancePageComponent } from './pages/compliance-page.component'
import { RoiPageComponent } from './pages/roi-page.component'

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: LandingComponent },
        {
            path: 'features',
            component: FeatureLayoutComponent,
            children: [
                { path: 'observability', component: ObservabilityPageComponent },
                { path: 'governance', component: GovernancePageComponent },
                { path: 'compliance', component: CompliancePageComponent },
                { path: 'roi', component: RoiPageComponent },
                { path: '', redirectTo: 'observability', pathMatch: 'full' }
            ]
        }
    ])],
    exports: [RouterModule]
})
export class LandingRoutingModule { }
