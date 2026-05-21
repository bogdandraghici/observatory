import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { PlatformComponent } from './platform.component'

@NgModule({
  imports: [RouterModule.forChild([
    { path: '', component: PlatformComponent }
  ])],
  exports: [RouterModule]
})
export class PlatformRoutingModule {}
