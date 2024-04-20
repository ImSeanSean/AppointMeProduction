import { DatePipe, NgIf } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, catchError } from 'rxjs';
import { Appointment } from '../../interfaces/Appointment';

@Component({
  selector: 'app-appointment-view',
  standalone: true,
  imports: [NgIf],
  templateUrl: './appointment-view.component.html',
  styleUrl: './appointment-view.component.css'
})
export class AppointmentViewComponent {
  usertype = localStorage.getItem('user');
  appointmentId: string | null = null;
  appointments: Appointment[] = [];

  constructor(private http: HttpClient, private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.getAppointment().subscribe(
      (data: Appointment[]) => {
        // Handle successful response
        this.appointments = data; 
        console.log(this.appointments)
      },
      (error) => {
        // Handle errors
        console.error('Error fetching appointment:', error);
        // You can add additional error handling logic here
      }
    );
  }

  closeWindow() {
    this.router.navigate(['teacher/dashboard/appointments']);
  }

  getAppointment(): Observable<Appointment[]> {
    this.appointmentId = this.activatedRoute.snapshot.params['appointmentId'];
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Appointment[]>(`http://localhost/appointme/pdo/api/get_appointment/${this.appointmentId}`, { headers })
      .pipe(
        catchError((error) => {
          console.error('HTTP error:', error);
          return [];
        })
      );
  }
  getFormattedDate(date:string | undefined): string | null{
    if(date){
      const datePipe = new DatePipe('en-US');
      return datePipe.transform(date, 'MMMM dd, yyyy')
    } else {
      const datePipe = new DatePipe('en-US');
      return datePipe.transform(date, 'MMMM dd, yyyy')
    }
  }
  getFormattedTime(date:string | undefined): string | null{
    if(date){
      const datePipe = new DatePipe('en-US');
      const time = datePipe.transform(date, 'MMMM dd, yyyy HH:mm')
      return datePipe.transform(time, 'shortTime')
    } else {
      return null;
    }
  }
  confirmAppointment() {
    const data = { appointment_id: this.appointmentId };
    this.http.post('http://localhost/appointme/pdo/api/confirm_appointment', data)
      .subscribe(
        (response) => {
          console.log('Appointment confirmed successfully:', response);
        },
        (error) => {
          console.error('Error confirming appointment:', error);
        }
      );
    this.closeWindow();
  }
  rejectAppointment() {
    const data = {appointment_id: this.appointmentId};
    this.http.post('http://localhost/appointme/pdo/api/reject_appointment', data)
    .subscribe(
      (response) => {
        console.log('Appointment rejected successfully:', response);
      },
      (error) => {
        console.error('Error rejecting appointment:', error);
      }
    );
  this.closeWindow();
  }
}
