import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-modal',
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './app-modal.component.html',
  styleUrl: './app-modal.component.scss',
})
export class AppModalComponent {
  @Input() visible = false;
  @Input() title = '';
  @Input() message = '';
  @Input() primaryLabel = 'OK';
  @Input() secondaryLabel = '';
  @Input() showHeader = false;
  @Input() closeOnEscape = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() primaryAction = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();

  onHide() {
    this.visibleChange.emit(false);
  }

  onPrimaryAction() {
    this.primaryAction.emit();
  }

  onSecondaryAction() {
    this.secondaryAction.emit();
  }
}
