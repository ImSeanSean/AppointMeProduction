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
import { FormsModule, NgModel } from '@angular/forms';
import { DaySchedule } from '../../../../../interfaces/DaySchedule';
import { UserInformationService } from '../../../../../services/user-information/user-information.service';
import { AppointmentValidationService } from '../../../../../services/appointment/appointment-validation.service';
import { Appointment } from '../../../../../interfaces/Appointment';
import { mainPort } from '../../../../../app.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { Queue } from '../../../../../interfaces/Queue';
import { HTMLResponse } from '../../../../../interfaces/HTMLResponse';
import { ConfirmationComponent } from '../../../../../matdialogs/confirmation/confirmation.component';

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
  title: String | null = null;
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
  queueId: number = 0;
  queueIndex: number = 0;
  studentQueue: Queue | undefined = undefined;
  preferredDay: string = "";
  preferredTime: string = "";
  preferredMode: string = "";
  urgency: string = "";
  daysOfWeek: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  //Allow Edit
  edit: boolean = false;
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
    if(!this.selectedMode || !this.selectedDay || !this.selectedTime || !this.title || !this.reason){
      this.dialog.open(ErrorComponent, {
        width: '300px',
        data: {
          title: 'Incomplete Form',
          description: 'Please fill-up the entire form.'
        }
      })
      return
    }
    const data = {
      key: localStorage.getItem('token'),
      teacher_id: this.teachers[0].ConsultantID,
      title: this.title,
      mode: this.selectedMode,
      urgency: this.selectedUrgency,
      day: this.selectedDay,
      time: this.selectedTime,
      reason: this.reason
    }
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
  //Update Queue
  updateQueue(){
    const confirmation = this.dialog.open(ConfirmationComponent, {
      width: '300px',
      data: {
        title: 'Update Request',
        description: 'Are you sure you want to update your request?'
      }
    })

    confirmation.afterClosed().subscribe(result => {
      if(result){
        const data = {
          key: localStorage.getItem('token'),
          queue_id: this.queueId,
          title: this.title,
          day: this.preferredDay,
          time: this.preferredTime + ":00",
          mode: this.preferredMode,
          urgency: this.urgency
        }
        this.http.post(`${mainPort}/pdo/api/update_queue`, data).subscribe(result =>{
          this.edit = false;
          this.updateData();
        });
      }
    })
    return;
  }
  //Delete Queue
  deleteQueue(){
    const confirmation = this.dialog.open(ConfirmationComponent, {
        width: '300px',
        data: {
          title: 'Cancel Queue',
          description: 'Are you sure you want to cancel your queue?'
        }
      }
    )
    confirmation.afterClosed().subscribe(result => {
      if(result){
        const data = {
          key: localStorage.getItem('token'),
          queue_id: this.queueId,
        }
        this.http.post(`${mainPort}/pdo/api/delete_queue`, data).subscribe(result =>{
          this.updateData();
        });
      }
    })
    return;
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
      this.queueId = matchingQueue.queue_id
      this.queueIndex = this.queue.findIndex(queue => queue.student_id.toString() === studentId) + 1; 
      this.studentQueue = matchingQueue;
      this.title = matchingQueue.appointment_title;
      this.preferredDay = matchingQueue.day;
      this.urgency = matchingQueue.urgency;
      // Parse the time string and extract only the hour and minute part
      if(matchingQueue.time){
        const [hour, minute] = matchingQueue.time.split(':');
        this.preferredTime = `${hour}:${minute}`;
      }
      // Format the hour and minute part to match the "HH:MM" format
      this.preferredMode = matchingQueue.mode;
    }
    else{
      this.inQueue = false;
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
  toggleEdit(){
    this.edit = !this.edit
  }
  updateData(){
    this.getAppointments().subscribe(
      (data: Appointment[]) => {
        this.appointments = data;
        this.appointmentLength = this.appointments.filter(appoinment => !appoinment.Completed).length
        console.log(this.appointmentLength)
      }
    );
    this.getQueue().subscribe(
      (data: Queue[]) => {
        this.queue = data;
        this.queueLength = this.queue.length
        this.isInQueue();
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
        this.teacherName = this.teachers[0].first_name + " " + this.teachers[0].last_name
        this.teacherDepartment = this.teachers[0].department
        this.teacherPosition = this.teachers[0].position

        this.getAppointments().subscribe(
          (data: Appointment[]) => {
            this.appointments = data;
            this.appointmentLength = this.appointments.filter(appointment => !appointment.Completed).length

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
