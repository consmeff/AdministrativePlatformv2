import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { ShareModule } from '../../shared/share/share.module';
import { LoginFormComponent } from './login-form/login-form.component';

interface CarouselSlide {
  title: string;
  image: string;
}

@Component({
  selector: 'app-login',
  imports: [CommonModule, ShareModule, CarouselModule, LoginFormComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  carouselSlides: CarouselSlide[] = [
    {
      title: 'School Auditorium',
      image: '/assets/dashboard/Capa_1.png',
    },
    {
      title: 'Campus View',
      image: '/assets/dashboard/Layer_1.png',
    },
    {
      title: 'Academic Block',
      image: '/assets/dashboard/Layer_2.png',
    },
  ];
}
