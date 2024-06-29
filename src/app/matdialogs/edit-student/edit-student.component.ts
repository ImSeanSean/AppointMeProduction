import { Component, Inject } from '@angular/core';
import { mainPort } from '../../app.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Teacher } from '../../interfaces/Teacher';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { User } from '../../interfaces/User';

@Component({
  selector: 'app-edit-student',
  standalone: true,
  imports: [
    MatDialogContent, 
    MatDialogActions, 
    MatDialogClose, 
    MatDialogTitle, 
    MatFormField, 
    MatLabel, 
    MatHint,
    FormsModule, 
    MatSelect, 
    MatOption, 
    MatDatepickerModule,
    NgIf],
  templateUrl: './edit-student.component.html',
  styleUrl: './edit-student.component.css'
})
export class EditStudentComponent {
  textareaContent = "";
  selectedValue = "";
  gender = "";
  birthday = "";
  studentid = "";
  student: User[] = []

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<EditUserComponent>, private http: HttpClient) {
    if (data) {
      this.studentid = data.studentid;
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.get<User[]>(`${mainPort}/pdo/api/get_user/${this.studentid}`, { headers }).subscribe(result => {
        this.student = result;
        console.log(this.student)
      });
    }
  }

  onSelectionChange() {
    if (this.student) {
      switch (this.selectedValue) {
        case 'Email':
          this.textareaContent = this.student[0].Email;
          break;
        case 'Password':
          this.textareaContent = this.student[0].Password;
          break;
        case 'FirstName':
          this.textareaContent = this.student[0].FirstName;
          break;
        case 'LastName':
          this.textareaContent = this.student[0].LastName;
          break;
        case 'course':
          this.textareaContent = this.student[0].Course;
          break;
        case 'block':
          this.textareaContent = this.student[0].block;
          break;
        case 'year':
          this.textareaContent = this.student[0].year.toString();
          break;
        case 'bday':
          this.textareaContent = this.student[0].bday;
          break;
        case 'gender':
          this.textareaContent = this.student[0].gender;
          break;
        default:
          this.textareaContent = '';
      }
    }
  }

  updateTeacher() {
    const data = {
      column: this.selectedValue,
      studentId: this.studentid,
      value: this.textareaContent
    };
    console.log(data);
    this.http.post(`${mainPort}/pdo/api/update_student`, data).subscribe(result => {
      console.log(result);
      this.dialogRef.close();
    });
  }
}
