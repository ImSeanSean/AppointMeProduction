import { Component, ElementRef, ViewChild } from '@angular/core';
import { Teacher } from '../../interfaces/Teacher';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { User } from '../../interfaces/User';
import { SettingComponent } from "../setting/setting.component";
import { NgIf } from '@angular/common';
import { UserInformationService } from '../../services/user-information/user-information.service';
import { mainPort } from '../../app.component';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../navbar/navbar.component';
import { NotificationServicesService } from '../../services/notification-services.service';

@Component({
  selector: 'app-dashboard-teacher',
  standalone: true,
  templateUrl: './dashboard-teacher.component.html',
  styleUrl: './dashboard-teacher.component.css',
  imports: [NavbarComponent, RouterModule, NgIf, SettingComponent, RouterLinkActive, MatBadgeModule, MatButtonModule, MatIconModule]
})
export class DashboardTeacherComponent {
  @ViewChild('notificationBox', { static: false }) box: ElementRef | undefined;
  down: boolean = false;

  user: User[] = [];
  teacher: Teacher[] = [];
  usertype = localStorage.getItem('user');
  firstName = "";
  lastName = "";
  headteacher = false;
  unreadNotificationsCount = 0;

  constructor(private http: HttpClient, private router: Router, private userInfo: UserInformationService, private notificationService: NotificationServicesService) { }

  redirectToHomePage() {
    this.router.navigate(['']);
  }

  getUser() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log(token);
    return this.http.get<User[]>(`${mainPort}/pdo/api/get_user`, { headers });
  }
  getTeacher() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log(token);
    return this.http.get<Teacher[]>(`${mainPort}/pdo/api/get_teacher`, { headers });
  }
  ngOnInit(): void {
    this.countUnreadNotifications();
    if (this.usertype == "user") {
      this.getUser().subscribe(
        (data: User[]) => {
          this.user = data;
          this.firstName = this.user[0].FirstName;
          this.lastName = this.user[0].LastName;
        },
        (error) => {
          console.error('Error fetching teachers:', error);
        }
      );
    }
    if (this.usertype == "user") {
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
    else if (this.usertype == "teacher") {
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
    this.notificationService.unreadNotifications$.subscribe(count => {
      this.unreadNotificationsCount = count;
    });
  }

  toggleNotifi(): void {
    if (this.box) {
      const boxElement = this.box.nativeElement as HTMLElement;
      if (this.down) {
        boxElement.style.height = '0px';
        boxElement.style.opacity = '0';
        this.down = false;
      } else {
        boxElement.style.height = '510px';
        boxElement.style.opacity = '1';
        this.down = true;
      }
    }
  }

  countUnreadNotifications() {
    this.notificationService.countNotificationsTeacher();
  }
}
