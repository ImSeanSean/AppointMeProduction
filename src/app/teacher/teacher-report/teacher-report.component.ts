import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-teacher-report',
  templateUrl: './teacher-report.component.html',
  styleUrls: ['./teacher-report.component.css']
})
export class TeacherReportComponent {
  generatePDF() {
    const elementToPrint = document.getElementById('appointmentRecords');
    if (elementToPrint) {
      html2canvas(elementToPrint, { scale: 2 }).then((canvas: HTMLCanvasElement) => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 170; // reduced width to account for margins
        const pageHeight = 257; // reduced height to account for margins
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const pdf = new jsPDF('p', 'mm', 'a4');
        let position = 0;
        let appointments = 0;

        if (imgHeight < pageHeight) {
          const marginLeft = 20; // left margin
          const marginTop = 20; // top margin
          pdf.addImage(imgData, 'PNG', marginLeft, marginTop, imgWidth, imgHeight);
        } else {
          while (position < canvas.height) {
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            pageCanvas.height = Math.min(canvas.height - position, canvas.width * pageHeight / imgWidth);
            const context = pageCanvas.getContext('2d');
            context?.drawImage(canvas, 0, -position);
            const pageImgData = pageCanvas.toDataURL('image/png');

            const marginLeft = 20; // left margin
            const marginTop = 20; // top margin
            if (appointments % 4 === 0) {
              pdf.addImage(pageImgData, 'PNG', marginLeft, marginTop, imgWidth, pageHeight);
            } else {
              pdf.addImage(pageImgData, 'PNG', marginLeft + imgWidth, marginTop, imgWidth, pageHeight);
            }

            position += pageCanvas.height;
            appointments++;

            if (appointments % 4 === 0 && position < canvas.height) {
              pdf.addPage();
            }
          }
        }

        pdf.setProperties({
          title: 'Report',
          subject: 'PDF Report',
          author: 'AppointMe',
        });
        pdf.setFontSize(12);
        pdf.save('My_Report.pdf');
      });
    }
  }
}
