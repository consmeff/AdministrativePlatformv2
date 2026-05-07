import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, PaginatorModule],
  templateUrl: './app-pagination.component.html',
  styleUrl: './app-pagination.component.scss',
})
export class AppPaginationComponent {
  @Input() visible = true;
  @Input() first = 0;
  @Input() rows = 10;
  @Input() totalRecords = 0;
  @Input() rowsPerPageOptions: number[] = [10, 20, 50];
  @Input() reportTemplate = 'Showing {first} to {last} of {totalRecords} items';
  @Output() pageChange = new EventEmitter<PaginatorState>();
}
