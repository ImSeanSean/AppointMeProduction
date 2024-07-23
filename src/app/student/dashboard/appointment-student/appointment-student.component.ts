import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AppointmentCardComponent } from "../../../components/appointment-card/appointment-card/appointment-card.component";
import { AppointmentCardConfirmedComponent } from "../../../components/appointment-card/appointment-card-confirmed/appointment-card-confirmed.component";
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-appointment-student',
    standalone: true,
    templateUrl: './appointment-student.component.html',
    styleUrl: './appointment-student.component.css',
    imports: [AppointmentCardComponent, AppointmentCardConfirmedComponent, HttpClientModule, RouterModule, FormsModule]
})
export class AppointmentStudentComponent {
  constructor(private router: Router){} 

  searchTerm: string = '';

  changeRoute() {
      this.router.navigate(['/dashboard/teacher-appointment-view']);
    }
}
