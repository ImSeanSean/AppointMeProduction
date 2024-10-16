import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../services/auth-service.service';
import { NavbarComponent } from "../../layouts/navbar/navbar.component";
import { UserInformationService } from '../../services/user-information/user-information.service';
import { jwtDecode } from 'jwt-decode';

@Component({
    selector: 'app-teacher-login',
    standalone: true,
    templateUrl: './teacher-login.component.html',
    styleUrl: './teacher-login.component.css',
    imports: [ReactiveFormsModule, NavbarComponent]
})
export class TeacherLoginComponent implements OnInit{
  onSubmit: any;
  formGroup: FormGroup;

  constructor(private formBuilder: FormBuilder, private authsService: AuthServiceService, private router: Router, private userInformation: UserInformationService) {
    this.formGroup = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
  loginTeacher() {
    if (this.formGroup.valid) {
      this.authsService.loginTeacher(this.formGroup.value)
      .subscribe(token => {
        if (token != false) {
          console.log('Correct Authentication')
          localStorage.setItem('token', token);
          localStorage.setItem('user', 'teacher')
          const decodedToken: any = jwtDecode(token);
          const userId = decodedToken.user_id;
          localStorage.setItem('id', userId)
          this.router.navigate(['teacher/dashboard/appointments'])
        } else {
          console.log('Wrong Authentication')
        }
      },
        error => {
          console.error('Login failed:', error);
        });
    }
  }
  ngOnInit(): void {

  }
}
