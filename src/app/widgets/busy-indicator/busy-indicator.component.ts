import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-busy-indicator',
  imports: [CommonModule],
  templateUrl: './busy-indicator.component.html',
  styleUrls: ['./busy-indicator.component.scss'],
})
export class BusyIndicatorComponent {
  @Input() isActive = false;
  @Input() colorStart = '#4f46e5';
  @Input() colorMiddle = '#ec4899';
  @Input() colorEnd = '#4f46e5';
  @Input() height = '3px';
  @Input() position: 'fixed' | 'absolute' | 'relative' = 'fixed';

  get dynamicStyles(): Record<string, string> {
    const styles: Record<string, string> = {
      background: `linear-gradient(90deg, ${this.colorStart}, ${this.colorMiddle}, ${this.colorEnd})`,
      'background-size': '200% 100%',
      height: this.height,
    };

    styles['position'] = this.position;
    if (this.position === 'fixed') {
      styles['top'] = '0';
      styles['left'] = '0';
    }
    return styles;
  }
}
