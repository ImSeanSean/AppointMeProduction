import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-reports',
  standalone: true,
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent {
  generatePDF() {
    const elementToPrint = document.getElementById('theContent');
    if (elementToPrint) {
      html2canvas(elementToPrint, { scale: 2 }).then((canvas) => {
        const pdf = new jsPDF();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 211, 298);
        pdf.save('report.pdf');

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


