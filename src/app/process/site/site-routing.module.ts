import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { SiteComponent } from './site.component'

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: SiteComponent }
    ])],
    exports: [RouterModule]
})
export class SiteRoutingModule { }
