import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../services/auth-service.service';

@Component({
  selector: 'app-teacher-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './teacher-login.component.html',
  styleUrl: './teacher-login.component.css'
})
export class TeacherLoginComponent implements OnInit{
  onSubmit: any;
  formGroup: FormGroup;

  constructor(private formBuilder: FormBuilder, private authsService: AuthServiceService, private router: Router) {
    this.formGroup = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
  loginStudent() {
    if (this.formGroup.valid) {
      this.authsService.login(this.formGroup.value)
        .subscribe(token => {
          if (token != false) {
            console.log('Correct Authentication')
            localStorage.setItem('token', token);
            localStorage.setItem('user', 'user')
            this.router.navigate(['/dashboard'])
          } else {
            console.log('Wrong Authentication')
          }
        },
          error => {
            console.error('Login failed:', error);
          });
    }
  }
  loginTeacher() {
    if (this.formGroup.valid) {
      this.authsService.loginTeacher(this.formGroup.value)
      .subscribe(token => {
        if (token != false) {
          console.log('Correct Authentication')
          localStorage.setItem('token', token);
          localStorage.setItem('user', 'teacher')
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
