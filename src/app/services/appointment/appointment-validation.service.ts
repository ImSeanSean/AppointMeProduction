import { Injectable } from '@angular/core';
import { Appointment } from '../../interfaces/Appointment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DaySchedule } from '../../interfaces/DaySchedule';
import { mainPort } from '../../app.component';

@Injectable({
  providedIn: 'root'
})
export class AppointmentValidationService {
  //Variables
  token = localStorage.getItem('token');
  appointments: Appointment[] = [];
  schedule: DaySchedule[] = [];
  //Constructor
  constructor(
    public http: HttpClient
  ) { }

  //Actual Validator
  //Check if Occupied
  public getMatchingDate(teacherId: string, date:string): Observable<Appointment> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    let encodedDate = btoa(date)
    return this.http.get<Appointment>(`${mainPort}/pdo/api/get_matching_schedule/${teacherId}/${encodedDate}`, { headers });
  }
  //Check if Student Already Has Appointment with the Teacher
  public hasExistingAppointment(teacherId: string): Observable<Appointment> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    return this.http.get<Appointment>(`${mainPort}/pdo/api/has_existing_appointment/${teacherId}`, { headers });
  }
  //FAILURE
  public getTeacherDayAppointments(teacherId: string, date: Date): Observable<Appointment[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    return this.http.get<Appointment[]>(`${mainPort}/pdo/api/get_day_appointments/${date}`, { headers })
  }
}
