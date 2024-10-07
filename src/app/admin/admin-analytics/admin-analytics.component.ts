import { NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { Observable } from 'rxjs';
import { mainPort } from '../../app.component';
import { FormsModule, NgModel } from '@angular/forms';
import { Actionlog } from '../../interfaces/ActionLog';
import { Loginlog } from '../../interfaces/LoginLog';
import { Chart } from 'chart.js';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import html2canvas from 'html2canvas'; // Import html2canvas
import jsPDF from 'jspdf'; // Import jsPDF

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [
    FormsModule,
    BaseChartDirective,
    NgClass,
    NgFor,
    NgIf,
    MatTableModule,
    MatPaginatorModule,
  ],
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
        this.dataSource = new MatTableDataSource<Actionlog>(this.actionLogs);
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      });
  }
  getLoginLogs() {
    this.http
      .get<Loginlog[]>(`${mainPort}/pdo/api/get_login_logs`)
      .subscribe((result) => {
        this.loginLogs = result;
      });
  }
  getDailyLoginLogsCount(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${mainPort}/pdo/api/get_daily_login_count`, {
      headers,
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
        responsive: true,
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
            ticks: {
              stepSize: 1,
              precision: 0,
            },
          },
        },
      },
    });
  }
  createLoginLogsChart(data: any) {
    const labels = data.map((item: any) => item.login_date);
    const counts = data.map((item: any) => item.login_count);

    const loginLogsChart = new Chart('dailyLoginLogsChart', {
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
        responsive: true,
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
              text: 'Login',
            },
            ticks: {
              stepSize: 1,
              precision: 0,
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
        responsive: true,
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
            ticks: {
              stepSize: 1,
              precision: 0,
            },
          },
        },
      },
    });
  }

  dataSource = new MatTableDataSource<Actionlog>(this.actionLogs);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  analytics_overviewPdf() {
    const element = document.querySelector('body > app-root > app-dashboard-admin > div > div.main > app-admin-analytics > div > div:nth-child(2)'); // You can target a specific div if needed, e.g., document.getElementById('content')
    
    // Use html2canvas to capture the current view
    html2canvas(element as HTMLElement).then((canvas: { toDataURL: (arg0: string) => any; height: number; width: number; }) => {
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('l', 'mm', 'a4'); 
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
      pdf.save('analytics_overview.pdf'); 
    });
  }
  
  action_logsPdf() {
    const element = document.querySelector("body > app-root > app-dashboard-admin > div > div.main > app-admin-analytics > div > div:nth-child(4) > div");
    // Use html2canvas to capture the current view
    html2canvas(element as HTMLElement).then((canvas: { toDataURL: (arg0: string) => any; height: number; width: number; }) => {
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('l', 'mm', 'a4'); 
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
      pdf.save('performance_analytics.pdf'); 
    });
  }
  
  appointment_analyticsPdf() {
    const element = document.querySelector('body > app-root > app-dashboard-admin > div > div.main > app-admin-analytics > div > div:nth-child(6)');
    
    html2canvas(element as HTMLElement).then((canvas: { toDataURL: (arg0: string) => any; height: number; width: number; }) => {
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('l', 'mm', 'a4');
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Force image to cover the full page, even if it distorts the aspect ratio
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
      
      pdf.save('appointment_analytics.pdf'); 
    });
  }
  
  generatePdfall() {
    // Select all content sections (you can use any specific class or element)
    const elements = document.querySelectorAll('.content'); // Adjust the selector if needed
  
    const pdf = new jsPDF('p', 'mm', 'a4'); // Create new PDF, portrait, A4 size
    const pageHeight = 295; // A4 page height in mm
    const imgWidth = 190; // Image width in mm
    let position = 0; // Starting Y position for the first image
  
    // Convert each section to canvas one by one
    let promises = Array.from(elements).map(element => {
      return html2canvas(element as HTMLElement, { scale: 2 });
    });
  
    Promise.all(promises).then(canvases => {
      canvases.forEach((canvas, index) => {
        const imgData = canvas.toDataURL('image/png'); // Convert canvas to image data
        const imgHeight = canvas.height * imgWidth / canvas.width; // Maintain aspect ratio
  
        if (position + imgHeight > pageHeight) {
          pdf.addPage(); // Add new page if the current page doesn't fit
          position = 0; // Reset position to top of the new page
        }
  
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight); // Add image to PDF
        position += imgHeight; // Update Y position for next image
      });
  
      // Download the generated PDF
      pdf.save('admin-analytics.pdf');
    });
  }

  ngOnInit(): void {
    this.getAppointmentCount();
    this.getQueueCount();
    this.getTeacherCount();
    this.getStudentCount();
    this.getActionLogs();
    this.getLoginLogs();
    this.getDailyLoginLogsCount().subscribe((data) => {
      this.createLoginLogsChart(data);
    });
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
