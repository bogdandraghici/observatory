import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { StatusComponent } from './status.component'

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: StatusComponent }]),
  ],
  declarations: [StatusComponent],
})
export class StatusModule {}
