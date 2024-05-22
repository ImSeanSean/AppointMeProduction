import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterOutlet } from '@angular/router';
import { UsertypedialogComponent } from '../matdialogs/usertypedialog/usertypedialog.component';
import { NavbarComponent } from "../layouts/navbar/navbar.component";
import { mainPort } from '../app.component';

@Component({
    selector: 'app-homepage',
    standalone: true,
    templateUrl: './homepage.component.html',
    styleUrl: './homepage.component.css',
    imports: [NavbarComponent]
})
export class HomepageComponent {
  title = "AppointMe"

  constructor(private router: Router, public dialog: MatDialog){}

  openRegisterDialog(): void {
    const dialogRef = this.dialog.open(UsertypedialogComponent, {
      width: '300px',
    });

    dialogRef.componentInstance.userType.subscribe((selectedUserType: string) => {
     this.router.navigate(['./'+ selectedUserType + '/register'])
    });
  }
}
