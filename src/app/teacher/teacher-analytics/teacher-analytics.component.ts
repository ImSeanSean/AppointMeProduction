import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Appointment } from '../../interfaces/Appointment';
import { DatePipe, NgClass, NgFor } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { mainPort } from '../../app.component';
import { Chart, Filler } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
    selector: 'app-teacher-analytics',
    standalone: true,
    templateUrl: './teacher-analytics.component.html',
    styleUrl: './teacher-analytics.component.css',
    imports: [NgFor, NgClass, BaseChartDirective]
})
export class TeacherAnalyticsComponent implements OnInit{
  constructor(private http: HttpClient, private router: Router,private datePipe: DatePipe) {

  };
  //Variables
  appointments: Appointment[] = [];
  usertype = localStorage.getItem('user');
  selectedDay = this.datePipe.transform(new Date(), 'EEEE');
  selectedDate = this.datePipe.transform(new Date(), 'MMMM dd, yyyy');

  //Analytics Data
  getPending(): number {
    return this.appointments.filter(appointment => appointment.Status === 0).length;
  }
  getConfirmed(): number {
    return this.appointments.filter(appointment => appointment.Status === 1 && appointment.Completed === 0).length;
  }
  getCompleted(): number{
    return this.appointments.length;
  }
  getAppointmentsThisWeek(): number {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)); 
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 7)); 

    return this.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.AppointmentDate);
      return appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
    }).length;
  }
  //Get Day
  private getStartAndEndOfWeek(): { startOfWeek: Date, endOfWeek: Date } {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); 
    startOfWeek.setHours(0, 0, 0, 0); 

    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() - now.getDay() + 7); 
    endOfWeek.setHours(23, 59, 59, 999);

    return { startOfWeek, endOfWeek };
  }
  getAppointmentsForDayOfWeek(day: number): number {
    const { startOfWeek } = this.getStartAndEndOfWeek();
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + day);
    const formattedDate = this.datePipe.transform(date, 'yyyy-MM-dd');
  
    return this.appointments.filter(appointment => {
      const appointmentDate = this.datePipe.transform(appointment.AppointmentDate, 'yyyy-MM-dd');
      return appointmentDate === formattedDate;
    }).length;
  }
  getRating(): number {
    let totalRating = 0;
    let appointmentCount = 0;
  
    this.appointments.forEach(appointment => {
      if (appointment.rating !== undefined && appointment.rating !== null) {
        totalRating += appointment.rating;
        appointmentCount++;
      }
    });
  
    if (appointmentCount === 0) {
      return 0; 
    }
  
    const averageRating = totalRating / appointmentCount;
    return parseFloat(averageRating.toFixed(2)); 
  }
  getRatingForWeek(): number {
    const { startOfWeek, endOfWeek } = this.getStartAndEndOfWeek();
    let totalRating = 0;
    let appointmentCount = 0;
  
    this.appointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.AppointmentDate);
      if (appointment.rating !== undefined && appointment.rating !== null &&
          appointmentDate >= startOfWeek && appointmentDate <= endOfWeek) {
        totalRating += appointment.rating;
        appointmentCount++;
      }
    });
  
    if (appointmentCount === 0) {
      return 0; 
    }
  
    const averageRating = totalRating / appointmentCount;
    return parseFloat(averageRating.toFixed(2)); 
  }
  //Appointment Card Functions
  changeRoute(id:string, completed:boolean, status:boolean) {
    if(status == false){
      this.router.navigate([`/teacher/dashboard/appointments/pending`, id]);
    }
    else if(status == true && completed == false){
      this.router.navigate([`/teacher/dashboard/appointments/confirmed`, id]);
    }
    else if(status == true && completed == true){
      this.router.navigate([`/teacher/dashboard/appointments/completed`, id]);
    }     
  }

  getAppointment(): Observable<Appointment[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log(token);
    return this.http.get<Appointment[]>(`${mainPort}/pdo/api/get_appointments`, { headers });
  }

  getAppointmentTeacher(): Observable<Appointment[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log(token);
    return this.http.get<Appointment[]>(`${mainPort}/pdo/api/get_appointments_teacher`, { headers });
  }

  filterAppointments(appointments: any[]): any[] {
    return appointments.filter(appointment => this.datePipe.transform(appointment.AppointmentDate, 'MMMM dd, yyyy') == this.selectedDate);
  }


  getFormattedDate(date:string){
    const datePipe = new DatePipe('en-US');
    return datePipe.transform(date, 'MMMM dd, yyyy')
  }

  getFormattedTime(date:string){
    const datePipe = new DatePipe('en-US');
    const time = datePipe.transform(date, 'MMMM dd, yyyy HH:mm')
    return datePipe.transform(time, 'shortTime')
  }

  changeDay(day: number){
    this.selectedDate = this.getDateForDayOfWeek(day+1)
    this.selectedDay = this.getDayName(day)
  }

  getDayName(dayOfWeek: number): string {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (dayOfWeek >= 0 && dayOfWeek <= 5) {
        return days[dayOfWeek];
    } else {
        return 'Invalid Day';
    }
  }

  getDateForDayOfWeek(dayOfWeek: number): string {
    const now = new Date();
    const currentDayOfWeek = now.getDay();
    const diff = dayOfWeek - currentDayOfWeek;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);

    const formattedDate = this.datePipe.transform(targetDate, 'MMMM dd, yyyy');
    return formattedDate || '';
}
//Charts
lineChartData = {
  labels: ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"],
  datasets: [
    {
      data: [1, 2, 3, 4, 5, 6],
      label: 'Ratings',
      fill: true
    },
    {
      data: [1, 2, 3, 4, 5, 6],
      label: 'Ratings',
      fill: true
    }
  ]
}

  ngOnInit(): void {
    if(this.usertype == "user"){
      this.getAppointment().subscribe(
        (data: Appointment[]) => {
          this.appointments = data;
          console.log(this.appointments);
        },
        (error) => {
          console.error('Error fetching appointments:', error);
        }
      );
    }
    if(this.usertype == "teacher"){
      this.getAppointmentTeacher().subscribe(
        (data: Appointment[]) => {
          this.appointments = data;
          console.log(this.appointments);
        },
        (error) => {
          console.error('Error fetching appointments:', error);
        }
      );
    }
  }
}
