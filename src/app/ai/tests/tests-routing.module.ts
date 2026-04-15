import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { TestsComponent } from './tests.component'

@NgModule({
  imports: [RouterModule.forChild([{ path: '', component: TestsComponent }])],
  exports: [RouterModule],
})
export class TestsRoutingModule {}
