import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Appointment } from '../../interfaces/Appointment';
import { DatePipe, NgClass, NgFor, formatDate } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { mainPort } from '../../app.component';
import { Chart, ChartOptions, Filler } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-teacher-analytics',
    standalone: true,
    templateUrl: './teacher-analytics.component.html',
    styleUrl: './teacher-analytics.component.css',
    imports: [NgFor, NgClass, BaseChartDirective, FormsModule]
})
export class TeacherAnalyticsComponent implements OnInit{
  constructor(private http: HttpClient, private router: Router,private datePipe: DatePipe) {

  };
  //Variables
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  appointments: Appointment[] = [];
  usertype = localStorage.getItem('user');
  selectedDay = this.datePipe.transform(new Date(), 'EEEE');
  selectedDate = this.datePipe.transform(new Date(), 'MMMM dd, yyyy');

  //Analytics Data
  getPending(): number {
    return this.appointments.filter(appointment => appointment.Status === 0).length;
  }
  getConfirmed(): number {
    return this.appointments.filter(appointment => appointment.Status === 1 && appointment.Completed === 0).length;
  }
  getCompleted(): number{
    return this.appointments.length;
  }
  getAppointmentsThisWeek(): number {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)); 
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 7)); 

    return this.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.AppointmentDate);
      return appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
    }).length;
  }
  //Get Day
  private getStartAndEndOfWeek(): { startOfWeek: Date, endOfWeek: Date } {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); 
    startOfWeek.setHours(0, 0, 0, 0); 

    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() - now.getDay() + 7); 
    endOfWeek.setHours(23, 59, 59, 999);

    return { startOfWeek, endOfWeek };
  }
  getAppointmentsForDayOfWeek(day: number): number {
    const { startOfWeek } = this.getStartAndEndOfWeek();
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + day);
    const formattedDate = this.datePipe.transform(date, 'yyyy-MM-dd');
  
    return this.appointments.filter(appointment => {
      const appointmentDate = this.datePipe.transform(appointment.AppointmentDate, 'yyyy-MM-dd');
      return appointmentDate === formattedDate;
    }).length;
  }
  getRating(): number {
    let totalRating = 0;
    let appointmentCount = 0;
  
    this.appointments.forEach(appointment => {
      if (appointment.rating !== undefined && appointment.rating !== null) {
        totalRating += appointment.rating;
        appointmentCount++;
      }
    });
  
    if (appointmentCount === 0) {
      return 0; 
    }
  
    const averageRating = totalRating / appointmentCount;
    return parseFloat(averageRating.toFixed(2)); 
  }
  getRatingForWeek(): number {
    const { startOfWeek, endOfWeek } = this.getStartAndEndOfWeek();
    let totalRating = 0;
    let appointmentCount = 0;
  
    this.appointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.AppointmentDate);
      if (appointment.rating !== undefined && appointment.rating !== null &&
          appointmentDate >= startOfWeek && appointmentDate <= endOfWeek) {
        totalRating += appointment.rating;
        appointmentCount++;
      }
    });
  
    if (appointmentCount === 0) {
      return 0; 
    }
  
    const averageRating = totalRating / appointmentCount;
    return parseFloat(averageRating.toFixed(2)); 
  }
  //Appointment Card Functions
  changeRoute(id:string, completed:boolean, status:boolean) {
    if(status == false){
      this.router.navigate([`/teacher/dashboard/appointments/pending`, id]);
    }
    else if(status == true && completed == false){
      this.router.navigate([`/teacher/dashboard/appointments/confirmed`, id]);
    }
    else if(status == true && completed == true){
      this.router.navigate([`/teacher/dashboard/appointments/completed`, id]);
    }     
  }

  getAppointment(): Observable<Appointment[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log(token);
    return this.http.get<Appointment[]>(`${mainPort}/pdo/api/get_appointments`, { headers });
  }

  getAppointmentTeacher(): Observable<Appointment[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log(token);
    return this.http.get<Appointment[]>(`${mainPort}/pdo/api/get_appointments_teacher`, { headers });
  }

  filterAppointments(appointments: any[]): any[] {
    return appointments.filter(appointment => this.datePipe.transform(appointment.AppointmentDate, 'MMMM dd, yyyy') == this.selectedDate);
  }


  getFormattedDate(date:string){
    const datePipe = new DatePipe('en-US');
    return datePipe.transform(date, 'MMMM dd, yyyy')
  }

  getFormattedTime(date:string){
    const datePipe = new DatePipe('en-US');
    const time = datePipe.transform(date, 'MMMM dd, yyyy HH:mm')
    return datePipe.transform(time, 'shortTime')
  }

  changeDay(day: number){
    this.selectedDate = this.getDateForDayOfWeek(day+1)
    this.selectedDay = this.getDayName(day)
  }

  getDayName(dayOfWeek: number): string {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (dayOfWeek >= 0 && dayOfWeek <= 5) {
        return days[dayOfWeek];
    } else {
        return 'Invalid Day';
    }
  }

  getDateForDayOfWeek(dayOfWeek: number): string {
    const now = new Date();
    const currentDayOfWeek = now.getDay();
    const diff = dayOfWeek - currentDayOfWeek;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);

    const formattedDate = this.datePipe.transform(targetDate, 'MMMM dd, yyyy');
    return formattedDate || '';
}
//Charts
//Daily
ratingsDaily: any[] = [];
ratingDates: any[] = [];
ratingValues: any[] = [];
//Chart Functions
getRatingsDaily(){
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<Appointment[]>(`${mainPort}/pdo/api/get_ratings`, { headers });
}
//Weekly
ratingsWeekly: any[] = [];
ratingWeeklyDates: any[] = [];
ratingWeeklyValues: any[] = [];
getRatingsWeekly(){
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<Appointment[]>(`${mainPort}/pdo/api/get_ratings_weekly`, { headers });
}
//Monthly
ratingsMonthly: any[] = [];
ratingMonthlyDates: any[] = [];
ratingMonthlyValues: any[] = [];
getRatingsMonthly(){
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<Appointment[]>(`${mainPort}/pdo/api/get_ratings_monthly`, { headers });
}
//Functions
mapRatingsDaily(){
  this.getRatingsDaily().subscribe((result: Appointment[]) =>{
    this.ratingsDaily = result.map(appointment => ({
      consultantId: appointment.ConsultantID,
      date: this.convertToZeroHourDate(appointment.AppointmentDate),
      rating: appointment.rating
    }));
    this.updateRating(this.ratingsDaily);
  })
}
mapRatingsWeekly(){
  this.getRatingsWeekly().subscribe((result: Appointment[]) => {
    this.ratingsWeekly = result.map(appointment => ({
      consultantId: appointment.ConsultantID,
      date: this.convertToZeroHourDate(appointment.AppointmentDate),
      rating: appointment.rating
    }))
  })
  this.updateRating(this.ratingsWeekly)
}
mapRatingsMonthly(){
  this.getRatingsMonthly().subscribe((result: Appointment[]) => {
    this.ratingsMonthly = result.map(appointment => ({
      consultantId: appointment.ConsultantID,
      date: appointment.AppointmentDate,
      rating: appointment.rating
    }))
  })
  this.updateRatingMonthly(this.ratingsMonthly)
}
//Additional Functions
convertToZeroHourDate(dateString: string): Date {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0); 
  return date;
}
//Functions for Applying the Data to the Charts
updateRating(rating: any[]){
  const dates = rating.map(rating => formatDate(rating.date, 'shortDate', 'en-US'));
  const ratings = rating.map(rating => rating.rating);

  // Update the ratingDataDaily object
  this.ratingData.labels = dates;
  this.ratingData.datasets[0].data = ratings;

  if (this.chart) {
    this.chart.update();
  }
}
updateRatingMonthly(rating: any[]){
  const dates = rating.map(rating => rating.date);
  const ratings = rating.map(rating => rating.rating);

  // Update the ratingDataDaily object
  this.ratingData.labels = dates;
  this.ratingData.datasets[0].data = ratings;

  if (this.chart) {
    this.chart.update();
  }
}
//Chart Variables
//Ratings
ratingMode = "Daily"
ratingData = {
  labels: ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"],
  datasets: [
    {
      data: [1, 2, 3, 4, 5, 6],
      label: 'Ratings',
      fill: true
    }
  ],
};
ratingOptions = {
  responsive: true,
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

//Rating Percentage
rating5 = 0;
rating4 = 0;
rating3 = 0;
rating2 = 0;
rating1 = 0;
unrated = 0;

appointmentTotal = 0;
ratedTotal = 0;
rating5Percentage = 0;
rating4Percentage = 0;
rating3Percentage = 0;
rating2Percentage = 0;
rating1Percentage = 0;

countRatings(){
  this.appointments.forEach(appointment => {
    if(appointment.rating == 5){
      this.rating5++
    }
    else if(appointment.rating == 4){
      this.rating4++
    }
    else if(appointment.rating == 3){
      this.rating3++
    }
    else if(appointment.rating == 2){
      this.rating2++
    }
    else if(appointment.rating == 1){
      this.rating1++
    }
    else if(appointment.rating == null){
      this.unrated++
    }
  });

  this.ratedTotal = this.rating5 + this.rating4 + this.rating3 + this.rating2 + this.rating1;
  this.appointmentTotal = this.appointments.length;

  this.rating5Percentage = parseFloat((this.rating5 / this.ratedTotal * 100).toFixed(2));
  this.rating4Percentage = parseFloat((this.rating4 / this.ratedTotal * 100).toFixed(2));
  this.rating3Percentage = parseFloat((this.rating3 / this.ratedTotal * 100).toFixed(2));
  this.rating2Percentage = parseFloat((this.rating2 / this.ratedTotal * 100).toFixed(2));
  this.rating1Percentage = parseFloat((this.rating1 / this.ratedTotal * 100).toFixed(2));
}
//Appointment Analytics
lineChartData = {
  labels: ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"],
  datasets: [
    {
      data: [1, 2, 3, 4, 5, 6],
      label: 'Ratings',
      fill: true
    }
  ],
  options: {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Average Rating'
        },
        beginAtZero: true
      }
    }
  }
}

  ngOnInit(): void {
    if(this.usertype == "user"){
      this.getAppointment().subscribe(
        (data: Appointment[]) => {
          this.appointments = data;
        },
        (error) => {
          console.error('Error fetching appointments:', error);
        }
      );
    }
    if(this.usertype == "teacher"){
      this.getAppointmentTeacher().subscribe(
        (data: Appointment[]) => {
          this.appointments = data;
          this.countRatings();
        },
        (error) => {
          console.error('Error fetching appointments:', error);
        }
      );
    }
    this.mapRatingsDaily()
    this.mapRatingsWeekly()
    this.mapRatingsMonthly()
  }
}
