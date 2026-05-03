import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-table-row-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-row-actions.component.html',
  styleUrl: './table-row-actions.component.scss',
})
export class TableRowActionsComponent {
  @Input() disableView = false;
  @Input() disableShortlist = false;
  @Input() disableCompliance = false;
  @Input() shortlistTooltip = 'Shortlist';
  @Input() shortlistIconClass = 'bi bi-check';
  @Input() complianceTooltip = 'Issue Compliance';
  @Input() complianceIconClass = 'bi bi-exclamation-triangle';

  @Output() view = new EventEmitter<void>();
  @Output() shortlist = new EventEmitter<void>();
  @Output() compliance = new EventEmitter<void>();
}
