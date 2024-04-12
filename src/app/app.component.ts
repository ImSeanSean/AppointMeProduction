import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterOutlet } from '@angular/router';
import { UsertypedialogComponent } from './matdialogs/usertypedialog/usertypedialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = "AppointMe"

  constructor(private router: Router, public dialog: MatDialog){}

  redirectToHomePage(){
    this.router.navigate([''])
  }

  openLoginDialog(): void {
    const dialogRef = this.dialog.open(UsertypedialogComponent, {
      width: '300px',
    });

    dialogRef.componentInstance.userType.subscribe((selectedUserType: string) => {
     this.router.navigate(['./'+ selectedUserType + '/login'])
    });
  }
}
