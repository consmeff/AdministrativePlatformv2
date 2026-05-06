import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ApplicationService } from '../../../services/application.service';
import { ButtonComponent } from '../../../widgets/button/button.component';
import { NotificationService } from '../../../services/notification.service';

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
export class SetCutoffModalComponent implements OnChanges {
  private readonly applicationService = inject(ApplicationService);
  private readonly notification = inject(NotificationService);

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
  isLoadingExistingCutoff = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.loadExistingCutoff();
    }
  }

  private loadExistingCutoff(): void {
    this.isLoadingExistingCutoff = true;
    this.applicationService
      .getApplicationCutoff()
      .pipe(
        finalize(() => {
          this.isLoadingExistingCutoff = false;
        }),
      )
      .subscribe({
        next: (cutoff) => {
          this.minimumJambScore = cutoff.min_jamb_score ?? null;
          this.minimumCbtScore = cutoff.min_post_utme_score ?? null;
          const desiredProgramme = cutoff.all_application
            ? 'all'
            : (cutoff.application ?? '').trim().toLowerCase();
          this.selectedProgramme =
            this.programmeOptions.find(
              (option) =>
                option.value.trim().toLowerCase() === desiredProgramme,
            ) ?? this.programmeOptions[0];
        },
        error: () => {
          this.minimumJambScore = null;
          this.minimumCbtScore = null;
          this.selectedProgramme = this.programmeOptions[0];
          this.notification.warn(
            'Unable to load existing cutoff. You can still set a new one.',
          );
        },
      });
  }

  isBusy(): boolean {
    return this.loading || this.isLoadingExistingCutoff;
  }

  onClose(): void {
    if (this.isBusy()) {
      return;
    }
    this.closed.emit();
  }

  onSave(): void {
    if (this.isBusy()) {
      return;
    }
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
