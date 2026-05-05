import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ButtonComponent } from '../../../widgets/button/button.component';

interface OptionItem {
  label: string;
  value: string;
}

export interface SetCutoffPayload {
  minimumCbtScore?: number;
  minimumJambScore?: number;
  programme?: string;
}

@Component({
  selector: 'app-set-cutoff-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    SelectModule,
    ButtonComponent,
  ],
  templateUrl: './set-cutoff-modal.component.html',
  styleUrl: './set-cutoff-modal.component.scss',
})
export class SetCutoffModalComponent {
  @Input() visible = false;
  @Input() loading = false;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<SetCutoffPayload>();

  readonly programmeOptions: OptionItem[] = [
    { label: 'All Programmes', value: 'all' },
    { label: 'Nursing', value: 'Nursing' },
    { label: 'Midwifery', value: 'Midwifery' },
    { label: 'Public Health', value: 'Public Health' },
  ];

  selectedProgramme: OptionItem = this.programmeOptions[0];
  minimumCbtScore: number | null = null;
  minimumJambScore: number | null = null;

  onClose(): void {
    this.closed.emit();
  }

  onSave(): void {
    this.saved.emit({
      minimumCbtScore: this.minimumCbtScore ?? undefined,
      minimumJambScore: this.minimumJambScore ?? undefined,
      programme:
        this.selectedProgramme.value === 'all'
          ? undefined
          : this.selectedProgramme.value,
    });
  }
}
