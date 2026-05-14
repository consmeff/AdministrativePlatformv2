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
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import {
  ApplicationService,
  ApplicationSetupItem,
} from '../../../services/application.service';
import { ButtonComponent } from '../../../widgets/button/button.component';
import { NotificationService } from '../../../services/notification.service';

interface OptionItem {
  label: string;
  value: number | 'all';
  programmeName?: string;
}

export interface SetCutoffPayload {
  minimumCbtScore?: number;
  minimumJambScore?: number;
  applicationId?: number;
  programmeLabel?: string;
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
  private readonly allProgrammesOption: OptionItem = {
    label: 'All Programmes',
    value: 'all',
  };

  @Input() visible = false;
  @Input() loading = false;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<SetCutoffPayload>();

  programmeOptions: OptionItem[] = [this.allProgrammesOption];

  selectedProgramme: OptionItem = this.programmeOptions[0];
  minimumCbtScore: number | null = null;
  minimumJambScore: number | null = null;
  isLoadingProgrammeOptions = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.selectedProgramme = this.allProgrammesOption;
      this.minimumCbtScore = null;
      this.minimumJambScore = null;
      this.loadProgrammeOptions();
    }
  }

  private loadProgrammeOptions(): void {
    this.isLoadingProgrammeOptions = true;
    this.applicationService.getAvailableApplications().subscribe({
      next: (response) => {
        const options = (response.data ?? [])
          .map((item) => this.toProgrammeOption(item))
          .filter((item): item is OptionItem => item !== null);
        this.programmeOptions = [this.allProgrammesOption, ...options];
      },
      error: () => {
        this.programmeOptions = [this.allProgrammesOption];
        this.notification.warn(
          'Unable to load programme options. You can still set cutoff for all programmes.',
        );
      },
      complete: () => {
        this.isLoadingProgrammeOptions = false;
      },
    });
  }

  private toProgrammeOption(item: ApplicationSetupItem): OptionItem | null {
    if (!item?.id || !item.program?.name) {
      return null;
    }

    const programmeName = item.program.name.trim();
    const levelName = item.level?.name?.trim();
    const label = levelName ? `${programmeName} (${levelName})` : programmeName;

    return {
      label,
      value: item.id,
      programmeName,
    };
  }

  isBusy(): boolean {
    return this.loading || this.isLoadingProgrammeOptions;
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
      applicationId:
        this.selectedProgramme.value === 'all'
          ? undefined
          : this.selectedProgramme.value,
      programmeLabel:
        this.selectedProgramme.value === 'all'
          ? 'All Programmes'
          : this.selectedProgramme.label,
    });
  }
}
