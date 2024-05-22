import { Injectable } from '@angular/core';
import { Appointment } from '../../interfaces/Appointment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DaySchedule } from '../../interfaces/DaySchedule';
import { mainPort } from '../../app.component';

@Injectable({
  providedIn: 'root'
})
export class AppointmentValidationService {
  //Variables
  appointments: Appointment[] = [];
  schedule: DaySchedule[] = [];
  //Constructor
  constructor(
    public http: HttpClient
  ) { }

  //Check if Schedules are available for a specific day
  public getTeacherDayAppointments(teacherId: string, date: Date): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${mainPort}/appointme/pdo/api/get_day_appointments/${teacherId}/${date}`)
  }
  public getDaySchedule(teacherId:string, day: number){
    return this.http.get<DaySchedule[]>(`${mainPort}/appointme/pdo/api/get_day_schedule_student/${teacherId}/${day}`)
  }
  public findOccupiedSchedules(teacherId: string, date: Date){
    //Get Appoinments for that Day
    this.getTeacherDayAppointments(teacherId, date).subscribe(result=>{
      this.appointments = result;
    })
    //Get Schedules for that Day
    const day = date.getDay()
    this.getDaySchedule(teacherId, day).subscribe(result=>{
      this.schedule = result;
    })
    //Compare Schedule and Appointments
  }
}
