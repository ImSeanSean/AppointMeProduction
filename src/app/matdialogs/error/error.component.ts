import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css'
})
export class ErrorComponent {
  title: string = 'Password Mismatch';
  description: string = 'The entered passwords do not match. Please try again.';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<ErrorComponent>) {
    if (data) {
      this.title = data.title || this.title;
      this.description = data.description || this.description;
    }
  }

  closeDialog(): void {
    this.dialogRef.close();

  }
}
