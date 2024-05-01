import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppointmentViewServiceService {

  constructor() { }
  selectedTime: any;
  selectedDate: any;
  selectedMode: any;
  selectedUrgency: any;
  teacher: any;
}
