import { Component, OnInit } from '@angular/core';
import { Teacher } from '../../interfaces/Teacher';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { DaySchedule } from '../../interfaces/DaySchedule';
import { mainPort } from '../../app.component';

@Component({
  selector: 'app-teacher-card',
  standalone: true,
  imports: [NgFor, NgIf, CommonModule],
  templateUrl: './teacher-card.component.html',
  styleUrl: './teacher-card.component.css'
})
export class TeacherCardComponent implements OnInit {
  private apiUrl = `${mainPort}/pdo/api/get_consultants`;
  teachers: Teacher[] = [];
  approvedTeachers: any[] = [];
  token = localStorage.getItem('token');
  teacherScheduleMap: Map<number, DaySchedule[]> = new Map();

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.getTeachers().subscribe(
      (data: Teacher[]) => {
        this.teachers = data;
        this.approvedTeachers = data;
        this.approvedTeachers.forEach(teacher => {
          this.getDaySchedule(teacher.ConsultantID);
        });
      },
      (error) => {
        console.error('Error fetching teachers:', error);
      }
    );
  }

  getTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(this.apiUrl);
  }

  changeRoute(teacherId: number): void {
    this.router.navigate(['student/dashboard/appointment-view', teacherId]);
  }

  getDaySchedule(teacherId: number): void {
    const day = new Date().getDay();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    this.http.get<DaySchedule[]>(`${mainPort}/pdo/api/get_day_schedule_student/${teacherId}/${day}`, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching day schedule:', error);
        return of([]);
      })
    ).subscribe((schedule: DaySchedule[]) => {
      if(schedule.length == 0){
        return
      }
      // Sort the schedule before storing
      schedule.sort((a, b) => {
        // Assuming startTime is a string in "HH:mm" format
        const timeA = a.startTime.split(':').map(Number);
        const timeB = b.startTime.split(':').map(Number);
        if (timeA[0] !== timeB[0]) {
          return timeA[0] - timeB[0]; // Sort by hour
        } else {
          return timeA[1] - timeB[1]; // If hours are the same, sort by minute
        }
      });
      this.teacherScheduleMap.set(teacherId, schedule);
    });
}

  convertToAMPM(time: String): string {
    const [hours, minutes, seconds] = time.split(':');
    let hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; // Handle midnight (0 hours)
    return `${hour}:${minutes} ${ampm}`;
  }
}