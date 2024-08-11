export interface Notification {
    NotificationID: number,
    UserID: number | null,
    ConsultantID: number | null,
    AppointmentID: number | null,
    NotificationType: string,
    NotificationReminder: string,
    NotificationName: string,
    NotificationDescription: string, 
    NotificationAt: string,
    marked: boolean,
    markedTeacher: boolean,
    isActive: boolean;
}
