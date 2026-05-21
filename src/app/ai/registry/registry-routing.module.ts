import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { RegistryComponent } from './registry.component'

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: RegistryComponent }
    ])],
    exports: [RouterModule]
})
export class RegistryRoutingModule { }
