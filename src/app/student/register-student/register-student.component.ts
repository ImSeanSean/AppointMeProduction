import { AbstractControl, ValidationErrors } from '@angular/forms';

function gordonCollegeEmailValidator(control: AbstractControl): ValidationErrors | null {
  const email = control.value;
  const domain = '@gordoncollege.edu.ph';
  if (email && !email.endsWith(domain)) {
    return { gordonCollegeEmail: true };
  }
  return null;
}

import { Component } from '@angular/core';
import { ErrorComponent } from '../../matdialogs/error/error.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuthServiceService } from '../../services/auth-service.service';
import { Router } from '@angular/router';
import { NavbarComponent } from "../../layouts/navbar/navbar.component";
import { NgIf } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { mainPort } from '../../app.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-register-student',
    standalone: true,
    templateUrl: './register-student.component.html',
    styleUrl: './register-student.component.css',
    imports: [ReactiveFormsModule, NavbarComponent, NgIf]
})
export class RegisterStudentComponent {
  myForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email, gordonCollegeEmailValidator]],
    emailCode: ['', [Validators.required]],
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
  isButtonDisabled = false;
  cooldownMessage: string | null = null;
  private cooldownTime = 15; 
  private timeoutId: any;


  constructor(
    private formBuilder: FormBuilder, 
    public dialog: MatDialog, 
    private authService: AuthServiceService, 
    public router: Router, 
    private http: HttpClient, 
    private _snackBar: MatSnackBar) {}

  onSubmit() {  
    if(this.myForm.valid){
      if(this.myForm.get('password')?.value == this.myForm.get('confirmpassword')?.value){
        this.authService.register(this.myForm.value)
        .subscribe(token => {
          console.log(token)
          //Registration Error
          if(token == 1){
            this.openRegistrationErrorDialog();
            return;
          }
          //Existing Email Error
          else if(token == 2){
            this.openExistingEmailErrorDialog();
          }
          else if(token == 3){
            this.openWrongCodeErrorDialog();
          }
          else if(token != false || token != null) {
            const title = "Login Successful"
            const description = "Redirected to Dashboard"
            this.openDialogtemplate(title, description);
            localStorage.setItem('token', token);
            localStorage.setItem('user', 'user');
            const decodedToken: any = jwtDecode(token);
            const userId = decodedToken.user_id;
            localStorage.setItem('id', userId)
            this.router.navigate(['/student/dashboard/main'])
          }
        },
          error => {
            this.openRegistrationErrorDialog();
            return;
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
  openWrongCodeErrorDialog(): void{
    this.dialog.open(ErrorComponent, {
      width: '300px',
      data: {
        title: 'Invalid Validation Code',
        description: 'Invalid Verification Code'
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
  sendVerification(): void {
      const emailControl = this.myForm.get('email');
      if (emailControl?.valid) {
        const email = emailControl.value;

        const data = {
          email: email
        }

        this.startCooldown();

        this.http.post(`${mainPort}/pdo/api/verification`, data).subscribe(result => {
          if(result){
            this._snackBar.open('Verification Code Succesfully Sent.', 'Confirm')
          }else {
            this._snackBar.open('Verification Code Unsuccessfully Sent.', 'Confirm')
          }
        });
      } else {
        // Handle invalid email, e.g., show a dialog or a toast message
        this.dialog.open(ErrorComponent, {
          width: '400px',
          data: {
            title: 'Invalid Email',
            description: 'Please enter a valid email address ending with @gordoncollege.edu.ph.'
          }
        });
      }
    } 
    //Timer
    private startCooldown(): void {
      this.isButtonDisabled = true;
      this.cooldownMessage = `Code sent! Please wait ${this.cooldownTime} seconds before requesting a new code.`;
  
      this.timeoutId = setTimeout(() => {
        this.isButtonDisabled = false;
        this.cooldownMessage = null;
      }, this.cooldownTime * 1000); // Convert seconds to milliseconds
    }
  
    ngOnDestroy(): void {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
    }
  }
