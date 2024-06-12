import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { mainPort } from '../../app.component';
import { Teacher } from '../../interfaces/Teacher';
import { User } from '../../interfaces/User';
import { NgFor, NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationComponent } from '../../matdialogs/confirmation/confirmation.component';
import { EditUserComponent } from '../../matdialogs/edit-user/edit-user.component';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddTeacherComponent } from '../../matdialogs/add-teacher/add-teacher.component';


@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [MatSlideToggleModule, NgFor, MatIcon, MatButton, MatTooltipModule, NgIf],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit{
  constructor(
    private http: HttpClient,
    private dialog: MatDialog
  )
  {}
  //Variables
  selectedMode = "Teachers";
  teachers: Teacher[] = [];
  students: User[] = [];
  isCheckedList: boolean[] = [];

  switchMode(mode: string){
    this.selectedMode = mode;
  }

  ngOnInit(): void {
    //Fetch Teachers
    this.http.get<Teacher[]>(`${mainPort}/pdo/api/get_consultants`).subscribe(result=>{
      this.teachers = result;
    })
    //Fetch Users
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<User[]>(`${mainPort}/pdo/api/get_users`, { headers }).subscribe(result=>{
      this.students = result;
    })
  }

  //Teacher Functions
  editTeacher(id: number) {
    const dialogRef = this.dialog.open(EditUserComponent, {
        height: '50vh',
        width: '40vw',
        data: {
            teacherid: id
        }
    });

    dialogRef.afterClosed().subscribe(() => {
        this.http.get<Teacher[]>(`${mainPort}/pdo/api/get_consultants`).subscribe(result => {
            this.teachers = result;
        });
    });
}
  confirmDeleteTeacher(id: number, fname:string, lstring:string) {
    const  dialogRef = this.dialog.open(ConfirmationComponent, {
      data: {
        title: "Delete this teacher?",
        description: `Are you sure you want to delete ${fname} ${lstring}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.deleteTeacher(id);
      }
    });
  }
  deleteTeacher(id:number){
    console.log(localStorage.getItem('token'));
    console.log(id)
    const data = {
      id:id,
      key:localStorage.getItem('token')
    }
    this.http.post(`${mainPort}/pdo/api/delete_teacher`, data).subscribe(result=>{
      if(result === true){
        console.log('deleted')
        this.http.get<Teacher[]>(`${mainPort}/pdo/api/get_consultants`).subscribe(result=>{
          this.teachers = result;
        })
      }
      else{
        console.log('not')
        this.http.get<Teacher[]>(`${mainPort}/pdo/api/get_consultants`).subscribe(result=>{
          this.teachers = result;
        })
      }
    })
  }

  //Checkbox
  onCheckboxChange(index: number) {
    const isChecked = this.isCheckedList[index];
    // Perform HTTP POST request here using isChecked value
    if (isChecked) {
      // Execute HTTP POST request
      this.http.post<any>('your-post-endpoint', { checked: true }).subscribe(response => {
        // Handle response if needed
      });
    }
  }

  //Add Teacher
  addTeacher(){
    const addTeacher = this.dialog.open(AddTeacherComponent, {
      width: '70vw',
      height: '75vh',
      data: {
        title: 'Add Teacher'
      }
    })

    addTeacher.afterClosed().subscribe(result => {
      this.http.get<Teacher[]>(`${mainPort}/pdo/api/get_consultants`).subscribe(result=>{
        this.teachers = result;
      })
    })
  }

}
