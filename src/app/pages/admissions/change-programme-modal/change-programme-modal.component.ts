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
  value: number;
}

type ProgrammeInputOption = string | ProgrammeOption;

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
  @Input() programmeOptions: ProgrammeInputOption[] = [];

  @Output() closed = new EventEmitter<void>();
  @Output()
  changed = new EventEmitter<{
    programmeName: string;
    approvedDepartmentId: number;
  }>();

  selectedProgramme: ProgrammeOption | null = null;

  get mappedProgrammeOptions(): ProgrammeOption[] {
    return this.programmeOptions
      .map((option) => {
        if (typeof option === 'string') {
          return { label: option, value: 0 };
        }
        return option;
      })
      .filter((option) => typeof option.value === 'number');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['programmeOptions'] || changes['visible']) &&
      this.mappedProgrammeOptions.length > 0
    ) {
      this.selectedProgramme =
        this.mappedProgrammeOptions.find(
          (option) => option.label !== this.currentProgramme,
        ) ?? this.mappedProgrammeOptions[0];
      return;
    }
    if (
      changes['programmeOptions'] &&
      this.mappedProgrammeOptions.length === 0
    ) {
      this.selectedProgramme = null;
    }
  }

  onClose(): void {
    this.closed.emit();
  }

  submit(): void {
    if (!this.selectedProgramme?.value || !this.selectedProgramme?.label) {
      return;
    }
    this.changed.emit({
      programmeName: this.selectedProgramme.label,
      approvedDepartmentId: this.selectedProgramme.value,
    });
  }
}
