import { Component, OnInit } from '@angular/core';
import { Teacher } from '../../interfaces/Teacher';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { DaySchedule } from '../../interfaces/DaySchedule';
import { mainPort } from '../../app.component';
import { Queue } from '../../interfaces/Queue';
import { Appointment } from '../../interfaces/Appointment';

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
  queue$: {[key:string]: Observable<Queue[]>} = {};
  appointments$: {[key:string]: Observable<Appointment[]>} = {};
  queueStatus$: { [key: string]: Observable<boolean> } = {};
  queueLength$: {[key:string]: Observable<number>} = {};
  appointmentLength$: {[key:string]: Observable<number>} = {};

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.getTeachers().subscribe(
      (data: Teacher[]) => {
        this.teachers = data;
        this.approvedTeachers = data;
        this.approvedTeachers.forEach(teacher => {
          this.queueStatus$[teacher.ConsultantID] = this.isInQueue(teacher.ConsultantID);
          this.queueLength$[teacher.ConsultantID] = this.getQueueLength(teacher.ConsultantID);
          this.appointmentLength$[teacher.ConsultantID] = this.getAppointmentsLength(teacher.ConsultantID);
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

  // Get Appointments Length
  getAppointmentsLength(teacherId: string): Observable<number> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Appointment[]>(`${mainPort}/pdo/api/get_appointment_teacher/${teacherId}`, {headers}).pipe(
      map(appointments => this.filterAppointments(appointments).length)
    );
  }

  // Get Queue
  getQueue(teacherId: string): Observable<Queue[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Queue[]>(`${mainPort}/pdo/api/get_queue_teacher/${teacherId}`, {headers});
  }

  getQueueLength(teacherId: string): Observable<number> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Queue[]>(`${mainPort}/pdo/api/get_queue_teacher/${teacherId}`, {headers}).pipe(
      map(result => result.length)
    );
  }

  // Check in Queue
  isInQueue(teacherId: string): Observable<boolean> {
    return this.getQueue(teacherId).pipe(
      map(queue => {
        const studentId = localStorage.getItem('id');
        return queue.some(q => q.student_id.toString() === studentId);
      })
    );
  }

  convertToAMPM(time: String): string {
    const [hours, minutes, seconds] = time.split(':');
    let hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; 
    return `${hour}:${minutes} ${ampm}`;
  }

  filterAppointments(appointments: Appointment[]): Appointment[] {
    return appointments.filter(appointment => appointment.Completed !== 1);
  }
}