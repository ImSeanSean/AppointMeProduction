import { Component, EventEmitter, Output} from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-usertypedialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './usertypedialog.component.html',
  styleUrl: './usertypedialog.component.css'
})
export class UsertypedialogComponent {
  @Output() userType = new EventEmitter<string>();

  constructor(public dialogRef: MatDialogRef<UsertypedialogComponent>) {}

  closeDialog(): void {
    this.dialogRef.close();
  }

  userTypeSelect(value:string): void {
    this.userType.emit(value);
    this.dialogRef.close();
  }
}
