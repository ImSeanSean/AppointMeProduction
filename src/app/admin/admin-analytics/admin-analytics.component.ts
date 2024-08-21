import { DatePipe, formatDate, NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { Observable } from 'rxjs';
import { mainPort } from '../../app.component';
import { Appointment } from '../../interfaces/Appointment';
import { Queue } from '../../interfaces/Queue';
import { FormsModule, NgModel } from '@angular/forms';
import { Teacher } from '../../interfaces/Teacher';
import { Actionlog } from '../../interfaces/ActionLog';
import { Action } from '@fullcalendar/core/internal';
import { Loginlog } from '../../interfaces/LoginLog';
import { l } from 'vite/dist/node/types.d-aGj9QkWt';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [FormsModule, BaseChartDirective, NgClass, NgFor, NgIf],
  templateUrl: './admin-analytics.component.html',
  styleUrl: './admin-analytics.component.css'
})
export class AdminAnalyticsComponent implements OnInit{
  appointmentCount = 0;
  queueCount = 0;
  teacherCount = 0;
  studentCount = 0;
  actionLogs: Actionlog[] = [];
  loginLogs: Loginlog[] = [];

  constructor(
    private http: HttpClient
  ){}

  //Get Counts
  getAppointmentCount(){
    this.http.get<number>(`${mainPort}/pdo/api/get_appointment_count`).subscribe(result => {
      this.appointmentCount = result
    })
  }
  getQueueCount(){
    this.http.get<number>(`${mainPort}/pdo/api/get_queue_count`).subscribe(result => {
      this.queueCount = result;
    })
  }
  getTeacherCount(){
    this.http.get<number>(`${mainPort}/pdo/api/get_teacher_count`).subscribe(result => {
      this.teacherCount = result;
    })
  }
  getStudentCount(){
    this.http.get<number>(`${mainPort}/pdo/api/get_student_count`).subscribe(result => {
      this.studentCount = result;
    })
  }
  getActionLogs(){
    this.http.get<Actionlog[]>(`${mainPort}/pdo/api/get_action_logs`).subscribe(result => {
      this.actionLogs = result;
      console.log(this.actionLogs);
    })
  }
  getLoginLogs(){
    this.http.get<Loginlog[]>(`${mainPort}/pdo/api/get_login_logs`).subscribe(result => {
      this.loginLogs = result;
      console.log(this.loginLogs)
    })
  }
  
  ngOnInit(): void {
      this.getAppointmentCount();
      this.getQueueCount();
      this.getTeacherCount();
      this.getStudentCount();
      this.getActionLogs();
      this.getLoginLogs();
  }
}
