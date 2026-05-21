import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { RsiComponent } from './rsi.component'

@NgModule({
  imports: [RouterModule.forChild([
    { path: '', component: RsiComponent }
  ])],
  exports: [RouterModule]
})
export class RsiRoutingModule { }
