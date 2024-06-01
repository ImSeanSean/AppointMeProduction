import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Teacher } from '../../../../interfaces/Teacher';
import { NgFor, NgIf } from '@angular/common';
import { ErrorComponent } from '../../../../matdialogs/error/error.component';
import { MatDialog } from '@angular/material/dialog';
import { mainPort } from '../../../../app.component';

@Component({
  selector: 'app-teacher-registration-approval',
  standalone: true,
  imports: [NgFor],
  templateUrl: './teacher-registration-approval.component.html',
  styleUrl: './teacher-registration-approval.component.css'
})
export class TeacherRegistrationApprovalComponent {
  private apiUrl = `${mainPort}/pdo/api/get_consultants`;
  teachers: Teacher[] = [];
  approvedTeachers: any[] = [];
  selectedTeacher: Teacher | undefined;

  constructor(private http: HttpClient, private router: Router, public dialog: MatDialog) {};

  getTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(this.apiUrl);
  }

  showTeacherDetails(teacher: Teacher): void {
    this.selectedTeacher = teacher;
  }
  
  approveTeacher(teacherId: any): void {
    if(teacherId == undefined){
      this.dialog.open(ErrorComponent, {
        width: '300px',
        data: {
          title: 'No Teacher Selected',
          description: "Please select a teacher."
        }
      });
      return;
    }
    const data = { 
      key: localStorage.getItem('token'),
      teacher_id: teacherId 
    }; 

    this.http.post(`${mainPort}/pdo/api/approve_teacher`, data)
      .subscribe(
        (response) => {
          this.dialog.open(ErrorComponent, {
            width: '300px',
            data: {
              title: 'Approval Status',
              description: "Registration approved successfully."
            }
          });
          this.getTeachers().subscribe(
            (data: Teacher[]) => {
              this.teachers = data;
              this.approvedTeachers = this.teachers
            },
            (error) => {
              console.error('Error fetching teachers:', error);
            }
          );
          this.selectedTeacher = undefined;
        },
        (error) => {
          this.dialog.open(ErrorComponent, {
            width: '300px',
            data: {
              title: 'Rejection Status',
              description: "Registration approval failed."
            }
          });
        }
      )
  }

  rejectTeacher(teacherId: any): void {
    if(teacherId == undefined){
      this.dialog.open(ErrorComponent, {
        width: '300px',
        data: {
          title: 'No Teacher Selected',
          description: "Please select a teacher."
        }
      });
      return;
    }
    const data = { 
      key: localStorage.getItem('token'),
      teacher_id: teacherId 
    }; 

    this.http.post(`${mainPort}/pdo/api/reject_teacher`, data)
      .subscribe(
        (response) => {
          this.dialog.open(ErrorComponent, {
            width: '300px',
            data: {
              title: 'Rejection Status',
              description: "Registration rejected successfully."
            }
          });
          this.getTeachers().subscribe(
            (data: Teacher[]) => {
              this.teachers = data;
              this.approvedTeachers = this.teachers
            },
            (error) => {
              console.error('Error fetching teachers:', error);
            }
          );
          this.selectedTeacher = undefined;
        },
        (error) => {
          this.dialog.open(ErrorComponent, {
            width: '300px',
            data: {
              title: 'Rejection Status',
              description: "Registration rejection failed."
            }
          });
        }
      )
  }


  
  ngOnInit(): void {
    this.getTeachers().subscribe(
      (data: Teacher[]) => {
        this.teachers = data;
        this.approvedTeachers = this.teachers
      },
      (error) => {
        console.error('Error fetching teachers:', error);
      }
    );
  }
}
