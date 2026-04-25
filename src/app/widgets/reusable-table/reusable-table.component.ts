import { CommonModule } from '@angular/common';
import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { TableModule } from 'primeng/table';

export interface ReusableTableColumn {
  field: string;
  header?: string;
  sortable?: boolean;
  cellClass?: string;
}

@Component({
  selector: 'app-reusable-table',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './reusable-table.component.html',
  styleUrl: './reusable-table.component.scss',
})
export class ReusableTableComponent {
  @Input() columns: ReusableTableColumn[] = [];
  @Input() value: Record<string, unknown>[] = [];
  @Input() showHeader = true;
  @Input() placeholder = '-----';
  @Input() tableStyle: Record<string, string> = { 'min-width': '100%' };
  @ContentChild('rowTemplate') rowTemplate?: TemplateRef<{
    $implicit: Record<string, unknown>;
    columns: ReusableTableColumn[];
  }>;

  getCellValue(row: Record<string, unknown>, field: string): string {
    const value = row[field];
    if (value === null || value === undefined || value === '') {
      return this.placeholder;
    }
    return String(value);
  }
}
