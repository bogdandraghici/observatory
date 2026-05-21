import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { InsightsComponent } from './insights.component'

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: InsightsComponent }
    ])],
    exports: [RouterModule]
})
export class InsightsRoutingModule { }
