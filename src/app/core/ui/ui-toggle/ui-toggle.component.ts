import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'ui-toggle',
  standalone: true,
  imports: [MatSlideToggleModule],
  template: `
    <mat-slide-toggle
      class="ui-toggle"
      [checked]="checked"
      [disabled]="disabled"
      [attr.data-testid]="dataTestId ?? null"
      (change)="onToggle($event.checked)"
    >
      <span class="ui-toggle__label">{{ label }}</span>
      <span class="ui-toggle__description" *ngIf="description">{{ description }}</span>
    </mat-slide-toggle>
  `,
  styleUrls: ['./ui-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiToggleComponent {
  @Input() label!: string;
  @Input() description?: string;
  @Input() checked = false;
  @Input() disabled = false;
  @Input() dataTestId?: string;

  @Output() checkedChange = new EventEmitter<boolean>();

  onToggle(next: boolean): void {
    this.checked = next;
    this.checkedChange.emit(next);
  }
}
