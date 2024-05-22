import { DatePipe, NgIf } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, catchError } from 'rxjs';
import { Appointment } from '../../interfaces/Appointment';
import { ConfirmationComponent } from '../../matdialogs/confirmation/confirmation.component';
import { RatingComponent } from '../../matdialogs/rating/rating.component';
import { FormsModule } from '@angular/forms';
import { ErrorComponent } from '../../matdialogs/error/error.component';
import { mainPort } from '../../app.component';

@Component({
  selector: 'app-appointment-view-finished',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './appointment-view-finished.component.html',
  styleUrl: './appointment-view-finished.component.css'
})
export class AppointmentViewFinishedComponent {
  usertype = localStorage.getItem('user');
  appointmentId: string | null = null;
  appointments: Appointment[] = [];
  remarks: string | null = null;

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

  //Matdialogs
  closeWindow() {
    var user = localStorage.getItem('user')
    if (user == "user"){
      user = "student";
    }
    this.router.navigate([`${user}/dashboard/confirmed-appointments`]);
  }

  openRating(): void {
    const dialogRef = this.dialog.open(RatingComponent, {
      height: '250px',
      width: '490px',
      data: {
        description: "Rate your experience"
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        if (this.remarks == null){
          this.remarks = "No remarks have been provided."
        }
        const $data = {
          key: localStorage.getItem('token'),
          appointment_id: this.appointmentId,
          appointment_rating: result,
          appointment_remarks: this.remarks
        }
        this.http.post(`${mainPort}/appointme/pdo/api/rate_appointment`, $data)
        .subscribe(
          (response: any) => {
            this.dialog.open(ErrorComponent, {
              width: '300px',
              data: {
                title: 'Appointment Status',
                description: response
              }
            });
            this.router.navigate(['student/dashboard/confirmed-appointments']);
          },
        );
      }
    });
  }

  //Get Appointments
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
}
