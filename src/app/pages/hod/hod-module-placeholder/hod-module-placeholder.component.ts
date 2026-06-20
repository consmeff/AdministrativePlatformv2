import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-hod-module-placeholder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hod-module-placeholder.component.html',
  styleUrl: './hod-module-placeholder.component.scss',
})
export class HodModulePlaceholderComponent {
  private readonly route = inject(ActivatedRoute);

  readonly title = this.route.snapshot.data['title'] as string;
  readonly description = this.route.snapshot.data['description'] as string;
}
