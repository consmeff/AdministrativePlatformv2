import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-htmlicon',
  imports: [CommonModule],
  templateUrl: './htmlicon.component.html',
  styleUrl: './htmlicon.component.scss'
})
export class HtmliconComponent {
  @Input() iconClass!: string;

}
