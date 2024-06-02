import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthServiceService } from '../../services/auth-service.service';
import { UsertypedialogComponent } from '../../matdialogs/usertypedialog/usertypedialog.component';
import { MatDialog } from '@angular/material/dialog';
import { NavbarComponent } from "../../layouts/navbar/navbar.component";
import { TeacherRegistrationApprovalComponent } from "../../teacher/headteacher/dashboard/teacher-registration-approval/teacher-registration-approval.component";
import { jwtDecode } from 'jwt-decode';

@Component({
    selector: 'app-login-student',
    standalone: true,
    templateUrl: './login-student.component.html',
    styleUrl: './login-student.component.css',
    imports: [ReactiveFormsModule, NavbarComponent, TeacherRegistrationApprovalComponent, RouterLink]
})
export class LoginStudentComponent implements OnInit {
  onSubmit: any;
  formGroup: FormGroup;

  constructor(private formBuilder: FormBuilder, private authsService: AuthServiceService, private router: Router, public dialog: MatDialog) {
    this.formGroup = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
  redirectToHomePage(){
    this.router.navigate([''])
  }
  openLoginDialog(): void {
    const dialogRef = this.dialog.open(UsertypedialogComponent, {
      width: '300px',
    });

    dialogRef.componentInstance.userType.subscribe((selectedUserType: string) => {
     this.router.navigate(['./'+ selectedUserType + '/login'])
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
            const decodedToken: any = jwtDecode(token);
            const userId = decodedToken.user_id;
            localStorage.setItem('id', userId)
            this.router.navigate(['student/dashboard/main'])
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
          this.router.navigate(['/dashboard/appointments'])
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
