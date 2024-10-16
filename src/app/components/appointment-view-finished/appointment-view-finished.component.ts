import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
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
import { NotificationServicesService } from '../../services/notification-services.service';

@Component({
  selector: 'app-appointment-view-finished',
  standalone: true,
  imports: [FormsModule, NgIf, NgClass, NgFor],
  templateUrl: './appointment-view-finished.component.html',
  styleUrl: './appointment-view-finished.component.css'
})
export class AppointmentViewFinishedComponent {
  usertype = localStorage.getItem('user');
  appointmentId: string | null = null;
  appointments: Appointment[] = [];
  information: string | null = null;
  remarks: string | null = null;
  summary: string | null = null;
  edit = false;

  constructor(private http: HttpClient, private router: Router, private activatedRoute: ActivatedRoute, public dialog: MatDialog, private notificationService: NotificationServicesService) {}

  ngOnInit() {
    this.getAppointment().subscribe(
      (data: Appointment[]) => {
        // Handle successful response
        this.appointments = data; 
        this.information = this.appointments[0].AppointmentInfo
        this.remarks = this.appointments[0].remarks
        this.summary = this.appointments[0].AppointmentSummary
        this.getAverageStars();
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

  openInformation():void {
    const $data ={
      key: localStorage.getItem('token'),
      appointment_id: this.appointmentId,
      appointment_summary: this.information
    }
    this.http.post(`${mainPort}/pdo/api/provide_information`, $data).subscribe(result =>{
      window.location.reload();
    });
  }

  openSummary():void {
    const $data ={
      key: localStorage.getItem('token'),
      appointment_id: this.appointmentId,
      appointment_summary: this.summary
    }
    this.http.post(`${mainPort}/pdo/api/provide_summary`, $data).subscribe(result =>{
      window.location.reload();
    });
  }

  openRating(): void {
    const dialogRef = this.dialog.open(RatingComponent, {
      height: '300px',
      width: '500px',
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
          empathy: result.empathy,
          clarity: result.clarity,
          engagement: result.engagement,
          helpfulness: result.helpfulness,
          appointment_remarks: this.remarks
        }
        console.log($data)
        this.http.post(`${mainPort}/pdo/api/rate_appointment`, $data)
        .subscribe(
          (response: any) => {
            this.dialog.open(ErrorComponent, {
              width: '300px',
              data: {
                title: 'Appointment Status',
                description: response
              }
            });
            this.notificationService.createNotification(this.appointments[0].ConsultantID, null, this.appointments[0].AppointmentID, "Rated", "Meeting with " + this.appointments[0].UserName + " " + this.appointments[0].UserLastName, 'Student provided feedback to an appointment.')
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
  //Change Information View
  selectedInfo: string = "Appointment";

  changeSelectedInfo(info:string){
    this.selectedInfo = info;
    this.edit = false;
  }
  //Documentation
  generateFPDF(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const options = { headers, responseType: 'blob' as 'json' };

    return this.http.post(`${mainPort}/pdo/api/generate_report`, this.appointmentId, options);
  }

  downloadPDF() {
    this.generateFPDF().subscribe(
      (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Appointment_Summary_Report.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error => {
        console.error('Error generating PDF:', error);
        // Handle error as needed
      }
    );
  }
  //Stars
  fullStars: number[] = [];
  halfStar: number = 0;
  emptyStars: number[] = [];

  getAverageStars() {
    let average = (this.appointments[0].rating + 
                   this.appointments[0].rating2 + 
                   this.appointments[0].rating3 + 
                   this.appointments[0].rating4) / 4;

    const fullStarCount = Math.floor(average);
    const decimalPart = average - fullStarCount;
    const halfStarCount = decimalPart >= 0 ? 1 : 0;
    const emptyStarCount = 5 - fullStarCount - halfStarCount;

    this.fullStars = Array(fullStarCount).fill(0); 
    this.halfStar = halfStarCount;
    this.emptyStars = Array(emptyStarCount).fill(0); 
}

  changeEdit(){
    this.edit = !this.edit;
  }
}
