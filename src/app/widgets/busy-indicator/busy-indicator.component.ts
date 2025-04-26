import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-busy-indicator',
  imports:[CommonModule],
  templateUrl: './busy-indicator.component.html',
  styleUrls: ['./busy-indicator.component.scss']
})
export class BusyIndicatorComponent implements OnChanges {
  @Input() isActive: boolean = false;
  @Input() colorStart: string = '#4f46e5';
  @Input() colorMiddle: string = '#ec4899';
  @Input() colorEnd: string = '#4f46e5';
  @Input() height: string = '3px';
  @Input() position: 'fixed' | 'absolute' | 'relative' = 'fixed';

  dynamicStyles: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    this.updateStyles();
  }

  private updateStyles(): void {
    this.dynamicStyles = {
      'background': `linear-gradient(90deg, ${this.colorStart}, ${this.colorMiddle}, ${this.colorEnd})`,
      'background-size': '200% 100%',
      'height': this.height
    };

    this.dynamicStyles['position'] = this.position;
    if (this.position === 'fixed') {
      this.dynamicStyles['top'] = '0';
      this.dynamicStyles['left'] = '0';
    }
  }
}