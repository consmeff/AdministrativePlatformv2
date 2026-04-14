import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-otp-input',
  imports: [CommonModule, InputTextModule],
  templateUrl: './otp-input.component.html',
  styleUrl: './otp-input.component.scss',
})
export class OtpInputComponent {
  @Input() idPrefix = 'otp';
  @Input() digits = ['', '', '', '', '', ''];
  @Input() label = '';
  @Output() digitsChange = new EventEmitter<string[]>();

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    this.digits[index] = value.slice(-1);
    this.digitsChange.emit([...this.digits]);
    if (this.digits[index] && index < this.digits.length - 1) {
      const nextElement = document.getElementById(
        `${this.idPrefix}-${index + 1}`,
      ) as HTMLInputElement | null;
      nextElement?.focus();
    }
  }

  onBackspace(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.digits[index] && index > 0) {
      const prevElement = document.getElementById(
        `${this.idPrefix}-${index - 1}`,
      ) as HTMLInputElement | null;
      prevElement?.focus();
    }
  }
}
