import { Routes } from '@angular/router';
import { AuthguardlogregService } from './services/authguard/authguardlogreg.service';
import { LoginStudentComponent } from './student/login-student/login-student.component';
import { RegisterStudentComponent } from './student/register-student/register-student.component';
import { AppComponent } from './app.component';
import { HomepageComponent } from './homepage/homepage.component';
import { DashboardStudentComponent } from './layouts/dashboard-student/dashboard-student.component';
import { TeacherListComponent } from './student/dashboard/teacher-list/teacher-list.component';
import { ProfileStudentComponent } from './student/dashboard/profile-student/profile-student.component';
import { AppointmentView1Component } from './student/dashboard/teacher-list/appointment-view/appointment-view-1/appointment-view-1.component';
import { AppointmentView2Component } from './student/dashboard/teacher-list/appointment-view/appointment-view-2/appointment-view-2.component';
import { AppointmentStudentComponent } from './student/dashboard/appointment-student/appointment-student.component';
import { TeacherLoginComponent } from './teacher/teacher-login/teacher-login.component';
import { DashboardTeacherComponent } from './layouts/dashboard-teacher/dashboard-teacher.component';

export const routes: Routes = [
    {path: '', component: HomepageComponent},
    {path: 'student',
        children: [
            {path: 'login', component: LoginStudentComponent},
            {path: 'register', component: RegisterStudentComponent},
            {path: 'dashboard', component: DashboardStudentComponent,
                children: [
                    {path: 'main', component: TeacherListComponent},
                    {path: 'appointment-view/:teacherId', component: AppointmentView1Component},
                    {path: 'appointment-view-2/:teacherId',component: AppointmentView2Component},
                    {path: 'appointments', component: AppointmentStudentComponent},
                    {path: 'profile', component: ProfileStudentComponent}
                ]
            }
        ]
    },
    {path: 'teacher',
        children: [
            {path: 'login', component: TeacherLoginComponent},
            // {path: 'register'},
            {path: 'dashboard', component: DashboardTeacherComponent,
                children: [
                    {path: 'appointments', component: AppointmentStudentComponent},
                    {path: 'profile', component: ProfileStudentComponent}
                ]
            }
            // {path: 'dashboard'}
        ]
    }
];
