import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { User } from '../../interfaces/User';
import { Teacher } from '../../interfaces/Teacher';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SettingComponent } from "../setting/setting.component";
import { mainPort } from '../../app.component';
import { ProfileServiceService } from '../../services/ProfileService/profile-service.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { NotificationServicesService } from '../../services/notification-services.service';
import { Notification } from '../../interfaces/Notification';

@Component({
  selector: 'app-dashboard-student',
  standalone: true,
  templateUrl: './dashboard-student.component.html',
  styleUrl: './dashboard-student.component.css',
  imports: [NavbarComponent, RouterModule, NgIf, SettingComponent, RouterLinkActive, MatBadgeModule, MatButtonModule, MatIconModule, NgFor]
})
export class DashboardStudentComponent {
  @ViewChild('notificationBox', { static: false }) box: ElementRef | undefined;
  down: boolean = false;

  constructor(private http: HttpClient, private router: Router, private profileService: ProfileServiceService, private notificationService: NotificationServicesService) { }

  user: User[] = [];
  teacher: Teacher[] = [];
  usertype = localStorage.getItem('user');
  firstName = "";
  lastName = "";
  unreadNotificationsCount = 0;
  notifications: Notification[] = [];

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
          console.log(this.user);
          console.log(localStorage.getItem('user'))
          //Save to Service
          this.profileService.updateProfile(this.user[0]);
          //Get Notifications
          const token = localStorage.getItem('token');
          const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
          this.http.get<Notification[]>(`${mainPort}/pdo/api/get_notifications_student`, {headers}).subscribe(notifications=>{
            this.notifications = notifications
            console.log(notifications)
          }) 
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
          console.log(this.user);
          console.log("what")
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

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe(result => {
      if (result == true){
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        this.http.get<Notification[]>(`${mainPort}/pdo/api/get_notifications_student`, {headers}).subscribe(notifications=>{
          this.notifications = notifications
        }) 
      } else {

      }
    });
  }

  navigateToAppointment(appointmentId: any): void{
    console.log(appointmentId)
    if(appointmentId == null){
      return
    }
    if(this.usertype == "user"){
      this.router.navigate([`student/dashboard/appointment/${appointmentId}`])
    }
    if(this.usertype == "teacher"){
      this.router.navigate([`teacher/dashboard/appointment/${appointmentId}`])
    }
  }

  countUnreadNotifications() {
    this.notificationService.countNotifications();
  }
}
