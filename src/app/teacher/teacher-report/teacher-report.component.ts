import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf";
import { mainPort } from '../../app.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-teacher-report',
  templateUrl: './teacher-report.component.html',
  styleUrls: ['./teacher-report.component.css']
})
export class TeacherReportComponent {
  constructor(private http: HttpClient){}

  generatePDF() {
    const elementToPrint = document.getElementById('appointmentRecords');
    if (elementToPrint) {
      // Show the element
      elementToPrint.style.display = 'block';

      html2canvas(elementToPrint, { scale: 2 }).then((canvas: HTMLCanvasElement) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        const marginLeft = 10; // left margin
        const marginTop = 10; // top margin
        const imgWidth = 210 - 2 * marginLeft; // A4 width in mm minus margins
        const pageHeight = 297 - 2 * marginTop; // A4 height in mm minus margins
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let position = 0;

        while (position < canvas.height) {
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = Math.min(canvas.height - position, canvas.width * pageHeight / imgWidth);
          const context = pageCanvas.getContext('2d');
          context?.drawImage(canvas, 0, -position);
          const pageImgData = pageCanvas.toDataURL('image/png');

          if (position === 0) {
            pdf.addImage(pageImgData, 'PNG', marginLeft, marginTop, imgWidth, pageCanvas.height * imgWidth / canvas.width);
          } else {
            pdf.addPage();
            pdf.addImage(pageImgData, 'PNG', marginLeft, marginTop, imgWidth, pageCanvas.height * imgWidth / canvas.width);
          }

          position += pageCanvas.height;
        }

        pdf.setProperties({
          title: 'Report',
          subject: 'PDF Report',
          author: 'AppointMe',
        });
        pdf.setFontSize(12);
        pdf.save('My_Report.pdf');

        // Hide the element again
        elementToPrint.style.display = 'none';
      });
    }
  }

  generateFPDF(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const options = { headers, responseType: 'blob' as 'json' };

    return this.http.post(`${mainPort}/pdo/api/generate_report`, null, options);
  }

  downloadPDF() {
    this.generateFPDF().subscribe(
      (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Appointment_Summary_Report.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error => {
        console.error('Error generating PDF:', error);
        // Handle error as needed
      }
    );
  }
}
