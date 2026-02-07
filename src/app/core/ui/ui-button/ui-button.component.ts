import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

export type UiButtonVariant = 'text' | 'flat' | 'stroked' | 'raised' | 'icon';
export type UiButtonColor = 'primary' | 'accent' | 'warn' | undefined;

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [MatButtonModule, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet],
  template: `
    <ng-template #buttonContent>
      <span class="ui-button__icon" *ngIf="leadingIcon" aria-hidden="true">{{ leadingIcon }}</span>
      <span class="ui-button__content">
        <ng-content></ng-content>
      </span>
      <span class="ui-button__icon trailing" *ngIf="trailingIcon" aria-hidden="true">{{ trailingIcon }}</span>
    </ng-template>

    <ng-container [ngSwitch]="variant">
      <button
        *ngSwitchCase="'text'"
        mat-button
        class="ui-button"
        [type]="type"
        [disabled]="disabled"
        [color]="color"
        [attr.data-testid]="dataTestId ?? null"
        [attr.aria-label]="ariaLabel ?? null"
        (click)="handleClick($event)"
      >
        <ng-container *ngTemplateOutlet="buttonContent"></ng-container>
      </button>

      <button
        *ngSwitchCase="'flat'"
        mat-flat-button
        class="ui-button"
        [type]="type"
        [disabled]="disabled"
        [color]="color"
        [attr.data-testid]="dataTestId ?? null"
        [attr.aria-label]="ariaLabel ?? null"
        (click)="handleClick($event)"
      >
        <ng-container *ngTemplateOutlet="buttonContent"></ng-container>
      </button>

      <button
        *ngSwitchCase="'stroked'"
        mat-stroked-button
        class="ui-button"
        [type]="type"
        [disabled]="disabled"
        [color]="color"
        [attr.data-testid]="dataTestId ?? null"
        [attr.aria-label]="ariaLabel ?? null"
        (click)="handleClick($event)"
      >
        <ng-container *ngTemplateOutlet="buttonContent"></ng-container>
      </button>

      <button
        *ngSwitchCase="'icon'"
        mat-icon-button
        class="ui-button"
        [type]="type"
        [disabled]="disabled"
        [color]="color"
        [attr.data-testid]="dataTestId ?? null"
        [attr.aria-label]="ariaLabel ?? null"
        (click)="handleClick($event)"
      >
        <ng-container *ngTemplateOutlet="buttonContent"></ng-container>
      </button>

      <button
        *ngSwitchDefault
        mat-raised-button
        class="ui-button"
        [type]="type"
        [disabled]="disabled"
        [color]="color"
        [attr.data-testid]="dataTestId ?? null"
        [attr.aria-label]="ariaLabel ?? null"
        (click)="handleClick($event)"
      >
        <ng-container *ngTemplateOutlet="buttonContent"></ng-container>
      </button>
    </ng-container>
  `,
  styleUrls: ['./ui-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiButtonComponent {
  @Input() variant: UiButtonVariant = 'flat';
  @Input() color: UiButtonColor;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() leadingIcon?: string;
  @Input() trailingIcon?: string;
  @Input() dataTestId?: string;
  @Input() ariaLabel?: string;

  @Output() pressed = new EventEmitter<MouseEvent>();

  handleClick(event: MouseEvent): void {
    this.pressed.emit(event);
  }
}
