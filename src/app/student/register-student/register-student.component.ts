import { Component } from '@angular/core';
import { ErrorComponent } from '../../matdialogs/error/error.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuthServiceService } from '../../services/auth-service.service';
import { Router } from '@angular/router';
import { NavbarComponent } from "../../layouts/navbar/navbar.component";
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-register-student',
    standalone: true,
    templateUrl: './register-student.component.html',
    styleUrl: './register-student.component.css',
    imports: [ReactiveFormsModule, NavbarComponent, NgIf]
})
export class RegisterStudentComponent {
  myForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    fname: ['', Validators.required],
    lname: ['', Validators.required],
    birthday: ['', Validators.required],
    gender: ['', Validators.required],
    course: ['', Validators.required],
    year: ['', Validators.required],
    block: ['', Validators.required],
    password: ['', Validators.required],
    confirmpassword: ['', Validators.required],
  })

  constructor(private formBuilder: FormBuilder, public dialog: MatDialog, private authService: AuthServiceService, public router: Router) {}

  onSubmit() {  
    if(this.myForm.valid){
      if(this.myForm.get('password')?.value == this.myForm.get('confirmpassword')?.value){
        this.authService.register(this.myForm.value)
        .subscribe(token => {
          //Registration Error
          if(token == 1){
            this.openRegistrationErrorDialog();
            return;
          }
          //Existing Email Error
          else if(token == 2){
            this.openExistingEmailErrorDialog();
          }
          else if(token != false || token != null) {
            const title = "Login Successful"
            const description = "Redirected to Dashboard"
            this.openDialogtemplate(title, description);
            localStorage.setItem('token', token);
            localStorage.setItem('user', 'user')
            this.router.navigate(['/student/dashboard/main'])
          }
        },
          error => {
            console.error('Login failed:', error);
          });
      } else{
        //Pop-up
        this.openPasswordMismatchDialog();
      }
    } else {
      this.openIncompleteDialog();
    }
  }
  openPasswordMismatchDialog(): void {
    this.dialog.open(ErrorComponent, {
      width: '300px',
      data: {
        title: 'Password Mismatch',
        description: 'The entered passwords do not match.'
      }
    });
  }
  openIncompleteDialog(): void {
    this.dialog.open(ErrorComponent, {
      width: '300px',
      data: {
        title: 'Incomplete Form',
        description: 'Please fill-up the entire registration form.'
      }
    });
  }
  openRegistrationErrorDialog(): void{
    this.dialog.open(ErrorComponent, {
      width: '300px',
      data: {
        title: 'Registration Error',
        description: 'We apologize, but the registration process encountered an error.'
      }
    });
  }
  openExistingEmailErrorDialog(): void{
    this.dialog.open(ErrorComponent, {
      width: '300px',
      data: {
        title: 'Registration Error',
        description: 'Email is already registered.'
      }
    });
  }
  openDialogtemplate(title:string, description:string): void{
    this.dialog.open(ErrorComponent, {
      width: '300px',
      data: {
        title: title,
        description: description
      }
    })
  }
}
