import { Component } from '@angular/core';
import { DashboardStudentComponent } from "../../../layouts/dashboard-student/dashboard-student.component";
import { Teacher } from '../../../interfaces/Teacher';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeacherCardComponent } from "../../../components/teacher-card/teacher-card.component";

@Component({
    selector: 'app-teacher-list',
    standalone: true,
    templateUrl: './teacher-list.component.html',
    styleUrl: './teacher-list.component.css',
    imports: [DashboardStudentComponent, TeacherCardComponent]
})
export class TeacherListComponent {
    private apiUrl = 'http://localhost/appointme/pdo/api/get_consultants';
    teachers: Teacher[] = [];  
  
    constructor(private http: HttpClient) {}
  
    getTeachers(): Observable<Teacher[]> {
      return this.http.get<Teacher[]>(this.apiUrl);
    }
  
    ngOnInit(): void {
      this.getTeachers().subscribe(
        (data: Teacher[]) => {
          this.teachers = data;
        },
        (error) => {
          console.error('Error fetching teachers:', error);
        }
      );
    }
}
