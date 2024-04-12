import { Routes } from '@angular/router';
import { AuthguardlogregService } from './services/authguard/authguardlogreg.service';
import { LoginStudentComponent } from './student/login-student/login-student.component';
import { RegisterStudentComponent } from './student/register-student/register-student.component';
import { AppComponent } from './app.component';
import { HomepageComponent } from './homepage/homepage.component';
import { DashboardStudentComponent } from './layouts/dashboard-student/dashboard-student.component';
import { TeacherListComponent } from './student/dashboard/teacher-list/teacher-list.component';
import { ProfileStudentComponent } from './student/dashboard/profile-student/profile-student.component';

export const routes: Routes = [
    {path: '', component: HomepageComponent},
    {path: 'student',
        children: [
            {path: 'login', component: LoginStudentComponent},
            {path: 'register', component: RegisterStudentComponent},
            {path: 'dashboard', component: DashboardStudentComponent,
                children: [
                    {path: 'main', component: TeacherListComponent},
                    {path: 'profile', component: ProfileStudentComponent}
                ]
            }
        ]
    },
];
