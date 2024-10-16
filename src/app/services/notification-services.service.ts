import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { mainPort } from '../app.component';
import { Notification } from '../interfaces/Notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationServicesService {
  constructor(private http: HttpClient) {}

  private unreadNotificationsSubject = new BehaviorSubject<number>(0);
  unreadNotifications$ = this.unreadNotificationsSubject.asObservable();

  countNotifications(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<Notification[]>(`${mainPort}/pdo/api/get_notifications_student`, {headers}).subscribe(notifications => {
      let unreadCount = 0;
      for (let notification of notifications) {
        if (!notification.marked) {
          unreadCount++;
        }
      }
      this.unreadNotificationsSubject.next(unreadCount);
    });  
  }

  countNotificationsTeacher(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<Notification[]>(`${mainPort}/pdo/api/get_notifications_teacher`, {headers}).subscribe(notifications => {
      let unreadCount = 0;
      for (let notification of notifications) {
        if (!notification.markedTeacher) {
          unreadCount++;
        }
      }
      this.unreadNotificationsSubject.next(unreadCount);
    });  
  }

  markAsRead(notificationId: number): Observable<any> {
    this.countNotifications();
    return this.http.post<any>(`${mainPort}/pdo/api/mark_notification`, notificationId);
  }

  deleteNotification(notificationId: number){
    return this.http.post(`${mainPort}/pdo/api/delete_notification`, notificationId);
  }

  createNotification(teacherid:number | null, userid:number | null, appointmentid:number | null, type:string, title:string, description:string){
    const data = {
      TeacherId: teacherid,
      UserId: userid,
      AppointmentId: appointmentid,
      Type: type,
      Title: title,
      Description: description
    }
      this.http.post(`${mainPort}/pdo/api/create_notification`, data).subscribe(result=>{
        return result;
      })
  }
}
