import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Appointment } from '../../../interfaces/Appointment';
import { Observable } from 'rxjs';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { mainPort } from '../../../app.component';
import { Queue } from '../../../interfaces/Queue';
import { UserInformationService } from '../../../services/user-information/user-information.service';

@Component({
  selector: 'app-appointment-card',
  standalone: true,
  imports: [NgFor, NgClass, NgIf],
  templateUrl: './appointment-card.component.html',
  styleUrl: './appointment-card.component.css'
})
export class AppointmentCardComponent {
  constructor(private http: HttpClient, private router: Router, private userInformation: UserInformationService, private datePipe: DatePipe) {};
  //Universal Variables
  queue: Queue[] = [];
  userType = localStorage.getItem('user');
  //Student Variables
  studentId = localStorage.getItem('id');
  //Teacher Variables
  teacherId = this.userInformation.userId;

  changeRoute(queue:Queue) {
    if(this.userType == "user"){
      this.router.navigate([`student/dashboard/appointment-view/${queue.teacher_id}`])
    }
    else if(this.userType == "teacher"){
      const currentUrl = this.router.url
      this.router.navigate([`${currentUrl}/pending`, queue.queue_id]);
    }
  }

  getQueue(): Observable<Queue[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    if(this.userType == "user"){
      return this.http.get<Queue[]>(`${mainPort}/pdo/api/get_queue_student/${this.studentId}`, {headers});
    }
    else if(this.userType == "teacher"){
      return this.http.get<Queue[]>(`${mainPort}/pdo/api/get_queue_teacher/${this.teacherId}`, {headers});
    }
    else{
      return this.http.get<Queue[]>(`${mainPort}/pdo/api/get_queue_teacher/${this.teacherId}`, {headers});;
    }
  }

  getFormattedDate(date:string){
    const datePipe = new DatePipe('en-US');
    return datePipe.transform(date, 'MMMM dd, yyyy')
  } 

  getFormattedTime(date:string){
    const today = new Date();
    const [hours, minutes, seconds] = date.split(':');
    today.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));

    // Format the Date object to a string using DatePipe
    return this.datePipe.transform(today, 'h:mm a');
  }

  ngOnInit(): void {
    this.teacherId = localStorage.getItem('id')
    this.getQueue().subscribe(result =>{
      this.queue = result;
    })
  }
}
