import { NgStyle, NgFor, NgIf, formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Queue } from '../../interfaces/Queue';
import { Observable, filter, map, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppComponent, mainPort } from '../../app.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Appointment } from '../../interfaces/Appointment';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationInputComponent } from '../../matdialogs/confirmation-input/confirmation-input/confirmation-input.component';

@Component({
  selector: 'app-teacher-appointment-create',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatSelectModule, MatInputModule, NgStyle, NgFor, NgIf],
  templateUrl: './teacher-appointment-create.component.html',
  styleUrl: './teacher-appointment-create.component.css'
})
export class TeacherAppointmentCreateComponent implements OnInit {
  allIsLoaded: boolean = false;
  teacherId: string | null = "";
  queueId: string | null = "";
  queue: Queue[] = [];
  appointments: Appointment[] = [];
  filteredAppointment: Appointment[] = [];
  selectedDate: string = new Date().toISOString().split('T')[0];
  selectedTime: string = "12:00";
  selectedMode: string = "Face to Face";
  message: string = "";

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router
  ) {}

  //Change Route
  changeRoute(appointmentId: number){
    this.router.navigate([`teacher/dashboard/appointments/confirmed/${appointmentId}`]);
  }

  getQueue(): Observable<Queue[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Queue[]>(`${mainPort}/pdo/api/get_queue_teacher/${this.teacherId}/${this.queueId}`, { headers });
  }

  //Create Appointments
  createAppointment(){
    const confirmation = this.dialog.open(ConfirmationInputComponent, {
      height: '40vh',
      width: '30vw',
      data: {
        title: 'Create Appointment',
        description: 'Optional message to student...'
      }
    })

    confirmation.afterClosed().subscribe(result => {
      if(result[0]){
        const data = {
          key: localStorage.getItem('token'),
          user_id: this.queue[0].student_id,
          previous_appointment_id: this.queue[0].previous_appointment_id,
          teacher: this.teacherId,
          date: this.selectedDate,
          time: this.selectedTime + ":00",
          mode: this.selectedMode,
          title: this.queue[0].appointment_title,
          appointmentInfo: this.queue[0].reason,
          details: result[1]
        }
        this.http.post(`${mainPort}/pdo/api/create_appointment`, data).subscribe(result => {
          this.updateValues()
          const data = {
            key: localStorage.getItem('token'),
            queue_id: this.queue[0].queue_id
          }
          this.http.post(`${mainPort}/pdo/api/delete_queue`, data).subscribe(result => {
            this.router.navigate([`teacher/dashboard/appointments`])
          })
        })
      }
    })
  }

  getAppointments(): Observable<Appointment[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Appointment[]>(`${mainPort}/pdo/api/get_appointment_teacher/${this.teacherId}`, { headers });
  }

  filterAppointments(): void {
    const formattedSelectedDate = formatDate(this.selectedDate, 'yyyy-MM-dd', 'en-US');
    this.filteredAppointment = this.appointments.filter(appointment => {
      const formattedAppointmentDate = formatDate(appointment.AppointmentDate, 'yyyy-MM-dd', 'en-US');
      return formattedAppointmentDate === formattedSelectedDate && appointment.Completed == 0;
    });
  }

  updateFilteredAppointments(): void {
    if (this.appointments.length > 0) {
      this.filterAppointments();
    }
  }

  convertDate(date: string): string {
    const inputDate = new Date(date);
    return inputDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getDay(date: string): string {
    const inputDate = new Date(date);
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekdays[inputDate.getDay()];
  }

  updateValues(){
    this.getAppointments().subscribe(result => {
      this.appointments = result;
      this.updateFilteredAppointments();
    });
  }

  ngOnInit(): void {
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.teacherId = localStorage.getItem('id');
    this.queueId = this.route.snapshot.params['appointmentId'];
    this.convertDate(this.selectedDate);
    this.getQueue().subscribe(result => {
      this.queue = result;
      this.getAppointments().subscribe(result => {
        this.appointments = result;
        this.updateFilteredAppointments();
        this.allIsLoaded = true;
      });
    });
  }
}