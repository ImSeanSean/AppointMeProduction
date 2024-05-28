import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Notification } from '../../../interfaces/Notification';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { mainPort } from '../../../app.component';
import { MatDialog } from '@angular/material/dialog';
import { ErrorComponent } from '../../../matdialogs/error/error.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import { NotificationServicesService } from '../../../services/notification-services.service';

@Component({
  selector: 'app-notification-tab',
  standalone: true,
  imports: [NgClass, NgFor, NgIf],
  templateUrl: './notification-tab.component.html',
  styleUrl: './notification-tab.component.css',
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
export class NotificationTabComponent implements OnInit{
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
    this.http.get<Notification[]>(`${mainPort}/pdo/api/get_notifications_student`, {headers}).subscribe(notifications=>{
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

  createNotification(teacherid:number, userid:number, type:string, title:string, description:string){
    const data = {
      TeacherId: teacherid,
      UserId: userid,
      Type: type,
      Title: title,
      Description: description
    }
      this.http.post(`${mainPort}/pdo/api/create_notification`, data).subscribe(result=>{
        return result;
      })
  }
}

