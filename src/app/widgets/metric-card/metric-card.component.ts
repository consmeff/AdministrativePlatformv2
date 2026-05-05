import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.scss',
})
export class MetricCardComponent {
  @Input() variant: 'default' | 'filter' = 'default';
  @Input() title = '';
  @Input() value: string | number = 0;
  @Input() icon = '';
  @Input() active = false;
  @Input() subtext = '';
  @Input() clickable = false;
  @Output() cardClick = new EventEmitter<void>();

  onCardClick() {
    if (!this.clickable) {
      return;
    }
    this.cardClick.emit();
  }
}
