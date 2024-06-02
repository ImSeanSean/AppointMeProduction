import { NgStyle, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-teacher-appointment-create',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatSelectModule, MatInputModule, NgStyle, NgFor],
  templateUrl: './teacher-appointment-create.component.html',
  styleUrl: './teacher-appointment-create.component.css'
})
export class TeacherAppointmentCreateComponent {

}
