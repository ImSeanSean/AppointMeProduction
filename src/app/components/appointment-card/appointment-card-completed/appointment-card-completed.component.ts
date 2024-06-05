import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Appointment } from '../../../interfaces/Appointment';
import { CompletedAppointmentDataService } from '../../../services/appointment-view-completed/completed-appointment-data.service';
import { mainPort } from '../../../app.component';

@Component({
  selector: 'app-appointment-card-completed',
  standalone: true,
  imports: [NgFor, NgClass, NgIf],
  templateUrl: './appointment-card-completed.component.html',
  styleUrl: './appointment-card-completed.component.css'
})
export class AppointmentCardCompletedComponent {
  constructor(private http: HttpClient, private router: Router, private appointmentId: CompletedAppointmentDataService) {};

  setValue(id:any){
    this.appointmentId.setAppointmentId(id);
  }

  appointments: Appointment[] = [];
  usertype = localStorage.getItem('user');

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
    return appointments.filter(appointment => appointment.Completed === 1);
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
