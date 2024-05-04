import { Component } from '@angular/core';
import { AppointmentCardCompletedComponent } from "../../../components/appointment-card/appointment-card-completed/appointment-card-completed.component";
import { Router } from '@angular/router';
import { CompletedAppointmentDataService } from '../../../services/appointment-view-completed/completed-appointment-data.service';

@Component({
    selector: 'app-appointment-student-confirmed',
    standalone: true,
    templateUrl: './appointment-student-confirmed.component.html',
    styleUrl: './appointment-student-confirmed.component.css',
    imports: [AppointmentCardCompletedComponent]
})
export class AppointmentStudentConfirmedComponent {
    constructor(private router: Router, private appointmentId: CompletedAppointmentDataService){   
    }

    changeRoute() {
        const currentUrl = this.router.url
        this.router.navigate([`${currentUrl}/completed`, this.appointmentId.appointmentId]);
      }
}
