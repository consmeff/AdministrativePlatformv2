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
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ButtonComponent } from '../../../widgets/button/button.component';

interface ProgrammeOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-change-programme-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    SelectModule,
    ButtonComponent,
  ],
  templateUrl: './change-programme-modal.component.html',
  styleUrl: './change-programme-modal.component.scss',
})
export class ChangeProgrammeModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() loading = false;
  @Input() currentProgramme = 'N/A';
  @Input() programmeOptions: string[] = [];

  @Output() closed = new EventEmitter<void>();
  @Output() changed = new EventEmitter<string>();

  selectedProgramme: ProgrammeOption | null = null;

  get mappedProgrammeOptions(): ProgrammeOption[] {
    return this.programmeOptions.map((value) => ({ label: value, value }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['programmeOptions'] || changes['visible']) &&
      this.mappedProgrammeOptions.length > 0
    ) {
      this.selectedProgramme =
        this.mappedProgrammeOptions.find(
          (option) => option.value !== this.currentProgramme,
        ) ?? this.mappedProgrammeOptions[0];
    }
  }

  onClose(): void {
    this.closed.emit();
  }

  submit(): void {
    if (!this.selectedProgramme?.value) {
      return;
    }
    this.changed.emit(this.selectedProgramme.value);
  }
}
