import { Component } from '@angular/core';
import { Teacher } from '../../interfaces/Teacher';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { User } from '../../interfaces/User';
import { SettingComponent } from "../setting/setting.component";

@Component({
    selector: 'app-dashboard-teacher',
    standalone: true,
    templateUrl: './dashboard-teacher.component.html',
    styleUrl: './dashboard-teacher.component.css',
    imports: [SettingComponent, RouterModule]
})
export class DashboardTeacherComponent {
  user: User[] = [];
  teacher: Teacher[] = [];
  usertype = localStorage.getItem('user');
  firstName = "";
  lastName = "";

  constructor(private http: HttpClient, private router: Router) {}

  redirectToHomePage(){
    this.router.navigate(['']);
  }

  getUser() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log(token);
    return this.http.get<User[]>('http://localhost/appointme/pdo/api/get_user', { headers });
  }
  getTeacher(){
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log(token);
    return this.http.get<Teacher[]>('http://localhost/appointme/pdo/api/get_teacher', { headers });
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
          console.log(this.user);
          console.log("what")
        },
        (error) => {
          console.error('Error fetching teachers:', error);
        }
      );
    }
  }
}
