import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-table-row-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-row-actions.component.html',
  styleUrl: './table-row-actions.component.scss',
})
export class TableRowActionsComponent {
  @Output() view = new EventEmitter<void>();
  @Output() shortlist = new EventEmitter<void>();
  @Output() compliance = new EventEmitter<void>();
}
