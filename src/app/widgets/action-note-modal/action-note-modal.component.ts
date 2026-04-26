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
import { SelectModule } from 'primeng/select';

export interface ActionModalPayload {
  note: string;
  reason: string;
  affectedDocuments: string[];
}

@Component({
  selector: 'app-action-note-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, SelectModule],
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
  @Input() subtitle = '';
  @Input() showReasonSelect = false;
  @Input() reasonOptions: string[] = [];
  @Input() selectedReason = '';
  @Input() documentOptions: string[] = [];
  @Input() selectedDocuments: string[] = [];
  @Input() notesLabel = 'Additional Notes:';
  @Input() notesHint = '(optional)';

  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<string>();
  @Output() submittedPayload = new EventEmitter<ActionModalPayload>();

  note = '';
  reason = '';
  affectedDocumentsInternal: string[] = [];
  readonly reasonDropdownOptions: { label: string; value: string }[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue) {
      this.note = this.initialNote ?? '';
      this.reason = this.selectedReason ?? '';
      this.affectedDocumentsInternal = [...(this.selectedDocuments ?? [])];
    }

    if (changes['reasonOptions']) {
      this.reasonDropdownOptions.splice(
        0,
        this.reasonDropdownOptions.length,
        ...this.reasonOptions.map((item) => ({ label: item, value: item })),
      );
    }
  }

  close(): void {
    if (!this.loading) {
      this.closed.emit();
    }
  }

  submit(): void {
    if (!this.loading) {
      const payload: ActionModalPayload = {
        note: this.note.trim(),
        reason: this.reason,
        affectedDocuments: [...this.affectedDocumentsInternal],
      };
      this.submitted.emit(payload.note);
      this.submittedPayload.emit(payload);
    }
  }

  onDocumentToggle(documentName: string, checked: boolean): void {
    if (checked) {
      if (!this.affectedDocumentsInternal.includes(documentName)) {
        this.affectedDocumentsInternal = [
          ...this.affectedDocumentsInternal,
          documentName,
        ];
      }
      return;
    }
    this.affectedDocumentsInternal = this.affectedDocumentsInternal.filter(
      (item) => item !== documentName,
    );
  }
}
