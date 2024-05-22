import { DatePipe, NgIf } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, catchError } from 'rxjs';
import { Appointment } from '../../interfaces/Appointment';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationComponent } from '../../matdialogs/confirmation/confirmation.component';
import { mainPort } from '../../app.component';

@Component({
  selector: 'app-appointment-view-confirmed',
  standalone: true,
  imports: [NgIf],
  templateUrl: './appointment-view-confirmed.component.html',
  styleUrl: './appointment-view-confirmed.component.css'
})
export class AppointmentViewConfirmedComponent {
  usertype = localStorage.getItem('user');
  appointmentId: string | null = null;
  appointments: Appointment[] = [];

  constructor(private http: HttpClient, private router: Router, private activatedRoute: ActivatedRoute, public dialog: MatDialog) {}

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
    var user = localStorage.getItem('user')
    if (user == "user"){
      user = "student";
    }
    this.router.navigate([`${user}/dashboard/appointments`]);
  }

  openConfirmationReject(): void {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      height: '250px',
      width: '490px',
      data: {
        title: 'Cancel Appointment',
        description: 'Are you sure you want to cancel this appointment?'
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result) {
        this.rejectAppointment();
      }
    });
  }

  openConfirmationComplete(): void {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      height: '250px',
      width: '490px',
      data: {
        title: 'Complete Appointment',
        description: 'Are you sure you want to complete this appointment?'
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result) {
        this.completeAppointment();
      }
    });
  }

  getAppointment(): Observable<Appointment[]> {
    this.appointmentId = this.activatedRoute.snapshot.params['appointmentId'];
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
  completeAppointment() {
    const data = { appointment_id: this.appointmentId };
    this.http.post(`${mainPort}/appointme/pdo/api/complete_appointment`, data)
      .subscribe(
        (response) => {
          console.log('Appointment complete successfully:', response);
        },
        (error) => {
          console.error('Error completing appointment:', error);
        }
      );
    this.closeWindow();
  }
  rejectAppointment() {
    const data = {appointment_id: this.appointmentId};
    this.http.post(`${mainPort}/appointme/pdo/api/reject_appointment`, data)
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
