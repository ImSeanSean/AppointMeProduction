export interface Notification {
    NotificationID: number,
    UserID: number,
    ConsultantID: number,
    NotificationType: string,
    NotificationReminder: string,
    NotificationName: string,
    NotificationDescription: string, 
    NotificationAt: string,
    marked: boolean,
    isActive: boolean;
}
