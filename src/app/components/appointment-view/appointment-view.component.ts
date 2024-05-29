import { DatePipe, NgIf } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, catchError } from 'rxjs';
import { Appointment } from '../../interfaces/Appointment';
import { ConfirmationComponent } from '../../matdialogs/confirmation/confirmation.component';
import { MatDialog } from '@angular/material/dialog';
import { mainPort } from '../../app.component';
import { AppointmentValidationService } from '../../services/appointment/appointment-validation.service';
import { UserInformationService } from '../../services/user-information/user-information.service';
import { ErrorComponent } from '../../matdialogs/error/error.component';
import { ConfirmationInputComponent } from '../../matdialogs/confirmation-input/confirmation-input/confirmation-input.component';
import { NotificationServicesService } from '../../services/notification-services.service';

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

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private activatedRoute: ActivatedRoute, 
    public dialog: MatDialog, 
    private appointmentValidation: AppointmentValidationService,
    private userInformation: UserInformationService,
    private notificationService: NotificationServicesService
  ) {}

  ngOnInit() {
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
  }

  closeWindow() {
    var user = localStorage.getItem('user')
    if (user == "user"){
      user = "student";
    }
    this.router.navigate([`${user}/dashboard/appointments`]);
  }

  openConfirmationReject(): void {
    const dialogRef = this.dialog.open(ConfirmationInputComponent, {
      height: '50vh',
      width: '50vw',
      data: {
        title: 'Reject Appointment',
        description: 'Are you sure you want to reject this appointment?'
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      let bool = result[0];
      let desc = result[1]
      if (bool) {
        this.rejectAppointment();
        this.notificationService.createNotification(this.appointments[0].ConsultantID, this.appointments[0].user_id, "Rejected", this.appointments[0].appointment_title, desc)
      }
    });
  }

  openConfirmationAccept(): void {
    const dialogRef = this.dialog.open(ConfirmationInputComponent, {
      height: '50vh',
      width: '50vw',
      data: {
        title: 'Confirm Appointment',
        description: 'Are you sure you want to confirm this appointment?'
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      let bool = result[0];
      let desc = result[1];
      let setdate = this.appointments[0].AppointmentDate;
      //Variable
      const data = {
        date:  setdate
      }
      //If FTF, check first if there is already an FTF for that schedule
      this.http.post(`${mainPort}/pdo/api/check_ftf_appointments`, data).subscribe(result=>{
        if(result){
          this.dialog.open(ErrorComponent, {
            width: '300px',
            data: {
              title: 'Appointment Conflict',
              description: 'A Face to Face Appointment Already Exists for the Schedule'
            }
          });
          this.closeWindow();
          return;
        }
        else{
          if (bool) {
            this.confirmAppointment();
            this.notificationService.createNotification(this.appointments[0].ConsultantID, this.appointments[0].user_id, "Approved", this.appointments[0].appointment_title, desc)
          }
        }
      })
    });
  }

  getAppointment(): Observable<Appointment[]> {
    this.appointmentId = this.activatedRoute.snapshot.params['appointmentId'];
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Appointment[]>(`${mainPort}/pdo/api/get_appointment/${this.appointmentId}`, { headers })
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
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    //Check if an Appointment Exists for that Day
    this.appointmentValidation.getMatchingDate(this.userInformation.userId, this.appointments[0].AppointmentDate).subscribe(result => {
      if(result){
        this.dialog.open(ErrorComponent, {
          width: '300px',
          data: {
            title: 'Appointment Conflict',
            description: 'You already have an Appointment Exists for the Schedule'
          }
        });
        this.closeWindow();
        return;
      }
      else{
        this.http.post(`${mainPort}/pdo/api/confirm_appointment`, data)
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
    })
  }
  rejectAppointment() {
    const data = {appointment_id: this.appointmentId};
    this.http.post(`${mainPort}/pdo/api/reject_appointment`, data)
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
