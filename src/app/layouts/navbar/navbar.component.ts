import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UsertypedialogComponent } from '../../matdialogs/usertypedialog/usertypedialog.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  constructor(private router: Router, public dialog: MatDialog){}

  openLoginDialog(): void {
    const dialogRef = this.dialog.open(UsertypedialogComponent, {
      width: '300px',
    });

    dialogRef.componentInstance.userType.subscribe((selectedUserType: string) => {
     this.router.navigate(['./'+ selectedUserType + '/login'])
    });
  }

  openRegisterDialog(): void {
    const dialogRef = this.dialog.open(UsertypedialogComponent, {
      width: '300px',
    });

    dialogRef.componentInstance.userType.subscribe((selectedUserType: string) => {
     this.router.navigate(['./'+ selectedUserType + '/register'])
    });
  }

  redirectToHomePage(){
    this.router.navigate([''])
  }
}
