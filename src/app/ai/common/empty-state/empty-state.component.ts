import {
  Component,
  EventEmitter,
  Input,
  Output,

} from '@angular/core'

@Component({
    selector: 'empty-state-widget',
    templateUrl: './empty-state.component.html',
    styleUrl: './empty-state.component.scss',
    standalone: false
})
export class EmptyStateComponent {
  @Input() showButton = false
  @Input() message: any
  @Input() iconName: any
  @Input() buttonLabel: any
  @Output() buttonPressed = new EventEmitter()


}
