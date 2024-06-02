import { Component, OnInit } from '@angular/core';
import { Teacher } from '../../../../../interfaces/Teacher';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentViewServiceService } from '../../../../../services/appointment-view/appointment-view-service.service';
import { DatePipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
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
import { Queue } from '../../../../../interfaces/Queue';
import { HTMLResponse } from '../../../../../interfaces/HTMLResponse';

@Component({
  selector: 'app-appointment-view-1',
  standalone: true,
  imports: [NgStyle, NgFor, MatSlideToggleModule, FormsModule, MatTooltipModule, NgIf],
  templateUrl: './appointment-view-1.component.html',
  styleUrl: './appointment-view-1.component.css'
})
export class AppointmentView1Component implements OnInit{
  //Variables
  selectedTime: String | null = null;
  selectedMode: string | null = null;
  selectedDay: String | null = null;
  selectedUrgency: string | null = null;
  appointments: Appointment[] = [];
  queue: Queue[] = [];
  reason: String | null = null;
  token = localStorage.getItem('token');
  isDataLoaded = false;
  //Teacher Variables
  teachers: Teacher[] = [];
  teacherId: string = ""; 
  teacherName: string = "";
  teacherDepartment: string = "";
  teacherPosition: string = "";
  queueLength: number = 0;
  appointmentLength: number = 0;
  //If inQueue
  inQueue: boolean = false;
  queueIndex: number = 0;
  studentQueue: Queue | undefined = undefined;
  //Functions
  constructor(
    private http: HttpClient, 
    private route: ActivatedRoute, 
    public dialog: MatDialog,
    private router: Router,
    private datePipe: DatePipe
  ) {};
  //Teacher-Related Functions
  getTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`${mainPort}/pdo/api/get_consultants/${this.teacherId}`);
  }
  //Queue-Related Functions
  //Add Queue
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
        console.log(response)
        if(response == 0){
          this.dialog.open(ErrorComponent, {
            width: '300px',
            data: {
              title: 'Added to Queue',
              description: 'You have been successfully added to the queue.'
            }
          })

          this.updateData();
        }
        else if(response == 1){
          this.dialog.open(ErrorComponent, {
            width: '300px',
            data: {
              title: 'Already Queued',
              description: 'You already have a queue with the Faculty Member.'
            }
          })
          this.closeWindow();
        }
        else if(response == 2){
          this.dialog.open(ErrorComponent, {
            width: '300px',
            data: {
              title: 'Error adding to Queue',
              description: 'An error was encountered in the queueing process.'
            }
          })
          this.closeWindow();
        }
        else{

        }
      },
      error => {
        console.error('HTTP Error:', error);
      }
    );
  }
  //Get Queue
  getQueue(): Observable<Queue[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Queue[]>(`${mainPort}/pdo/api/get_queue_teacher/${this.teacherId}`, {headers});
  }
  //Check If User is in Queue
  isInQueue(){
    const studentId = localStorage.getItem('id');
    const matchingQueue = this.queue.find(queue => queue.student_id.toString() === studentId);
    if (matchingQueue){
        this.inQueue = true;
        this.queueIndex = this.queue.findIndex(queue => queue.student_id.toString() === studentId) + 1; 
        this.studentQueue = matchingQueue;
    }
  }
  //Appointment-Related Functions
  //Get Appointments
  getAppointments(): Observable<Appointment[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Appointment[]>(`${mainPort}/pdo/api/get_appointment_teacher/${this.teacherId}`, {headers});
  }
  //Other Functions
  updateData(){
    this.getAppointments().subscribe(
      (data: Appointment[]) => {
        this.appointments = data;
        this.appointmentLength = this.appointments.length
      }
    );
    this.getQueue().subscribe(
      (data: Queue[]) => {
        this.queue = data;
        this.queueLength = this.queue.length
        this.isInQueue();
        this.isDataLoaded = true;
      }
    );
  }
  closeWindow() {
    var user = localStorage.getItem('user')
    if (user == "user"){
      user = "student";
    }
    this.router.navigate([`${user}/dashboard/main`]);
  }
  getFormattedTime(date:string | undefined){
    if(!date){
      return "";
    }
    const today = new Date();
    const [hours, minutes, seconds] = date.split(':');
    today.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));

    // Format the Date object to a string using DatePipe
    return this.datePipe.transform(today, 'h:mm a');
  }
  //onInitFunction
  ngOnInit(): void {
      this.teacherId = this.route.snapshot.params['teacherId'];
      this.getTeachers().subscribe(
      (data: Teacher[]) => {
        this.teachers = data;
        //Set the Variables
        this.teacherName = this.teachers[0].first_name + this.teachers[0].last_name
        this.teacherDepartment = this.teachers[0].department
        this.teacherPosition = this.teachers[0].position

        this.getAppointments().subscribe(
          (data: Appointment[]) => {
            this.appointments = data;
            this.appointmentLength = this.appointments.length

            this.getQueue().subscribe(
              (data: Queue[]) => {
                this.queue = data;
                this.queueLength = this.queue.length
                this.isInQueue();
                this.isDataLoaded = true;
              },
              (error) => {
        
              }
            );
          },
          (error) => {
    
          }
        );
      },
      (error) => {

      }
    );
  }
}
