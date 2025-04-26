import { Component, inject, OnInit } from '@angular/core';
import { FieldsetModule } from 'primeng/fieldset';
import { AuthService } from '../../services/auth.service';
import { ShareModule } from '../../shared/share/share.module';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NotificationsService, SimpleNotificationsModule } from 'angular2-notifications';
import { NgxSpinner, NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { DashboardinformationService } from '../../services/dashboardinformation.service';
import { DashboardInfo } from '../../model/dashboard/information.dto';




@Component({
  selector: 'app-login',
  imports: [FieldsetModule, ShareModule],
  providers: [AuthService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  

  passToggle: boolean = false;


  constructor(private authService: AuthService,
    private alertService: NotificationsService,
    private router: Router,
    private spinner: NgxSpinnerService,
  ) {

  }
  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  showToggle() {
    this.passToggle = !this.passToggle;

  }
  login() {
    this.spinner.show();
    let payload: { username: string, password: string } = {
      password: this.loginForm.controls["password"].value,
      username: this.loginForm.controls["email"].value,
    }
    this.authService.login(payload).subscribe({
      next: (result) => {
        
        this.alertService.success("Login", "Login successful");
        this.spinner.hide();
      },
      error: (err) => {
        let erMsg = "Login Failed";


        if (err.error && err.error?.errors?.non_field_errors) {
          erMsg = err.error.errors.non_field_errors[0];
        } else
          if (err.error && err.error.non_field_errors) {
            erMsg = err.error.non_field_errors[0];
          } else {
            erMsg = err.error.message;
          }
        this.alertService.error("Login", erMsg)
        this.spinner.hide()

      },
      complete: () => {
        this.spinner.hide();
      },
    })
  }


  destroyed(event: any) {
    // console.log(event)
    if (event.type == "success") {
      this.router.navigateByUrl("/pages/dashboard")
    }


  }
}

