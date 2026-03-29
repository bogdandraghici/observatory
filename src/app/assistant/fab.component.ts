import { Component, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'app-assistant-fab',
  standalone: false,
  template: `
    <button
      class="assistant-fab"
      (click)="fabToggle.emit()"
      [attr.aria-label]="isOpen ? 'Close assistant' : 'Open assistant'"
    >
      <i [class]="isOpen ? 'pi pi-times' : 'pi pi-sparkles'"></i>
    </button>
  `,
  styles: [`
    .assistant-fab {
      position: fixed;
      bottom: 40px;
      right: 40px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #fdb913;
      color: #1a1a2e;
      border: none;
      cursor: pointer;
      box-shadow: 0 3px 12px rgba(253, 185, 19, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      z-index: 1100;
    }
    .assistant-fab:hover {
      transform: scale(1.08);
      box-shadow: 0 4px 16px rgba(253, 185, 19, 0.5);
    }
  `],
})
export class AssistantFabComponent {
  @Input() isOpen = false
  @Output() fabToggle = new EventEmitter<void>()
}
