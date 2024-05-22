import { Component } from '@angular/core';
import { Appointment } from '../../interfaces/Appointment';
import { DatePipe, NgClass, NgFor } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { mainPort } from '../../app.component';

@Component({
  selector: 'app-teacher-analytics',
  standalone: true,
  imports: [NgFor, NgClass],
  templateUrl: './teacher-analytics.component.html',
  styleUrl: './teacher-analytics.component.css'
})
export class TeacherAnalyticsComponent {
  constructor(private http: HttpClient, private router: Router,private datePipe: DatePipe) {

  };
  //Variables
  appointments: Appointment[] = [];
  usertype = localStorage.getItem('user');
  dateToday = this.datePipe.transform(new Date(), 'MMMM dd, yyyy');

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
  changeRoute(id:string) {
    const currentUrl = this.router.url
    this.router.navigate([`/teacher/dashboard/appointments/confirmed`, id]);
  }

  getAppointment(): Observable<Appointment[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log(token);
    return this.http.get<Appointment[]>(`${mainPort}/appointme/pdo/api/get_appointments`, { headers });
  }

  getAppointmentTeacher(): Observable<Appointment[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log(token);
    return this.http.get<Appointment[]>(`${mainPort}/appointme/pdo/api/get_appointments_teacher`, { headers });
  }

  filterAppointments(appointments: any[]): any[] {
    return appointments.filter(appointment => appointment.Status === 1 && appointment.Completed === 0 && this.datePipe.transform(appointment.AppointmentDate, 'MMMM dd, yyyy') == this.dateToday);
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
