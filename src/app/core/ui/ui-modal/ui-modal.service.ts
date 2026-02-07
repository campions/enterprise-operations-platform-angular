import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { UiModalComponent } from './ui-modal.component';
import type { UiModalConfig } from './ui-modal.models';

@Injectable({ providedIn: 'root' })
export class UiModalService {
  constructor(private readonly dialog: MatDialog) {}

  open(config: UiModalConfig): MatDialogRef<UiModalComponent, boolean> {
    return this.dialog.open(UiModalComponent, {
      data: config,
      width: config.width ?? '480px',
      disableClose: config.disableClose ?? false,
      autoFocus: true,
      restoreFocus: true,
      hasBackdrop: true,
      closeOnNavigation: true,
      ariaLabel: config.ariaLabel ?? config.title
    });
  }

  confirm(config: UiModalConfig): MatDialogRef<UiModalComponent, boolean> {
    return this.open(config);
  }
}
