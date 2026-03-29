import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { TooltipModule } from 'primeng/tooltip'
import { RippleModule } from 'primeng/ripple'

import { AssistantFabComponent } from './fab.component'
import { ChatWindowComponent } from './chat-window.component'

@NgModule({
  declarations: [AssistantFabComponent, ChatWindowComponent],
  imports: [CommonModule, FormsModule, ButtonModule, TooltipModule, RippleModule],
  exports: [AssistantFabComponent, ChatWindowComponent],
})
export class AssistantModule {}
