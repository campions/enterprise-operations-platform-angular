import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

export interface UiToastMessageData {
  message: string;
  dataTestId?: string;
}

@Component({
  selector: 'ui-toast-message',
  standalone: true,
  template: `
    <span class="ui-toast-message" [attr.data-testid]="data.dataTestId ?? null">
      {{ data.message }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiToastMessageComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public readonly data: UiToastMessageData) {}
}
