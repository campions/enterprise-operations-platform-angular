import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card
      class="ui-card"
      [class.ui-card--outlined]="appearance === 'outlined'"
      [attr.data-testid]="dataTestId ?? null"
    >
      <ng-content></ng-content>
    </mat-card>
  `,
  styleUrls: ['./ui-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiCardComponent {
  @Input() appearance: 'raised' | 'outlined' = 'raised';
  @Input() dataTestId?: string;
}
