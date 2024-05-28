import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { ConfirmationComponent } from '../../confirmation/confirmation.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirmation-input',
  standalone: true,
  imports: [MatDialogContent, MatDialogActions, MatDialogClose, MatDialogTitle, MatFormField, MatLabel, FormsModule],
  templateUrl: './confirmation-input.component.html',
  styleUrl: './confirmation-input.component.css'
})
export class ConfirmationInputComponent {
  textareaContent: string = '';
  title: string = 'Confirmation';
  description: string = 'Are you sure?';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<ConfirmationComponent>) {
    if (data) {
      this.title = data.title || this.title;
      this.description = data.description || this.description;
    }
  }

  closeDialog(result: boolean): void {
    let results = [result, this.textareaContent]
    this.dialogRef.close(results);
  }
}
