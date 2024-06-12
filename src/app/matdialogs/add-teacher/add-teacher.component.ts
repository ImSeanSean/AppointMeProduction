import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { ConfirmationComponent } from '../confirmation/confirmation.component';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ErrorStateMatcher, provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, FormGroupDirective, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgIf } from '@angular/common';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { mainPort } from '../../app.component';
import { ErrorComponent } from '../error/error.component';

export function passwordMatchValidator(password: string, confirmPassword: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const passwordControl = formGroup.get(password);
    const confirmPasswordControl = formGroup.get(confirmPassword);

    if (!passwordControl || !confirmPasswordControl) {
      return null;
    }

    if (confirmPasswordControl.errors && !confirmPasswordControl.errors['passwordMismatch']) {
      return null;
    }

    if (passwordControl.value !== confirmPasswordControl.value) {
      confirmPasswordControl.setErrors({ passwordMismatch: true });
    } else {
      confirmPasswordControl.setErrors(null);
    }

    return null;
  };
}

export function gordonCollegeEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const email = control.value;
    if (email && !email.endsWith('@gordoncollege.edu.ph')) {
      return { 'gordonCollegeEmail': true };
    }
    return null;
  };
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-add-teacher',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatDialogContent, 
            MatDialogActions, 
            MatDialogClose, 
            MatDialogTitle, 
            MatFormField, 
            MatLabel, 
            MatSelect, 
            MatOption, 
            MatCheckboxModule, 
            ReactiveFormsModule, 
            MatInputModule, 
            MatFormFieldModule,
            MatDatepickerModule,
            FormsModule,
            NgIf],
  templateUrl: './add-teacher.component.html',
  styleUrl: './add-teacher.component.css'
})

export class AddTeacherComponent {
  title: string = 'Confirmation';
  description: string = 'Are you sure?';

  matcher = new MyErrorStateMatcher();

  teacherForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email, gordonCollegeEmailValidator()]),
    department: new FormControl('', Validators.required),
    position: new FormControl('', Validators.required),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
    fname: new FormControl('', Validators.required),
    lname: new FormControl('', Validators.required),
    birthday: new FormControl('', Validators.required),
    gender: new FormControl('', Validators.required)
  }, { validators: passwordMatchValidator('password', 'confirmPassword') });

  constructor(public dialogRef: MatDialogRef<AddTeacherComponent>, private http: HttpClient, private dialog: MatDialog) {
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
  
  //Add Teacher
  addTeacher(){
    this.closeDialog();
    if (this.teacherForm.valid){
      const data = this.teacherForm.value;
      this.http.post(`${mainPort}/pdo/api/register_teacher`, data).subscribe
      (result => {
        if(result == 2){
          this.dialog.open(ErrorComponent, {
            width: '300px',
            data: {
              title: 'Account Status',
              description: 'Email is already used by another account.'
            }
          });
        }
        else if(result == 1){
          this.dialog.open(ErrorComponent, {
            width: '300px',
            data: {
              title: 'An Error Occured',
              description: 'Sorry, an error was encountered during the account creation.'
            }
          })
        }
        else if (typeof result === 'string') {
          // Registration successful, response contains the token
          this.dialog.open(ErrorComponent, {
            width: '300px',
            data: {
              title: 'Account Created',
              description: 'Faculty Account successfully created.'
            }
          })
        } else {
          // Handle unexpected response
          this.dialog.open(ErrorComponent, {
            width: '300px',
            data: {
              title: 'An Unexpected Error Occured',
              description: 'Apologies, an unexpected error occured.'
            }
          })
        }
      },
      (error:any) => {
        console.error("HTTP request error: ", error);
      })
    }
  }
}
