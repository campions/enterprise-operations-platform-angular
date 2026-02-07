import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NgIf, NgTemplateOutlet } from '@angular/common';

import { UiButtonComponent } from '../ui-button/ui-button.component';
import type { UiModalConfig } from './ui-modal.models';

@Component({
  selector: 'ui-modal',
  standalone: true,
  imports: [MatDialogModule, NgIf, NgTemplateOutlet, UiButtonComponent],
  template: `
    <h2 mat-dialog-title [attr.data-testid]="data.dataTestId ? data.dataTestId + '__title' : null">
      {{ data.title }}
    </h2>

    <div mat-dialog-content [attr.data-testid]="contentTestId">
      <ng-container
        *ngIf="data.template; else defaultContent"
        [ngTemplateOutlet]="data.template"
        [ngTemplateOutletContext]="templateContext"
      ></ng-container>
      <ng-template #defaultContent>
        <p *ngIf="data.message">{{ data.message }}</p>
      </ng-template>
    </div>

    <div mat-dialog-actions align="end" *ngIf="!hideActions">
      <ui-button
        variant="text"
        (pressed)="close(false)"
        *ngIf="data.cancelLabel !== null"
        [dataTestId]="buildTestId('__cancel')"
      >
        {{ data.cancelLabel ?? 'Cancel' }}
      </ui-button>

      <ui-button
        color="primary"
        variant="flat"
        (pressed)="close(true)"
        [dataTestId]="buildTestId('__confirm')"
      >
        {{ data.confirmLabel ?? 'Continue' }}
      </ui-button>
    </div>
  `,
  styleUrls: ['./ui-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiModalComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<UiModalComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public readonly data: UiModalConfig
  ) {}

  get hideActions(): boolean {
    return this.data.hideActions ?? false;
  }

  get contentTestId(): string | null {
    if (!this.data.dataTestId) {
      return null;
    }
    return `${this.data.dataTestId}__content`;
  }

  get templateContext(): Record<string, unknown> {
    return {
      ...(this.data.templateContext ?? {}),
      close: (result?: boolean) => this.close(Boolean(result))
    };
  }

  buildTestId(suffix: string): string | undefined {
    if (!this.data.dataTestId) {
      return undefined;
    }
    return `${this.data.dataTestId}${suffix}`;
  }

  close(result: boolean): void {
    this.dialogRef.close(result);
  }
}
