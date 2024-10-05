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
import { Chart } from 'chart.js';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [FormsModule, BaseChartDirective, NgClass, NgFor, NgIf],
  templateUrl: './admin-analytics.component.html',
  styleUrl: './admin-analytics.component.css',
})
export class AdminAnalyticsComponent implements OnInit {
  appointmentCount = 0;
  queueCount = 0;
  teacherCount = 0;
  studentCount = 0;
  actionLogs: Actionlog[] = [];
  loginLogs: Loginlog[] = [];

  constructor(private http: HttpClient) {}

  //Get Counts
  getAppointmentCount() {
    this.http
      .get<number>(`${mainPort}/pdo/api/get_appointment_count`)
      .subscribe((result) => {
        this.appointmentCount = result;
      });
  }
  getQueueCount() {
    this.http
      .get<number>(`${mainPort}/pdo/api/get_queue_count`)
      .subscribe((result) => {
        this.queueCount = result;
      });
  }
  getTeacherCount() {
    this.http
      .get<number>(`${mainPort}/pdo/api/get_teacher_count`)
      .subscribe((result) => {
        this.teacherCount = result;
      });
  }
  getStudentCount() {
    this.http
      .get<number>(`${mainPort}/pdo/api/get_student_count`)
      .subscribe((result) => {
        this.studentCount = result;
      });
  }
  getActionLogs() {
    this.http
      .get<Actionlog[]>(`${mainPort}/pdo/api/get_action_logs`)
      .subscribe((result) => {
        this.actionLogs = result;
      });
  }
  getLoginLogs() {
    this.http
      .get<Loginlog[]>(`${mainPort}/pdo/api/get_login_logs`)
      .subscribe((result) => {
        this.loginLogs = result;
      });
  }
  getDailyActionLogsCount(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(
      `${mainPort}/pdo/api/admin_get_action_logs_daily`,
      { headers }
    );
  }
  getDailyAppointmentCount(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(
      `${mainPort}/pdo/api/get_daily_appointment_count`,
      { headers }
    );
  }
  getAppointmentDaily(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${mainPort}/pdo/api/admin_get_appointments_daily`, {
      headers,
    });
  }

  //Bar Chart
  createBarChart(data: any) {
    const labels = data.map((item: any) => item.AppointmentDay);
    const completedCounts = data.map((item: any) => item.CompletedCount);
    const confirmedCounts = data.map((item: any) => item.ConfirmedCount);
    const pendingCounts = data.map((item: any) => item.PendingCount);

    // Bar chart setup
    const myChart = new Chart('appointmentChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Completed Appointments',
            data: completedCounts,
            backgroundColor: '#168021',
            borderWidth: 1,
          },
          {
            label: 'Confirmed Appointments',
            data: confirmedCounts,
            backgroundColor: '#F78914',
            borderWidth: 1,
          },
          {
            label: 'Pending Appointments',
            data: pendingCounts,
            backgroundColor: 'rgba(255, 206, 86, 0.6)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            beginAtZero: true,
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
  createLineChart(data: any) {
    const labels = data.map((item: any) => item.DayName);
    const counts = data.map((item: any) => item.DailyCount);

    const lineChart = new Chart('dailyAppointmentChart', {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '',
            data: counts,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            title: {
              display: false,
              text: 'Date',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Appointments',
            },
          },
        },
      },
    });
  }
  createActionLogsChart(data: any) {
    const labels = data.map((item: any) => item.DayName);
    const counts = data.map((item: any) => item.DailyCount);

    const actionLogsChart = new Chart('dailyActionLogsChart', {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '',
            data: counts,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            title: {
              display: false,
              text: 'Date',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Appointments',
            },
          },
        },
      },
    });
  }

  ngOnInit(): void {
    this.getAppointmentCount();
    this.getQueueCount();
    this.getTeacherCount();
    this.getStudentCount();
    this.getActionLogs();
    this.getLoginLogs();
    this.getAppointmentDaily().subscribe((data) => {
      this.createBarChart(data);
    });
    this.getDailyAppointmentCount().subscribe((data) => {
      this.createLineChart(data);
    });
    this.getDailyActionLogsCount().subscribe((data) => {
      console.log(data);
      this.createActionLogsChart(data);
    });
  }
}
