import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { EmptyStateComponent } from './empty-state.component'

import { NgIconsModule } from '@ng-icons/core'

import {
  bootstrapBarChartSteps,
  bootstrapDatabase,
  bootstrapViewList,
} from '@ng-icons/bootstrap-icons'



const PRIME_NG = [
  NgIconsModule.withIcons({
    bootstrapBarChartSteps,
    bootstrapDatabase,
    bootstrapViewList,
  }),

]

const CUSTOM = [EmptyStateComponent]

@NgModule({
  imports: [CommonModule, FormsModule, ...PRIME_NG],
  declarations: [...CUSTOM],
  exports: [EmptyStateComponent]
})
export class EmptyStateModule {}
