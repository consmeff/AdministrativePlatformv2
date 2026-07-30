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
  @Input() showCheckedAction = false;
  @Input() showShortlistAction = true;
  @Input() showComplianceAction = true;
  @Input() disableChecked = false;
  @Input() disableShortlist = false;
  @Input() disableCompliance = false;
  @Input() checkedTooltip = 'Mark as Checked';
  @Input() checkedIconClass = 'bi bi-check2-square';
  @Input() shortlistTooltip = 'Shortlist';
  @Input() shortlistIconClass = 'bi bi-check';
  @Input() complianceTooltip = 'Issue Compliance';
  @Input() complianceIconClass = 'bi bi-exclamation-triangle';

  @Output() view = new EventEmitter<void>();
  @Output() checked = new EventEmitter<void>();
  @Output() shortlist = new EventEmitter<void>();
  @Output() compliance = new EventEmitter<void>();
}
