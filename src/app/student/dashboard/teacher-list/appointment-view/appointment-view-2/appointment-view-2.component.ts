import { Component } from '@angular/core';
import { AppointmentViewServiceService } from '../../../../../services/appointment-view/appointment-view-service.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ErrorComponent } from '../../../../../matdialogs/error/error.component';
import { FormsModule, NgModel } from '@angular/forms';
import { mainPort } from '../../../../../app.component';

@Component({
  selector: 'app-appointment-view-2',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './appointment-view-2.component.html',
  styleUrl: './appointment-view-2.component.css'
})
export class AppointmentView2Component {

  constructor(private service: AppointmentViewServiceService, private http: HttpClient, public dialog: MatDialog, private router: Router){};

  teacher = this.service.teacher;
  selectedTime = this.service.selectedTime;
  selectedDate = this.service.selectedDate;
  selectedMode = this.service.selectedMode;
  selectedUrgency = this.service.selectedUrgency;
  appointmentDetails: string = '';

  createAppointment(){
    const data = {
      key: localStorage.getItem('token'),
      date: this.service.selectedDate,
      time: this.service.selectedTime,
      mode: this.service.selectedMode,
      urgency: this.service.selectedUrgency,
      teacher: this.service.teacher,
      details: this.appointmentDetails,
    };
    if(data.date && data.time && data.mode && data.urgency && data.teacher){
      this.http.post(`${mainPort}/pdo/api/create_appointment`, data)
      .subscribe(
        (response: any) => {
          this.dialog.open(ErrorComponent, {
            width: '300px',
            data: {
              title: 'Appointment Status',
              description: response
            }
          });
          this.router.navigate(['student/dashboard/main']);
        },
      );
    }
    else{
      this.dialog.open(ErrorComponent, {
        width: '300px',
        data: {
          title: 'Appointment Status',
          description: "Incomplete Data. Returning to Dashboard."
        }
      });
      this.router.navigate(['student/dashboard/main']);
    }
  }
}
