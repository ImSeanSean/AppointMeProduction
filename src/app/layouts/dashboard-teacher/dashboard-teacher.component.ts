import { Component } from '@angular/core';
import { Teacher } from '../../interfaces/Teacher';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { User } from '../../interfaces/User';
import { SettingComponent } from "../setting/setting.component";
import { NgIf } from '@angular/common';
import { UserInformationService } from '../../services/user-information/user-information.service';
import { mainPort } from '../../app.component';

@Component({
    selector: 'app-dashboard-teacher',
    standalone: true,
    templateUrl: './dashboard-teacher.component.html',
    styleUrl: './dashboard-teacher.component.css',
    imports: [SettingComponent, RouterModule, NgIf]
})
export class DashboardTeacherComponent {
  user: User[] = [];
  teacher: Teacher[] = [];
  usertype = localStorage.getItem('user');
  firstName = "";
  lastName = "";
  headteacher = false;

  constructor(private http: HttpClient, private router: Router, private userInfo: UserInformationService) {}

  redirectToHomePage(){
    this.router.navigate(['']);
  }

  getUser() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log(token);
    return this.http.get<User[]>(`${mainPort}/appointme/pdo/api/get_user`, { headers });
  }
  getTeacher(){
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log(token);
    return this.http.get<Teacher[]>(`${mainPort}/appointme/pdo/api/get_teacher`, { headers });
  }
  ngOnInit(): void {
    if(this.usertype == "user"){
      this.getUser().subscribe(
        (data: User[]) => {
          this.user = data;
          this.firstName = this.user[0].FirstName; 
          this.lastName = this.user[0].LastName; 
          console.log(this.user);
          console.log(localStorage.getItem('user'))
        },
        (error) => {
          console.error('Error fetching teachers:', error);
        }
      );
    }
    else if(this.usertype == "teacher"){
      this.getTeacher().subscribe(
        (data: Teacher[]) => {
          this.teacher = data;
          this.firstName = this.teacher[0].first_name; 
          this.lastName = this.teacher[0].last_name;
          this.headteacher = this.teacher[0].headteacher;
          this.userInfo.userId = this.teacher[0].ConsultantID;
          console.log(this.teacher);
        },
        (error) => {
          console.error('Error fetching teachers:', error);
        }
      );
    }
  }
}
