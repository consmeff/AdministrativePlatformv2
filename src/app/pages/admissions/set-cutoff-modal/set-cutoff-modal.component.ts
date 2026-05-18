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

const ALL_PROGRAMMES_VALUE = 'all';

interface OptionItem {
  label: string;
  value: number | typeof ALL_PROGRAMMES_VALUE;
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
    value: ALL_PROGRAMMES_VALUE,
  };

  @Input() visible = false;
  @Input() loading = false;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<SetCutoffPayload>();

  programmeOptions: OptionItem[] = [this.allProgrammesOption];

  selectedProgramme: OptionItem['value'] = ALL_PROGRAMMES_VALUE;
  minimumCbtScore: number | null = null;
  minimumJambScore: number | null = null;
  isLoadingProgrammeOptions = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.selectedProgramme = ALL_PROGRAMMES_VALUE;
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
    if (!item?.program?.id || !item.program?.name) {
      return null;
    }

    const programmeName = item.program.name.trim();
    const levelName = item.level?.name?.trim();
    const label = levelName ? `${programmeName} (${levelName})` : programmeName;

    return {
      label,
      value: item.program.id,
      programmeName,
    };
  }

  private getSelectedProgrammeOption(): OptionItem | undefined {
    return this.programmeOptions.find(
      (programmeOption) => programmeOption.value === this.selectedProgramme,
    );
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
    const selectedProgrammeOption = this.getSelectedProgrammeOption();
    this.saved.emit({
      minimumCbtScore: this.minimumCbtScore ?? undefined,
      minimumJambScore: this.minimumJambScore ?? undefined,
      applicationId:
        this.selectedProgramme === ALL_PROGRAMMES_VALUE
          ? undefined
          : this.selectedProgramme,
      programmeLabel:
        this.selectedProgramme === ALL_PROGRAMMES_VALUE
          ? 'All Programmes'
          : (selectedProgrammeOption?.label ?? 'Selected Programme'),
    });
  }
}
