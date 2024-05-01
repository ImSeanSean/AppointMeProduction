import { Component, OnInit } from '@angular/core';
import { Teacher } from '../../../../../interfaces/Teacher';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentViewServiceService } from '../../../../../services/appointment-view/appointment-view-service.service';
import { DatePipe, NgFor, NgStyle } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ErrorComponent } from '../../../../../matdialogs/error/error.component';
import { Observable } from 'rxjs';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-appointment-view-1',
  standalone: true,
  imports: [NgStyle, NgFor, MatSlideToggleModule, FormsModule],
  templateUrl: './appointment-view-1.component.html',
  styleUrl: './appointment-view-1.component.css'
})
export class AppointmentView1Component implements OnInit{
  selectedDate: Date | null = null;
  selectedTime: string | null = null; 
  selectedMode: string | null = null;
  selectedUrgency: string | null = null;
  formattedDate: string | null = null;
  appointmentTimes: string[] = ['7am', '8am', '9am', '10am', '11am', '1pm', '2pm', '3pm', '4pm'];
  teacherId: string | null = null; 
  teachers: Teacher[] = [];

  constructor(private http: HttpClient, private router: Router, private service: AppointmentViewServiceService, private datePipe: DatePipe, private route: ActivatedRoute, public dialog: MatDialog) {};

  changeRoute() {
    if (this.selectedTime != null) {
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
          title: 'Select Time',
          description: 'Please select a time.'
        }
      });
    }
  }

  selectTime(time: string): void {
    this.selectedTime = time === this.selectedTime ? null : time;
  }

  getTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`http://localhost/appointme/pdo/api/get_consultants/${this.teacherId}`);
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
        'MMMM dd, yyyy'
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
        'MMMM dd, yyyy'
      );
    }
  }
  

  ngOnInit(): void {
      this.selectedDate = new Date();
      this.formattedDate = this.datePipe.transform(this.selectedDate, 'MMMM dd, yyyy');
      this.teacherId = this.route.snapshot.params['teacherId'];
      this.getTeachers().subscribe(
      (data: Teacher[]) => {
        this.teachers = data;
        console.log(this.teachers);
      },
      (error) => {
        console.error('Error fetching teachers:', error);
      }
    );
  }
}
