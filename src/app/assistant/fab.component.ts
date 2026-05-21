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
      <i *ngIf="isOpen" class="pi pi-times"></i>
      <img
        *ngIf="!isOpen"
        src="assets/fab-sparkles.svg"
        alt=""
        class="assistant-fab__icon"
        aria-hidden="true"
      />
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
      background: #2A313A;
      color: #ffffff;
      border: none;
      cursor: pointer;
      box-shadow: 0 3px 12px rgba(22, 52, 98, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      z-index: 1100;
    }
    .assistant-fab:hover {
      transform: scale(1.08);
      box-shadow: 0 4px 16px rgba(22, 52, 98, 0.5);
    }
    .assistant-fab__icon {
      width: 16px;
      height: 19.2px;
      display: block;
      pointer-events: none;
    }
  `],
})
export class AssistantFabComponent {
  @Input() isOpen = false
  @Output() fabToggle = new EventEmitter<void>()
}
