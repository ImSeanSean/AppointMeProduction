import { DatePipe, NgIf } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, catchError } from 'rxjs';
import { Appointment } from '../../interfaces/Appointment';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationComponent } from '../../matdialogs/confirmation/confirmation.component';
import { mainPort } from '../../app.component';
import { ConfirmationInputComponent } from '../../matdialogs/confirmation-input/confirmation-input/confirmation-input.component';
import { NotificationServicesService } from '../../services/notification-services.service';
import { ErrorComponent } from '../../matdialogs/error/error.component';

@Component({
  selector: 'app-appointment-view-confirmed',
  standalone: true,
  imports: [NgIf],
  templateUrl: './appointment-view-confirmed.component.html',
  styleUrl: './appointment-view-confirmed.component.css',
})
export class AppointmentViewConfirmedComponent {
  usertype = localStorage.getItem('user');
  appointmentId: string | null = null;
  appointments: Appointment[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private notificationService: NotificationServicesService
  ) {}

  ngOnInit() {
    this.getAppointment().subscribe(
      (data: Appointment[]) => {
        // Handle successful response
        this.appointments = data;
        console.log(this.appointments);
      },
      (error) => {
        // Handle errors
        console.error('Error fetching appointment:', error);
        // You can add additional error handling logic here
      }
    );
  }

  closeWindow() {
    var user = localStorage.getItem('user');
    if (user == 'user') {
      user = 'student';
    }
    this.router.navigate([`${user}/dashboard/appointments`]);
  }

  openConfirmationReject(): void {
    const dialogRef = this.dialog.open(ConfirmationInputComponent, {
      height: '40vh',
      width: '30vw',
      data: {
        title: 'Cancel Appointment',
        description: 'Optional message to student...',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      let bool = result[0];
      let desc = result[1];
      if (bool) {
        this.rejectAppointment();
        this.notificationService.createNotification(
          null,
          this.appointments[0].user_id,
          null,
          'Rejected',
          'Meeting with ' +
            this.appointments[0].ConsultantFirstName +
            ' ' +
            this.appointments[0].ConsultantLastName +
            ': Cancelled',
          desc
        );
      }
    });
  }

  openConfirmationComplete(): void {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      height: '30vh',
      width: '25vw',
      data: {
        title: 'Finish Appointment',
        description:
          'Are you sure you want to mark this appointment as finished?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.completeAppointment();
        const followup = this.dialog.open(ConfirmationComponent, {
          height: '30vh',
          width: '25vw',
          data: {
            title: 'Follow-up Appointment',
            description: 'Queue Student for a Follow-up Appointment?',
          },
        });
        followup.afterClosed().subscribe((result) => {
          if (result) {
            const reason = this.dialog.open(ConfirmationInputComponent, {
              height: '40vh',
              width: '30vw',
              data: {
                title: 'Follow-up Appointment Note',
                description: 'Add a note...',
              },
            });
            reason.afterClosed().subscribe((result) => {
              if (result[0]) {
                this.addQueue(result[1]);
                const summary = this.dialog.open(ConfirmationInputComponent, {
                  height: '40vh',
                  width: '30vw',
                  data: {
                    title: 'Appointment Summary',
                    description: 'Provide summary...',
                  },
                });
                summary.afterClosed().subscribe((result) => {
                  if (result[0]) {
                    this.provideSummary(result[1]);
                  }
                });
              }
            });
          } else {
            const summary = this.dialog.open(ConfirmationInputComponent, {
              height: '40vh',
              width: '30vw',
              data: {
                title: 'Appointment Summary',
                description: 'Provide summary...',
              },
            });
            summary.afterClosed().subscribe((result) => {
              if (result[0]) {
                this.provideSummary(result[1]);
              }
            });
          }
        });
      }
    });
  }

  getAppointment(): Observable<Appointment[]> {
    this.appointmentId = this.activatedRoute.snapshot.params['appointmentId'];
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http
      .get<Appointment[]>(
        `${mainPort}/pdo/api/get_appointment/${this.appointmentId}`,
        { headers }
      )
      .pipe(
        catchError((error) => {
          console.error('HTTP error:', error);
          return [];
        })
      );
  }
  getFormattedDate(date: string | undefined): string | null {
    if (date) {
      const datePipe = new DatePipe('en-US');
      return datePipe.transform(date, 'MMMM dd, yyyy');
    } else {
      const datePipe = new DatePipe('en-US');
      return datePipe.transform(date, 'MMMM dd, yyyy');
    }
  }
  getFormattedTime(date: string | undefined): string | null {
    if (date) {
      const datePipe = new DatePipe('en-US');
      const time = datePipe.transform(date, 'MMMM dd, yyyy HH:mm');
      return datePipe.transform(time, 'shortTime');
    } else {
      return null;
    }
  }
  completeAppointment() {
    const data = {
      key: localStorage.getItem('token'),
      appointment_id: this.appointmentId,
    };
    this.http.post(`${mainPort}/pdo/api/complete_appointment`, data).subscribe(
      (response) => {
        console.log('Appointment complete successfully:', response);
        this.notificationService.createNotification(
          null,
          this.appointments[0].StudentID,
          this.appointments[0].AppointmentID,
          'Finished',
          'Meeting with ' + this.appointments[0].ConsultantFirstName,
          'Appointment has been marked as completed.'
        );
      },
      (error) => {
        console.error('Error completing appointment:', error);
      }
    );
    this.closeWindow();
  }
  rejectAppointment() {
    const data = { appointment_id: this.appointmentId };
    this.http.post(`${mainPort}/pdo/api/reject_appointment`, data).subscribe(
      (response) => {
        console.log('Appointment cancelled successfully:', response);
        this.notificationService.createNotification(
          null,
          this.appointments[0].StudentID,
          null,
          'Rejected',
          'Meeting with ' + this.appointments[0].ConsultantFirstName,
          'Your appointment has been cancelled.'
        );
      },
      (error) => {
        console.error('Error rejecting appointment:', error);
      }
    );
    this.closeWindow();
  }

  addQueue(note: string) {
    const data = {
      key: localStorage.getItem('token'),
      student_id: this.appointments[0].user_id,
      teacher_id: this.appointments[0].ConsultantID,
      title: this.appointments[0].appointment_title,
      appointment_id: this.appointmentId,
      mode: null,
      urgency: null,
      day: null,
      time: null,
      reason: note,
    };
    console.log(data);
    this.http
      .post(`${mainPort}/pdo/api/add_followup_queue_teacher`, data)
      .subscribe(
        (response: any) => {
          console.log(response);
          if (response == 0) {
            this.dialog.open(ErrorComponent, {
              width: '300px',
              data: {
                title: 'Added to Queue',
                description: 'You have been successfully added to the queue.',
              },
            });
          } else if (response == 1) {
            this.dialog.open(ErrorComponent, {
              width: '300px',
              data: {
                title: 'Already Queued',
                description:
                  'You already have a queue with the Faculty Member.',
              },
            });
            this.closeWindow();
          } else if (response == 2) {
            this.dialog.open(ErrorComponent, {
              width: '300px',
              data: {
                title: 'Error adding to Queue',
                description:
                  'An error was encountered in the queueing process.',
              },
            });
            this.closeWindow();
          } else {
          }
        },
        (error) => {
          console.error('HTTP Error:', error);
        }
      );
  }

  provideSummary(summary: any) {
    const $data = {
      key: localStorage.getItem('token'),
      appointment_id: this.appointmentId,
      appointment_summary: summary,
    };
    this.http
      .post(`${mainPort}/pdo/api/provide_summary`, $data)
      .subscribe((result) => {
        window.location.reload();
      });
  }
}
