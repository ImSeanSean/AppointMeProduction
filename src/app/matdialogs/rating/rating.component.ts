import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, } from '@angular/material/dialog';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [MatDialogContent, MatDialogActions, MatDialogClose, MatDialogTitle, FormsModule],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.css'
})
export class RatingComponent {
  title: string = 'Confirmation';
  description: string = 'Are you sure?';
  selectedRatingHelpfulness: number | null = null;
  selectedRatingEmpathy: number | null = null;
  selectedRatingClarity: number | null = null;
  selectedRatingEngagement: number | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<RatingComponent>) {
    if (data) {
      this.title = data.title || this.title;
      this.description = data.description || this.description;
    }
  }

  closeDialog(): void {
    let selectedRating = {
      helpfulness: this.selectedRatingHelpfulness,
      empathy: this.selectedRatingEmpathy,
      clarity: this.selectedRatingClarity,
      engagement: this.selectedRatingEngagement
    }
    this.dialogRef.close(selectedRating);
  }
  cancelDialog():void {
    this.dialogRef.close();
  }
}
