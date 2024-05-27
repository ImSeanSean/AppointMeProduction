import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { Router, RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';
import { User } from '../../interfaces/User';
import { Teacher } from '../../interfaces/Teacher';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SettingComponent } from "../setting/setting.component";
import { mainPort } from '../../app.component';
import { ProfileServiceService } from '../../services/ProfileService/profile-service.service';

@Component({
    selector: 'app-dashboard-student',
    standalone: true,
    templateUrl: './dashboard-student.component.html',
    styleUrl: './dashboard-student.component.css',
    imports: [NavbarComponent, RouterModule, NgIf, SettingComponent]
})
export class DashboardStudentComponent {
  user: User[] = [];
  teacher: Teacher[] = [];
  usertype = localStorage.getItem('user');
  firstName = "";
  lastName = "";

  constructor(private http: HttpClient, private router: Router, private profileService: ProfileServiceService) {}

  redirectToHomePage(){
    this.router.navigate(['']);
  }

  getUser() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log(token);
    return this.http.get<User[]>(`${mainPort}/pdo/api/get_user`, { headers });
  }
  getTeacher(){
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log(token);
    return this.http.get<Teacher[]>(`${mainPort}/pdo/api/get_teacher`, { headers });
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
          //Save to Service
          this.profileService.updateProfile(this.user[0]);
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
