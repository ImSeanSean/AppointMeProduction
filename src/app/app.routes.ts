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
import { AppointmentViewComponent } from './components/appointment-view/appointment-view.component';
import { AppointmentViewConfirmedComponent } from './components/appointment-view-confirmed/appointment-view-confirmed.component';
import { TeacherRegistrationApprovalComponent } from './teacher/headteacher/dashboard/teacher-registration-approval/teacher-registration-approval.component';
import { TeacherRegisterComponent } from './teacher/teacher-register/teacher-register.component';
import { AppointmentStudentConfirmedComponent } from './student/dashboard/appointment-student-confirmed/appointment-student-confirmed.component';
import { AppointmentViewFinishedComponent } from './components/appointment-view-finished/appointment-view-finished.component';
import { TeacherScheduleComponent } from './teacher/teacher-schedule/teacher-schedule.component';
import { TeacherAnalyticsComponent } from './teacher/teacher-analytics/teacher-analytics.component';
import { UserManagementComponent } from './admin/user-management/user-management.component';

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
                    {path: 'appointments/pending/:appointmentId', component: AppointmentViewComponent},
                    {path: 'appointments/confirmed/:appointmentId', component: AppointmentViewConfirmedComponent},
                    {path: 'confirmed-appointments', component: AppointmentStudentConfirmedComponent},
                    {path: 'confirmed-appointments/completed/:appointmentId', component: AppointmentViewFinishedComponent},
                    {path: 'profile', component: ProfileStudentComponent},
                    {path: 'admin', component: UserManagementComponent}
                ]
            }
        ]
    },
    {path: 'teacher',
        children: [
            {path: 'login', component: TeacherLoginComponent},
            {path: 'register', component: TeacherRegisterComponent},
            {path: 'dashboard', component: DashboardTeacherComponent,
                children: [
                    {path: 'appointments', component: AppointmentStudentComponent},
                    {path: 'appointments/pending/:appointmentId', component: AppointmentViewComponent},
                    {path: 'appointments/confirmed/:appointmentId', component: AppointmentViewConfirmedComponent},
                    {path: 'confirmed-appointments', component: AppointmentStudentConfirmedComponent},
                    {path: 'confirmed-appointments/completed/:appointmentId', component: AppointmentViewFinishedComponent},
                    {path: 'schedule', component: TeacherScheduleComponent},
                    {path: 'analytics', component: TeacherAnalyticsComponent},
                    {path: 'profile', component: ProfileStudentComponent},
                    {path: 'headteacher', 
                        children: [
                            {path: 'teacher-registration', component: TeacherRegistrationApprovalComponent}
                        ]
                    }
                ]
            }
        ]
    }
];
