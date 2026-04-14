import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    SimpleNotificationsModule,
    NgxSpinnerModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  exports: [
    CommonModule,
    RouterModule,
    SimpleNotificationsModule,
    NgxSpinnerModule,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class ShareModule {}
