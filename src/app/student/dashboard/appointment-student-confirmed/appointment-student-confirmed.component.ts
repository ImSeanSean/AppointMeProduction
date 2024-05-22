import { Component } from '@angular/core';
import { AppointmentCardCompletedComponent } from "../../../components/appointment-card/appointment-card-completed/appointment-card-completed.component";
import { Router } from '@angular/router';
import { CompletedAppointmentDataService } from '../../../services/appointment-view-completed/completed-appointment-data.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { Appointment } from '../../../interfaces/Appointment';
import { NgIf } from '@angular/common';
import { mainPort } from '../../../app.component';

@Component({
    selector: 'app-appointment-student-confirmed',
    standalone: true,
    templateUrl: './appointment-student-confirmed.component.html',
    styleUrl: './appointment-student-confirmed.component.css',
    imports: [AppointmentCardCompletedComponent, NgIf]
})
export class AppointmentStudentConfirmedComponent {
    appointmentId: number | null | undefined;
    appointments: Appointment[] = [];

    constructor(private router: Router, private completedAppointmentDataService: CompletedAppointmentDataService, private http: HttpClient) {}
  
    ngOnInit(): void {
      // Subscribe to the appointmentId$ observable to get its value
      this.completedAppointmentDataService.appointmentId$.subscribe(id => {
        this.appointmentId = id;
        this.getAppointment().subscribe(
            (data: Appointment[]) => {
              // Handle successful response
              this.appointments = data; 
            },
            (error) => {
              // Handle errors
              console.error('Error fetching appointment:', error);
              // You can add additional error handling logic here
            }
          );
      });
    }
  
    changeRoute() {
      if (this.appointmentId !== null) {
        const currentUrl = this.router.url;
        this.router.navigate([`${currentUrl}/completed`, this.appointmentId]);
      } else {
        console.error('Appointment ID is null.');
      }
    }

    getAppointment(): Observable<Appointment[]> {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
        return this.http.get<Appointment[]>(`${mainPort}/appointme/pdo/api/get_appointment/${this.appointmentId}`, { headers })
          .pipe(
            catchError((error) => {
              console.error('HTTP error:', error);
              return [];
            })
          );
      }
}
