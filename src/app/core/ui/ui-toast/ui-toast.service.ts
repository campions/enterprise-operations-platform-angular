import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UiToastMessageComponent } from './ui-toast-message.component';

@Injectable({ providedIn: 'root' })
export class UiToastService {
  constructor(private readonly snackBar: MatSnackBar) {}

  success(message: string): void {
    this.snackBar.openFromComponent(UiToastMessageComponent, {
      data: { message, dataTestId: 'success-toast' },
      duration: 3000,
      panelClass: ['ui-toast--success'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
