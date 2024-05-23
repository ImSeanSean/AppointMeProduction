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

@Component({
  selector: 'app-appointment-view-1',
  standalone: true,
  imports: [NgStyle, NgFor, MatSlideToggleModule, FormsModule],
  templateUrl: './appointment-view-1.component.html',
  styleUrl: './appointment-view-1.component.css'
})
export class AppointmentView1Component implements OnInit{
  selectedDate: Date = new Date();
  selectedTime: String | null = null;
  selectedTimeId: number | null = null;
  selectedMode: string | null = null;
  selectedUrgency: string | null = null;
  formattedDate: string | null = null;
  teacherId: string = ""; 
  teachers: Teacher[] = [];
  token = localStorage.getItem('token');
  //Schedule Variables
  appointmentTimes: DaySchedule[] = [];
  dayAppointment: Appointment[] = [];

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private service: AppointmentViewServiceService, 
    private datePipe: DatePipe, 
    private route: ActivatedRoute, 
    public dialog: MatDialog,
    private userInfo: UserInformationService,
    private appointmentvalidator: AppointmentValidationService
  ) {};

  changeRoute() {
    if (this.selectedTime != null && this.selectedMode && this.selectedUrgency) {
      this.service.selectedTime = this.selectedTime;
      this.service.selectedDate = this.formattedDate;
      this.service.selectedMode = this.selectedMode;
      this.service.selectedUrgency = this.selectedUrgency;
      this.service.teacher = this.teacherId;
      this.router.navigate(['student/dashboard/appointment-view-2', this.teacherId]);
    } else {
      this.dialog.open(ErrorComponent, {
        width: '300px',
        data: {
          title: 'Incomplete Details',
          description: 'Please select all necessary details.'
        }
      });
    }
  }

  selectTime(time: String, timeId: number): void {
    this.selectedTime = this.convertToAMPM(time)
    this.selectedTimeId = timeId
  }

  getTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`${mainPort}/pdo/api/get_consultants/${this.teacherId}`);
  }

  increaseFormattedDate(): void {
    if (this.selectedDate) {
      // Get the last day of the current month
      const lastDayOfMonth = new Date(
        this.selectedDate.getFullYear(),
        this.selectedDate.getMonth() + 1,
        0
      ).getDate();
  
      // Increment the date by one day
      this.selectedDate.setDate(this.selectedDate.getDate() + 1);
  
      // Check if the date exceeds the last day of the current month
      if (this.selectedDate.getDate() > lastDayOfMonth) {
        // Reset the date to the first day of the next month
        this.selectedDate.setDate(1);
        this.selectedDate.setMonth(this.selectedDate.getMonth() + 1);
      }
  
      // Update the formatted date
      this.formattedDate = this.datePipe.transform(
        this.selectedDate,
        'EEEE, MMMM dd, yyyy'
      );

      const selectedDay = this.selectedDate.getDay();

      this.getDaySchedule(selectedDay).subscribe(
        (data: DaySchedule[]) => {
          this.appointmentTimes = data;
        },
        (error) => {

        }
      );
    }
  }
  decreaseFormattedDate(): void {
    if (this.selectedDate) {
      // Decrement the date by one day
      this.selectedDate.setDate(this.selectedDate.getDate() - 1);
  
      // Check if the date is less than the present day
      if (this.selectedDate < new Date()) {
        // Reset the date to the present day
        this.selectedDate = new Date();
      }
  
      // Update the formatted date
      this.formattedDate = this.datePipe.transform(
        this.selectedDate,
        'EEEE, MMMM dd, yyyy'
      );

      const selectedDay = this.selectedDate.getDay();

      this.getDaySchedule(selectedDay).subscribe(
        (data: DaySchedule[]) => {
          this.appointmentTimes = data;
        },
        (error) => {

        }
      );
    }
  }
  //Get Schedule
  getDaySchedule(day: number): Observable<DaySchedule[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    
    return this.http.get<DaySchedule[]>(`${mainPort}/pdo/api/get_day_schedule_student/${this.teacherId}/${day}`, { headers }).pipe(
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
        // Handle error here, for example, return an empty array
        return of([]);
      })
    );
  }
  convertToAMPM(time: String): string {
    const [hours, minutes, seconds] = time.split(':');
    let hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    hour = hour % 12;
    hour = hour ? hour : 12; // Handle midnight (0 hours)
    return `${hour}:${minutes} ${ampm}`;
  }

  ngOnInit(): void {
      this.selectedDate = new Date();
      this.formattedDate = this.datePipe.transform(this.selectedDate, 'EEEE, MMMM dd, yyyy');
      this.teacherId = this.route.snapshot.params['teacherId'];
      this.getTeachers().subscribe(
      (data: Teacher[]) => {
        this.teachers = data;
        console.log(this.teachers);
      },
      (error) => {

      }
    );
    //Day of the Week
    const currentDayOfWeek = this.selectedDate.getDay();
    
    this.getDaySchedule(currentDayOfWeek).subscribe(
      (data: DaySchedule[]) => {
        this.appointmentTimes = data;
      },
      (error) => {

      }
    );
  }
  //Validate if time is occupied
  isTimeOccupied(time:String){
    //Get Appointments for that Day
    this.appointmentvalidator.getTeacherDayAppointments(this.teacherId, this.selectedDate).subscribe(result => {
      this.dayAppointment = result;
    })
    this.dayAppointment.forEach((appointment: Appointment) => {
      let appointmentDate = new Date(appointment.AppointmentDate)
      let appointmentTime = appointmentDate.getHours() + ':' + appointmentDate.getMinutes
      if(time == appointmentTime){
        return true;
      }
      else{
        return false;
      }
    });
  }
}
