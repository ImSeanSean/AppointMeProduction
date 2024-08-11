import { Component } from '@angular/core';
import { AppointmentCardCompletedComponent } from "../../../components/appointment-card/appointment-card-completed/appointment-card-completed.component";
import { Router } from '@angular/router';
import { CompletedAppointmentDataService } from '../../../services/appointment-view-completed/completed-appointment-data.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { Appointment } from '../../../interfaces/Appointment';
import { NgFor, NgIf } from '@angular/common';
import { mainPort } from '../../../app.component';

@Component({
    selector: 'app-appointment-student-confirmed',
    standalone: true,
    templateUrl: './appointment-student-confirmed.component.html',
    styleUrl: './appointment-student-confirmed.component.css',
    imports: [AppointmentCardCompletedComponent, NgIf, NgFor]
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
              this.getAverageStars();
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
    
        return this.http.get<Appointment[]>(`${mainPort}/pdo/api/get_appointment/${this.appointmentId}`, { headers })
          .pipe(
            catchError((error) => {
              console.error('HTTP error:', error);
              return [];
            })
          );
      }
      generateFPDF(): Observable<Blob> {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        const userid = localStorage.getItem('id');
        const data = {
          consultantId: userid
        }
        
        // The key part here is ensuring that the responseType is set to 'blob'
        return this.http.post(`${mainPort}/pdo/api/generate_all_reports`, data, {
          headers,
          responseType: 'blob' // Correctly specify the response type as 'blob'
        });
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
}
