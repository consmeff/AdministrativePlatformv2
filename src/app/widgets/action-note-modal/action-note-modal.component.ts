import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-action-note-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './action-note-modal.component.html',
  styleUrl: './action-note-modal.component.scss',
})
export class ActionNoteModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() title = '';
  @Input() prompt = '';
  @Input() label = 'Reason:';
  @Input() placeholder = '';
  @Input() cancelLabel = 'Cancel';
  @Input() confirmLabel = 'Submit';
  @Input() initialNote = '';
  @Input() loading = false;

  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<string>();

  note = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue) {
      this.note = this.initialNote ?? '';
    }
  }

  close(): void {
    if (!this.loading) {
      this.closed.emit();
    }
  }

  submit(): void {
    if (!this.loading) {
      this.submitted.emit(this.note.trim());
    }
  }
}
