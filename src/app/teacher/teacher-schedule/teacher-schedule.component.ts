import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { Day } from '../../interfaces/Day';
import { NgFor, NgStyle } from '@angular/common';

@Component({
  selector: 'app-teacher-schedule',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatSelectModule, MatInputModule, NgStyle, NgFor],
  templateUrl: './teacher-schedule.component.html',
  styleUrl: './teacher-schedule.component.css'
})
export class TeacherScheduleComponent {
  selectedTime: string | null = null;
  selectedDay = "Monday";
  days: Day[];

  appointmentTimes: string[] = ['7am', '8am', '9am', '10am', '11am', '1pm', '2pm', '3pm', '4pm'];

  constructor() {
    this.days = [
      { name: 'Monday' },
      { name: 'Tuesday' },
      { name: 'Wednesday' },
      { name: 'Thursday' },
      { name: 'Friday' },
      { name: 'Saturday' },
      { name: 'Sunday' }
    ];
  }

  selectTime(time: string): void {
    this.selectedTime = time === this.selectedTime ? null : time;
  }
}
