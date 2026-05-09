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
  programmeName?: string;
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
  @Input() programmeOptions: ProgrammeOption[] = [];

  @Output() closed = new EventEmitter<void>();
  @Output()
  changed = new EventEmitter<{
    programmeName: string;
    applicationId: number;
  }>();

  selectedProgramme: ProgrammeOption | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['programmeOptions'] || changes['visible']) &&
      this.programmeOptions.length > 0
    ) {
      this.selectedProgramme =
        this.programmeOptions.find(
          (option) =>
            (option.programmeName ?? option.label).trim().toLowerCase() !==
            this.currentProgramme.trim().toLowerCase(),
        ) ?? this.programmeOptions[0];
      return;
    }
    if (changes['programmeOptions'] && this.programmeOptions.length === 0) {
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
      programmeName:
        this.selectedProgramme.programmeName ?? this.selectedProgramme.label,
      applicationId: this.selectedProgramme.value,
    });
  }
}
