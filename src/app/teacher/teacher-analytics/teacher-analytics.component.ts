import { AfterViewInit, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Appointment } from '../../interfaces/Appointment';
import { DatePipe, NgClass, NgFor, formatDate } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { mainPort } from '../../app.component';
import { BaseChartDirective } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { Queue } from '../../interfaces/Queue';
import html2canvas from 'html2canvas'; // Import html2canvas
import jsPDF from 'jspdf'; // Import jsPDF

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
  @ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective> | undefined;
  appointments: Appointment[] = [];
  usertype = localStorage.getItem('user');
  selectedDay = this.datePipe.transform(new Date(), 'EEEE');
  selectedDate = this.datePipe.transform(new Date(), 'MMMM dd, yyyy');
  queue: Queue[] = [];
  pending = 0;
  confirmed = 0;
  completed = 0;

  //Analytics Data
  getPending(): number {
    return this.queue.length;
  }
  getConfirmed(): number {
    return this.appointments.filter(appointment => appointment.Completed === 0).length;
  }
  getCompleted(): number{
    return this.appointments.filter(appointment => appointment.Completed === 1).length;
  }
  getAppointmentTypes(){
    this.pending = this.queue.length
    this.confirmed = this.appointments.filter(appointment => appointment.Completed === 0).length;
    this.completed = this.appointments.filter(appointment => appointment.Completed === 1).length;
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
      const ratings = [appointment.rating, appointment.rating2, appointment.rating3, appointment.rating4];
      const validRatings = ratings.filter(rating => rating !== undefined && rating !== null);
  
      if (validRatings.length > 0) {
        const average = validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
        totalRating += average;
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
    const ratings = [appointment.rating, appointment.rating2, appointment.rating3, appointment.rating4];
    const validRatings = ratings.filter(rating => rating !== undefined && rating !== null);

    if (validRatings.length > 0 && appointmentDate >= startOfWeek && appointmentDate <= endOfWeek) {
      const average = validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
      totalRating += average;
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
    else if(completed == false){
      this.router.navigate([`/teacher/dashboard/appointments/confirmed`, id]);
    }
    else if(completed == true){
      this.router.navigate([`/teacher/dashboard/appointments/completed`, id]);
    }     
  }

  getAppointment(): Observable<Appointment[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Appointment[]>(`${mainPort}/pdo/api/get_appointments`, { headers });
  }

  getAppointmentTeacher(): Observable<Appointment[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Appointment[]>(`${mainPort}/pdo/api/get_appointments_teacher`, { headers });
  }

  getQueue(): Observable<Queue[]> {
    const token = localStorage.getItem('token');
    const teacherId = localStorage.getItem('id');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);  
    return this.http.get<Queue[]>(`${mainPort}/pdo/api/get_queue_teacher/${teacherId}`, { headers });
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
      date: appointment.AppointmentDate,
      rating: appointment.rating
    }))
  })

  this.updateRatingMonthly(this.ratingsWeekly)
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

  if (this.charts) {
    this.charts.forEach((child) => {
      child.chart?.update()
  });
  }
}
updateRatingMonthly(rating: any[]){
  const dates = rating.map(rating => rating.date);
  const ratings = rating.map(rating => rating.rating);

  // Update the ratingDataDaily object
  this.ratingData.labels = dates;
  this.ratingData.datasets[0].data = ratings;

  if (this.charts) {
    this.charts.forEach((child) => {
      child.chart?.update()
  });
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
appointmentMode = "Daily"
barChartData = {
  labels: ["Confirmed", "Completed"],
  datasets: [
    {
      data: [2, 4, 6],
      label: 'Confirmed',
      fill: true,
      backgroundColor: '#FAA44E'
    },
    {
      data: [2, 4, 6],
      label: 'Completed',
      fill: true,
      backgroundColor: '#519E50'
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

appointmentPieChartData = {
  labels: ["Queue", "Confirmed", "Completed"],
  datasets: [
    {
      data: [1, 1, 1], // Initialize with zeroes
      label: 'Appointments',
      backgroundColor: ['#ABABAB', '#FAA44E', '#519E50'],
    }
  ]
};
//Appointment Analytics Functions
mapAppointmentPieChart(){
  let appointments = [this.getPending(), this.getConfirmed(), this.getCompleted()]
  this.appointmentPieChartData.datasets[0].data = appointments;
   
  if (this.charts) {
    this.charts.forEach((child) => {
      child.chart?.update()
  });
  }
}
//Get and Map Daily Appointments
getAppointmentDaily(): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get(`${mainPort}/pdo/api/get_appointments_daily`, { headers });
}

getAppoinmentWeekly(): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get(`${mainPort}/pdo/api/get_appointments_weekly`, { headers });
}

getAppoinmentMonthly(): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get(`${mainPort}/pdo/api/get_appointments_monthly`, { headers });
}

mapAppointmentBarChartDaily() {
  this.getAppointmentDaily().subscribe(result => {
    const appointments = result;
    this.updateAppointmentBarChart(appointments)
  }, error => {
    console.error('Error fetching daily appointments:', error);
  });
}

mapAppointmentBarChartWeekly() {
  this.getAppoinmentWeekly().subscribe(result => {
    const appointments = result;
    this.updateAppointmentBarChart(appointments)
  }, error => {
    console.error('Error fetching daily appointments:', error);
  });
}

mapAppointmentBarChartMonthly() {
  this.getAppoinmentMonthly().subscribe(result => {
    const appointments = result;
    this.updateAppointmentBarChart(appointments)
  }, error => {
    console.error('Error fetching daily appointments:', error);
  });
}

updateAppointmentBarChart(appointments: any[]){
  // Process the appointments to map them to the chart datasets
  const labels = appointments.map((appointment: any) => appointment.AppointmentDay);
  const completedCounts = appointments.map((appointment: any) => appointment.CompletedCount);
  const confirmedCounts = appointments.map((appointment: any) => appointment.ConfirmedCount);
  const pendingCounts = appointments.map((appointment: any) => appointment.PendingCount);

  // Update the ratingDataDaily object
  this.barChartData.labels = labels;
  this.barChartData.datasets[0].data = confirmedCounts;
  this.barChartData.datasets[1].data = completedCounts;

  if (this.charts) {
    this.charts.forEach((child) => {
      child.chart?.update()
  });
  }
}
analytics_overviewPdf() {
  const element = document.querySelector('.content'); // You can target a specific div if needed, e.g., document.getElementById('content')
  
  // Use html2canvas to capture the current view
  html2canvas(element as HTMLElement).then((canvas: { toDataURL: (arg0: string) => any; height: number; width: number; }) => {
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('l', 'mm', 'a4'); 
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
    pdf.save('analytics_overview.pdf'); 
  });
}

performance_analyticsPdf() {
  const element = document.querySelector(".two-column");
  // Use html2canvas to capture the current view
  html2canvas(element as HTMLElement).then((canvas: { toDataURL: (arg0: string) => any; height: number; width: number; }) => {
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('l', 'mm', 'a4'); 
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
    pdf.save('performance_analytics.pdf'); 
  });
}

appointment_analyticsPdf() {
  const element = document.querySelector('body > app-root > app-dashboard-teacher > div > div.main > app-teacher-analytics > div > div:nth-child(6) > div');
  
  html2canvas(element as HTMLElement).then((canvas: { toDataURL: (arg0: string) => any; height: number; width: number; }) => {
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('l', 'mm', 'a4');
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Force image to cover the full page, even if it distorts the aspect ratio
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
    
    pdf.save('appointment_analytics.pdf'); 
  });
}

generatePdfall() {
  // Select all content sections (you can use any specific class or element)
  const elements = document.querySelectorAll('.content'); // Adjust the selector if needed

  const pdf = new jsPDF('p', 'mm', 'a4'); // Create new PDF, portrait, A4 size
  const pageHeight = 295; // A4 page height in mm
  const imgWidth = 190; // Image width in mm
  let position = 0; // Starting Y position for the first image

  // Convert each section to canvas one by one
  let promises = Array.from(elements).map(element => {
    return html2canvas(element as HTMLElement, { scale: 2 });
  });

  Promise.all(promises).then(canvases => {
    canvases.forEach((canvas, index) => {
      const imgData = canvas.toDataURL('image/png'); // Convert canvas to image data
      const imgHeight = canvas.height * imgWidth / canvas.width; // Maintain aspect ratio

      if (position + imgHeight > pageHeight) {
        pdf.addPage(); // Add new page if the current page doesn't fit
        position = 0; // Reset position to top of the new page
      }

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight); // Add image to PDF
      position += imgHeight; // Update Y position for next image
    });

    // Download the generated PDF
    pdf.save('teacher-analytics.pdf');
  });
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

          this.getQueue().subscribe((data: Queue[]) => {
            this.queue = data;
            this.getAppointmentTypes(); 
            this.pending = this.getPending();
            this.completed = this.getCompleted();
            this.confirmed = this.getConfirmed();
            this.mapAppointmentPieChart();
          }
          ,
          (error) => {
            console.error('Error fetching queue:', error);
          })
        },
        (error) => {
          console.error('Error fetching appointments:', error);
        }
      );
    }
    this.mapRatingsDaily()
    this.mapRatingsWeekly()
    this.mapRatingsMonthly()
    this.mapAppointmentBarChartMonthly()
    this.mapAppointmentBarChartWeekly()
    this.mapAppointmentBarChartDaily()
  }
}
