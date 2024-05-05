import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Appointment } from '../../interfaces/Appointment';

@Injectable({
  providedIn: 'root'
})
export class CompletedAppointmentDataService {
  private _appointmentId: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
  public appointmentId$: Observable<number | null> = this._appointmentId.asObservable();

  setAppointmentId(appointmentId: number | null): void {
    this._appointmentId.next(appointmentId);
  }
}