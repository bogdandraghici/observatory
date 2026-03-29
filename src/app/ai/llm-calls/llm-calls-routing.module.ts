import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { LLMCallsComponent } from './llm-calls.component'

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: LLMCallsComponent }
    ])],
    exports: [RouterModule]
})
export class LLMCallsRoutingModule { }
