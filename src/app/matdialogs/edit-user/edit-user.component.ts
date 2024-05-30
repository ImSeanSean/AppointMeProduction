import { NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { MatDialogContent, MatDialogActions, MatDialogClose, MatDialogTitle, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { ConfirmationComponent } from '../confirmation/confirmation.component';
import { HttpClient } from '@angular/common/http';
import { mainPort } from '../../app.component';


@Component({
  selector: 'app-edit-user',
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
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.css'
})
export class EditUserComponent {
  textareaContent = "";
  selectedValue = "";
  gender = "";
  birthday = "";
  teacherid = "";

constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<ConfirmationComponent>, private http: HttpClient) {
    if (data) {
        this.teacherid = data.teacherid;
    }
}

  updateTeacher(){
    const data = {
      column: this.selectedValue,
      consultantId: this.teacherid,
      value: this.textareaContent
    }
    console.log(data);
    this.http.post(`${mainPort}/pdo/api/update_teacher`, data).subscribe(result=>{
      console.log(result);
    })
    this.dialogRef.close();
  }
}
