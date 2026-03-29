import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { AccessControlComponent } from './access-control.component'

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: AccessControlComponent }
    ])],
    exports: [RouterModule]
})
export class AccessControlRoutingModule { }
