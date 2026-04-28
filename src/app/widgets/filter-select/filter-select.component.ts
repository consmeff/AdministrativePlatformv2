import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-filter-select',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './filter-select.component.html',
  styleUrl: './filter-select.component.scss',
})
export class FilterSelectComponent<T = unknown> {
  @Input() options: T[] = [];
  @Input() model!: T;
  @Input() optionLabel = 'name';
  @Input() placeholder = 'Select';
  @Output() modelChange = new EventEmitter<T>();
}
