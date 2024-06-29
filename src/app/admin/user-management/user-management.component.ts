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
import { EditStudentComponent } from '../../matdialogs/edit-student/edit-student.component';
import { AddStudentComponent } from '../../matdialogs/add-student/add-student.component';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [MatSlideToggleModule, NgFor, MatIcon, MatButton, MatTooltipModule, NgIf, MatCheckbox, FormsModule],
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
  filteredTeachers: Teacher[] = [];
  filteredStudents: User[] = [];
  isCheckedList: boolean[] = [];
  bscsToggle: boolean = true;
  bsitToggle: boolean = true;
  bsemcToggle: boolean = true;
  coordinatorToggle: boolean = true;
  deletedToggle: boolean = false;

  switchMode(mode: string){
    this.selectedMode = mode;
  }

  ngOnInit(): void {
    //Fetch Teachers
    this.http.get<Teacher[]>(`${mainPort}/pdo/api/get_consultants`).subscribe(result=>{
      this.teachers = result;
      this.filteredTeachers = this.teachers.filter(teacher => teacher.Email !== null)
    })
    //Fetch Users
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<User[]>(`${mainPort}/pdo/api/get_users`, { headers }).subscribe(result=>{
      this.students = result;
      this.filteredStudents = this.students.filter(student => student.Email !== null)
    })
  }

  //Filter Deleted Accounts
  toggleFilter(){
    //Deleted Email Toggle
    if(this.deletedToggle == true){
      this.filteredStudents = this.students
      this.filteredTeachers = this.teachers
    }
    else{
      this.filteredStudents = this.students.filter(student => student.Email !== null)
      this.filteredTeachers = this.teachers.filter(teacher => teacher.Email !== null)
    }
    //BSCS
    if(this.bscsToggle == false){
      this.filteredStudents = this.students.filter(student => student.Course !== "BSCS")
      this.filteredTeachers = this.teachers.filter(teacher => teacher.department !== "BSCS")  
    }
    //BSIT
    if(this.bsitToggle == false){
      this.filteredStudents = this.students.filter(student => student.Course !== "BSIT")
      this.filteredTeachers = this.teachers.filter(teacher => teacher.department !== "BSIT")  
    }
    //BSEMC
    if(this.bsemcToggle == false){
      this.filteredStudents = this.students.filter(student => student.Course !== "BSEMC")
      this.filteredTeachers = this.teachers.filter(teacher => teacher.department !== "BSEMC")  
    }
    //Coordinator
    if(this.coordinatorToggle == false){
      this.filteredTeachers = this.teachers.filter(teacher => teacher.headteacher == false)  
    }
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
            this.toggleFilter();
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

  //Student Management
  addStudent(){
    const addTeacher = this.dialog.open(AddStudentComponent, {
      width: '70vw',
      height: '75vh',
      data: {
        title: 'Add Student'
      }
    })

    addTeacher.afterClosed().subscribe(result => {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.get<User[]>(`${mainPort}/pdo/api/get_users`, { headers }).subscribe(result=>{
        this.students = result;
      })
    })
  }

  editStudent(id: number) {
      const dialogRef = this.dialog.open(EditStudentComponent, {
          height: '50vh',
          width: '40vw',
          data: {
              studentid: id
          }
      });
  
      dialogRef.afterClosed().subscribe(() => {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        this.http.get<User[]>(`${mainPort}/pdo/api/get_users`, { headers }).subscribe(result=>{
          this.students = result;
          this.toggleFilter();
        })
      });
  }

  confirmDeleteStudent(id: number, fname:string, lstring:string) {
    const  dialogRef = this.dialog.open(ConfirmationComponent, {
      data: {
        title: "Delete this student?",
        description: `Are you sure you want to delete ${fname} ${lstring}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.deleteStudent(id);
      }
    });
  }
  deleteStudent(id:number){
    console.log(localStorage.getItem('token'));
    console.log(id)
    const data = {
      id:id,
      key:localStorage.getItem('token')
    }
    this.http.post(`${mainPort}/pdo/api/delete_student`, data).subscribe(result=>{
      if(result === true){
        console.log('deleted')
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        this.http.get<User[]>(`${mainPort}/pdo/api/get_users`, { headers }).subscribe(result=>{
          this.students = result;
        })
      }
      else{
        console.log('not')
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        this.http.get<User[]>(`${mainPort}/pdo/api/get_users`, { headers }).subscribe(result=>{
          this.students = result;
        })
      }
    })
  }

}
