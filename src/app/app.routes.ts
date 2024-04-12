import { Routes } from '@angular/router';
import { AuthguardlogregService } from './services/authguard/authguardlogreg.service';
import { LoginStudentComponent } from './student/login-student/login-student.component';
import { RegisterStudentComponent } from './student/register-student/register-student.component';
import { AppComponent } from './app.component';
import { HomepageComponent } from './homepage/homepage.component';

export const routes: Routes = [
    {path: '', component: HomepageComponent},
    {path: 'student',
        children: [
            {path: 'login', component: LoginStudentComponent},
            {path: 'register', component: RegisterStudentComponent}
        ]
    },
];
