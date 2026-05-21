import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AIRoutingModule } from './ai-routing.module'

import { NgIconsModule } from '@ng-icons/core'
import {EmptyStateModule} from './common/empty-state/empty-state.module'
import {
  bootstrapBarChartSteps,
  bootstrapDatabase,
  bootstrapViewList,
} from '@ng-icons/bootstrap-icons'
import {
  faSolidCoins,
  faSolidBrain,
  faSolidLink,
} from '@ng-icons/font-awesome/solid'

const ICONS = [ NgIconsModule.withIcons({
  bootstrapBarChartSteps,
  bootstrapDatabase,
  bootstrapViewList,
  faSolidCoins,
  faSolidBrain,
  faSolidLink,
}),]

@NgModule({

  imports: [
    CommonModule,
    AIRoutingModule,
    EmptyStateModule,
    ...ICONS
  ],
  declarations: [],
  exports:[EmptyStateModule]
})
export class AIModule {}
