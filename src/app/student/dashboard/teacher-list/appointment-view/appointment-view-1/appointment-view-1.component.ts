import { Component, OnInit } from '@angular/core';
import { Teacher } from '../../../../../interfaces/Teacher';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentViewServiceService } from '../../../../../services/appointment-view/appointment-view-service.service';
import { DatePipe, NgFor, NgStyle } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ErrorComponent } from '../../../../../matdialogs/error/error.component';
import { Observable, catchError, map, of } from 'rxjs';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { DaySchedule } from '../../../../../interfaces/DaySchedule';
import { UserInformationService } from '../../../../../services/user-information/user-information.service';
import { AppointmentValidationService } from '../../../../../services/appointment/appointment-validation.service';
import { Appointment } from '../../../../../interfaces/Appointment';
import { mainPort } from '../../../../../app.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { Queue } from '../../../../../interfaces/queue';
import { HTMLResponse } from '../../../../../interfaces/HTMLResponse';

@Component({
  selector: 'app-appointment-view-1',
  standalone: true,
  imports: [NgStyle, NgFor, MatSlideToggleModule, FormsModule, MatTooltipModule],
  templateUrl: './appointment-view-1.component.html',
  styleUrl: './appointment-view-1.component.css'
})
export class AppointmentView1Component implements OnInit{
  selectedTime: String | null = null;
  selectedMode: string | null = null;
  selectedDay: String | null = null;
  selectedUrgency: string | null = null;
  teacherId: string = ""; 
  teachers: Teacher[] = [];
  appointments: Appointment[] = [];
  queue: Queue[] = [];
  reason: String | null = null;
  token = localStorage.getItem('token');

  constructor(
    private http: HttpClient, 
    private route: ActivatedRoute, 
    public dialog: MatDialog,
  ) {};

  getTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`${mainPort}/pdo/api/get_consultants/${this.teacherId}`);
  }

  getAppointments(): Observable<Appointment[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Appointment[]>(`${mainPort}/pdo/api/get_appointment_teacher/${this.teacherId}`, {headers});
  }

  addQueue(){
    const data = {
      key: localStorage.getItem('token'),
      teacher_id: this.teachers[0].ConsultantID,
      mode: this.selectedMode,
      urgency: this.selectedUrgency,
      day: this.selectedDay,
      time: this.selectedTime,
      reason: this.reason
    }
    console.log(data)
    this.http.post(`${mainPort}/pdo/api/add_queue`, data).subscribe(
      (response: any) => { 
        this.dialog.open(ErrorComponent, {
          width: '300px',
          data: {
            title: 'Queue Status',
            description: response
          }
        })
      },
      error => {
        console.error('HTTP Error:', error);
      }
    );
  }

  getQueue(): Observable<Queue[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Appointment[]>(`${mainPort}/pdo/api/get_queue_teacher/${this.teacherId}`, {headers});
  }

  ngOnInit(): void {
      this.teacherId = this.route.snapshot.params['teacherId'];
      this.getTeachers().subscribe(
      (data: Teacher[]) => {
        this.teachers = data;
        console.log(this.teachers);
      },
      (error) => {

      }
    );

    this.getAppointments().subscribe(
      (data: Appointment[]) => {
        this.appointments = data;
        console.log(this.teachers);
      },
      (error) => {

      }
    );

    this.getQueue().subscribe(
      (data: Queue[]) => {
        this.queue = data;
        console.log(this.teachers);
      },
      (error) => {

      }
    );
  }
}
