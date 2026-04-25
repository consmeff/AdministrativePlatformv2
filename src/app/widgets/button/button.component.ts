import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'info'
  | 'danger'
  | 'neutral'
  | 'muted';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() outline = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() fullWidth = false;
  @Input() iconClass = '';
  @Input() iconPosition: 'left' | 'right' = 'left';

  @Output() buttonClick = new EventEmitter<MouseEvent>();

  get variantClass(): string {
    const mappedVariant = this.variant === 'outline' ? 'primary' : this.variant;
    return `btn--${mappedVariant}`;
  }

  get modeClass(): string {
    return this.outline || this.variant === 'outline'
      ? 'btn--outline'
      : 'btn--solid';
  }

  handleClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      return;
    }
    this.buttonClick.emit(event);
  }
}
