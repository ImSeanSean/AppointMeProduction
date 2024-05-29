import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mainPort } from '../../../app.component';
import { Notification } from '../../../interfaces/Notification';
import { NotificationServicesService } from '../../../services/notification-services.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-notification-teacher',
  standalone: true,
  imports: [NgClass, NgIf, NgFor],
  templateUrl: './notification-teacher.component.html',
  styleUrl: './notification-teacher.component.css',
  animations: [
    trigger('descriptionToggle', [
      state('hidden', style({
        height: '0px',
        overflow: 'hidden',
        padding: '0 20px'
      })),
      state('visible', style({
        height: '*',
        'border-top': '1px solid black',
        overflow: 'hidden',
        padding: '20px'
      })),
      transition('hidden <=> visible', [
        animate('0.3s ease-in-out')
      ])
    ])
  ]
})
export class NotificationTeacherComponent implements OnInit{
  constructor(
    private http: HttpClient,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private notificationService: NotificationServicesService
  ){}
  isActive = false;
  notifications: Notification[] = [];

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<Notification[]>(`${mainPort}/pdo/api/get_notifications_teacher`, {headers}).subscribe(notifications=>{
      this.notifications = notifications.map(notification => ({ ...notification, isActive: false }));
    })  
  }

  toggleActive(notification: Notification) {
    notification.isActive = !notification.isActive;
  }

  formatDate(date: string){
    const formattedDate = this.datePipe.transform(date, 'MM/dd/yyyy | hh:mm a');
    return formattedDate ? formattedDate : '';
  } 

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe(result => {
      if (result == true){
        window.location.reload()
        this._snackBar.open("Marked as read.", "Confirm");
      } else {
        this._snackBar.open("Already marked as read.", "Confirm");
      }
    });
  }
}
