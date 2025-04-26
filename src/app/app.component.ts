import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BusyIndicatorComponent } from './widgets/busy-indicator/busy-indicator.component';
import { BusyIndicatorService } from './services/busy-indicator.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,BusyIndicatorComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'consmmefadmin';

  isLoading$: Observable<boolean>;

  constructor(private busyIndicatorService: BusyIndicatorService) {
    this.isLoading$ = this.busyIndicatorService.isLoading$;
  }
}
