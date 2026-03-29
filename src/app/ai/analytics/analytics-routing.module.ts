import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { AnalyticsComponent } from './analytics.component'

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: AnalyticsComponent }
    ])],
    exports: [RouterModule]
})
export class AnalyticsRoutingModule { }
