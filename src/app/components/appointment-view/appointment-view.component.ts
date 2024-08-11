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
import { Queue } from '../../interfaces/Queue';

@Component({
  selector: 'app-appointment-view',
  standalone: true,
  imports: [NgIf],
  templateUrl: './appointment-view.component.html',
  styleUrl: './appointment-view.component.css'
})
export class AppointmentViewComponent {
  usertype = localStorage.getItem('user');
  teacherId = localStorage.getItem('id')
  queueId: string | null = null;
  queue: Queue[] = [];

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private route: ActivatedRoute,
    private activatedRoute: ActivatedRoute, 
    public dialog: MatDialog, 
    private appointmentValidation: AppointmentValidationService,
    private userInformation: UserInformationService,
    private notificationService: NotificationServicesService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.queueId = this.route.snapshot.params['appointmentId'];
    this.getQueue().subscribe(
      (data: Queue[]) => {
        // Handle successful response
        this.queue = data; 
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
      height: '40vh',
      width: '30vw',
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
        this.notificationService.createNotification(null, this.queue[0].student_id, null, "Rejected", "Meeting with " + this.queue[0].teacher_name, desc)
      }
    });
  }

  changeRoute() {
    this.router.navigate(['teacher/dashboard/appointments/pending/create', this.queueId]);
  }

  getQueue(): Observable<Queue[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Queue[]>(`${mainPort}/pdo/api/get_queue_teacher/${this.teacherId}/${this.queueId }`, {headers});
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

  getFormattedTime(date:string){
    const today = new Date();
    const [hours, minutes, seconds] = date.split(':');
    today.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));

    // Format the Date object to a string using DatePipe
    return this.datePipe.transform(today, 'h:mm a');
  }
  rejectAppointment() {
    const data = {
      key: localStorage.getItem('token'),
      queue_id: this.queueId
    };
    console.log(data)
    this.http.post(`${mainPort}/pdo/api/delete_queue`, data)
    .subscribe(
      (response) => {
        this.dialog.open(ErrorComponent, {
          width: '300px',
          data: {
            title: 'Delete Status',
            description: response
          }
        })
        this.closeWindow();
      },
      (error) => {
        this.dialog.open(ErrorComponent, {
          width: '300px',
          data: {
            title: 'Delete Status',
            description: error
          }
        })
        this.closeWindow();
      }
    );
  }
}
