import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [MatDialogContent, MatDialogActions, MatDialogClose, MatDialogTitle],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.css'
})
export class ConfirmationComponent {
  title: string = 'Confirmation';
  description: string = 'Are you sure?';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<ConfirmationComponent>) {
    if (data) {
      this.title = data.title || this.title;
      this.description = data.description || this.description;
    }
  }

  closeDialog(result: boolean): void {
    this.dialogRef.close(result);
  }
}
