import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { WebhooksComponent } from './webhooks.component'

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: WebhooksComponent }
    ])],
    exports: [RouterModule]
})
export class WebhooksRoutingModule { }
