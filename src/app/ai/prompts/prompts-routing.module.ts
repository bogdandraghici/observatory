import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { PromptsComponent } from './prompts.component'

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: PromptsComponent }
    ])],
    exports: [RouterModule]
})
export class PromptsRoutingModule { }
