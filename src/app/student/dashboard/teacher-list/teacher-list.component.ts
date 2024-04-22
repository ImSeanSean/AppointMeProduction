import { Component } from '@angular/core';
import { DashboardStudentComponent } from "../../../layouts/dashboard-student/dashboard-student.component";
import { Teacher } from '../../../interfaces/Teacher';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeacherCardComponent } from "../../../components/teacher-card/teacher-card.component";

@Component({
    selector: 'app-teacher-list',
    standalone: true,
    templateUrl: './teacher-list.component.html',
    styleUrl: './teacher-list.component.css',
    imports: [DashboardStudentComponent, TeacherCardComponent]
})
export class TeacherListComponent {

}
