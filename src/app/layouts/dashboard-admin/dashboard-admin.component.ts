import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { mainPort } from '../../app.component';
import { Teacher } from '../../interfaces/Teacher';
import { User } from '../../interfaces/User';
import { NotificationServicesService } from '../../services/notification-services.service';
import { ProfileServiceService } from '../../services/ProfileService/profile-service.service';
import { SettingComponent } from "../setting/setting.component";
import { MatBadge } from '@angular/material/badge';

@Component({
    selector: 'app-dashboard-admin',
    standalone: true,
    templateUrl: './dashboard-admin.component.html',
    styleUrl: './dashboard-admin.component.css',
    imports: [SettingComponent, MatBadge, RouterModule]
})
export class DashboardAdminComponent {
  constructor(private http: HttpClient, private router: Router, private profileService: ProfileServiceService, private notificationService: NotificationServicesService) {}

  user: User[] = [];
  teacher: Teacher[] = [];
  usertype = localStorage.getItem('user');
  firstName = "";
  lastName = "";
  unreadNotificationsCount = 0;

  redirectToHomePage(){
    this.router.navigate(['']);
  }
  ngOnInit(): void {
    this.countUnreadNotifications();
    this.notificationService.unreadNotifications$.subscribe(count => {
      this.unreadNotificationsCount = count;
    });
  }

  countUnreadNotifications() {
    this.notificationService.countNotifications(); 
  }
}
