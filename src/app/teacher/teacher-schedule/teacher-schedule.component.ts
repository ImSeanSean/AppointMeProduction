import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { Day } from '../../interfaces/Day';
import { NgFor, NgStyle, Time } from '@angular/common';
import { DaySchedule } from '../../interfaces/DaySchedule';
import { Observable, catchError, map, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserInformationService } from '../../services/user-information/user-information.service';
import { MatDialog } from '@angular/material/dialog';
import { ErrorComponent } from '../../matdialogs/error/error.component';
import { ConfirmationComponent } from '../../matdialogs/confirmation/confirmation.component';
import { Teacher } from '../../interfaces/Teacher';

@Component({
  selector: 'app-teacher-schedule',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatSelectModule, MatInputModule, NgStyle, NgFor],
  templateUrl: './teacher-schedule.component.html',
  styleUrl: './teacher-schedule.component.css'
})
export class TeacherScheduleComponent implements OnInit{

  constructor(private http: HttpClient, private userInfo: UserInformationService, public dialog: MatDialog ) {
    this.days = [
      { name: 'Monday', day: 1},
      { name: 'Tuesday', day: 2},
      { name: 'Wednesday', day: 3},
      { name: 'Thursday', day: 4},
      { name: 'Friday', day: 5},
      { name: 'Saturday', day: 6},
    ];
  }
  selectedTime: number | null = null;
  selectedDay: number = 1;
  selectedStartTime: number | null = null;
  days: Day[];
  teacher: Teacher[] = [];
  appointmentTimes: DaySchedule[] = [];
  usertype = localStorage.getItem('user');
  teacherId = this.userInfo.userId;
  token = localStorage.getItem('token');

  ngOnInit(): void {
    this.getTeacher().subscribe(
      (data: Teacher[]) => {
        this.teacher = data;
        this.userInfo.userId = this.teacher[0].ConsultantID;
      },
      (error) => {
        console.error('Error fetching teachers:', error);
      }
    );
    this.getDaySchedule(1).subscribe(
      (data: DaySchedule[]) => {
        this.appointmentTimes = data;
        this.teacherId = this.userInfo.userId;
      },
      (error) => {
        console.error('Error fetching appointments:', error);
      }
    );
  }

  selectTime(time: number): void {
    this.selectedTime = time
  }

  getTeacher(){
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Teacher[]>('http://localhost/appointme/pdo/api/get_teacher', { headers });
  }

  getDaySchedule(day: number): Observable<DaySchedule[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    
    return this.http.get<DaySchedule[]>(`http://localhost/appointme/pdo/api/get_day_schedule/${day}`, { headers }).pipe(
      map((data: DaySchedule[] | null) => {
        if (data === null) {
          // Handle null case, for example, return an empty array
          return [];
        }
        // Sort the data by start time
        data.sort((a, b) => {
          const startTimeA = a.startTime.toString();
          const startTimeB = b.startTime.toString();
          return startTimeA.localeCompare(startTimeB);  
        });
        return data;
      }),
      catchError((error) => {
        console.error('Error fetching day schedule:', error);
        // Handle error here, for example, return an empty array
        return of([]);
      })
    );
  }

  deleteDaySchedule(scheduleId: object){
    return this.http.post('http://localhost/appointme/pdo/api/remove_schedule', scheduleId);
  }

  removeAllDaySchedule(day: object){
    return this.http.post('http://localhost/appointme/pdo/api/remove_all_schedule', day);
  }

  addSchedule(day:number){
    if(!this.selectedStartTime){
      this.dialog.open(ErrorComponent, {
        width: '300px',
        data: {
          title: 'No Selected Time',
          description: 'Please select a time to add.'
        }
      });
      return;
    }
    if(!this.teacherId){
      this.dialog.open(ErrorComponent, {
        width: '300px',
        data: {
          title: 'Error',
          description: 'Teacher cannot be detected. Please refresh.'
        }
      });
    }
    const data = {
      key: localStorage.getItem('token'),
      teacher_id: this.teacherId,
      startTime: this.selectedStartTime,
      day: this.selectedDay
    }
    return this.http.post('http://localhost/appointme/pdo/api/add_schedule', data).subscribe(result=>{
      if(result == 2){
        this.dialog.open(ErrorComponent, {
          width: '300px',
          data: {
            title: 'Schedule already exists.',
            description: 'Please enter a different schedule.'
          }
        });
        return;
      }
      this.getDaySchedule(this.selectedDay).subscribe(
        (data: DaySchedule[]) => {
          this.appointmentTimes = data;
          this.teacherId = this.userInfo.userId;
        },
        (error) => {
          console.error('Error fetching appointments:', error);
        }
      );
    });
  }

  removeScheduleConfirmation(scheduleId:number){
    if(!scheduleId){
      this.dialog.open(ErrorComponent, {
        width: '300px',
        data: {
          title: 'No Time Selected',
          description: 'Please select a time.'
        }
      })
      return;
    }
    //Setup Object
    const data = {
      key: this.token,
      schedule_id: scheduleId
    }
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '300px',
      data: {
        title: 'Delete Time',
        description: 'Are you sure you want to delete this time?'
      }
    }); 

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteDaySchedule(data).subscribe(result=> {
          this.onSelectedDayChange(this.selectedDay);
        });
      }
    });
  }

  removeAllScheduleConfirmation(day:number){
    if(!day){
      this.dialog.open(ErrorComponent, {
        width: '500px',
        data: {
          title: 'No Day Selected',
          description: 'Please select a day.'
        }
      })
      return;
    }
    //Setup Object
    const data = {
      key: this.token,
      day: day,
      consultant_id: this.userInfo.userId
    }
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '300px',
      data: {
        title: 'Delete All Schedule',
        description: 'Are you sure you want to delete all schedule for this day?'
      }
    }); 

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.removeAllDaySchedule(data).subscribe(result=> {
          this.onSelectedDayChange(this.selectedDay);
        });
      }
    });
  }

  onSelectedDayChange(day: number): void {
    // Fetch the updated data for the selected day
    this.getDaySchedule(day).subscribe(
      (data: DaySchedule[]) => {
        this.appointmentTimes = data;
      },
      (error) => {
        console.error('Error fetching appointments:', error);
      }
    );
  }

  //Formatting Functions
  convertToAMPM(time: String): string {
    const [hours, minutes, seconds] = time.split(':');
    let hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    hour = hour % 12;
    hour = hour ? hour : 12; // Handle midnight (0 hours)
    return `${hour}:${minutes} ${ampm}`;
  }
}
