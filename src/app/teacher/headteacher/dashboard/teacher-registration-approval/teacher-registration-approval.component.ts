import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Teacher } from '../../../../interfaces/Teacher';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-teacher-registration-approval',
  standalone: true,
  imports: [NgFor],
  templateUrl: './teacher-registration-approval.component.html',
  styleUrl: './teacher-registration-approval.component.css'
})
export class TeacherRegistrationApprovalComponent {
  private apiUrl = 'http://localhost/appointme/pdo/api/get_consultants';
  teachers: Teacher[] = [];
  approvedTeachers: any[] = [];
  selectedTeacher: Teacher | undefined;

  constructor(private http: HttpClient, private router: Router) {};

  getTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(this.apiUrl);
  }

  showTeacherDetails(teacher: Teacher): void {
    this.selectedTeacher = teacher;
  }
  
  approveTeacher(teacherId: any): void {
    if(teacherId == undefined){
      return
    }
    console.log(teacherId)
    const data = { teacher_id: teacherId }; 

    this.http.post('http://localhost/appointme/pdo/api/approve_teacher', data)
      .subscribe(
        (response: any) => {
          console.log(response); 
          if (response.success) {
            // Handle success response if needed
            console.log('success')
          } else {
            // Handle failure response if needed
            console.log('fail')
          }
        }
      );
  }

  ngOnInit(): void {
    this.getTeachers().subscribe(
      (data: Teacher[]) => {
        this.teachers = data;
        this.approvedTeachers = this.teachers.filter(teacher => teacher.approved == false);
      },
      (error) => {
        console.error('Error fetching teachers:', error);
      }
    );
  }
}
