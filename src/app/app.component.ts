import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterOutlet } from '@angular/router';
import { UsertypedialogComponent } from './matdialogs/usertypedialog/usertypedialog.component';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'AppointMe';

  constructor(private router: Router, public dialog: MatDialog) {}

  redirectToHomePage() {
    this.router.navigate(['']);
  }

  openLoginDialog(): void {
    const dialogRef = this.dialog.open(UsertypedialogComponent, {
      width: '300px',
    });

    dialogRef.componentInstance.userType.subscribe(
      (selectedUserType: string) => {
        this.router.navigate(['./' + selectedUserType + '/login']);
      }
    );
  }

  generatePDF() {
    const elementToPrint: any = document.getElementById(
      'theContentofViewFinished'
    ); // The HTML element to become a PDF. The HTMl class you want to convert.

    html2canvas(elementToPrint, { scale: 2 }).then((canvas) => {
      const pdf = new jsPDF();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 211, 290);

      pdf.setProperties({
        title: 'My Documentation PDF',
        subject: 'PDF from html with Angular',
        author: 'TeacherName?',
      });

      pdf.setFontSize(12);
      pdf.text('RandomTEXT', 14, 22);

      pdf.save('myFile.pdf');
    });
  }
}
// export const mainPort = "http://localhost/appointme";
export const mainPort = 'https://appointme.site';
