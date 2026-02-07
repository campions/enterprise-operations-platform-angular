import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

export interface UiSelectOption<T = unknown> {
  label: string;
  value: T;
}

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, NgIf],
  template: `
    <mat-form-field
      class="ui-select"
      [appearance]="appearance"
      [attr.data-testid]="dataTestId ?? null"
    >
      <mat-label *ngIf="label">{{ label }}</mat-label>
      <mat-select
        [placeholder]="placeholder ?? ''"
        [multiple]="multiple"
        [disabled]="disabled"
        [value]="value"
        [attr.aria-label]="ariaLabel ?? label ?? placeholder ?? null"
        [attr.aria-describedby]="ariaDescribedBy ?? null"
        (valueChange)="onValueChange($event)"
      >
        <mat-option *ngFor="let option of options" [value]="option.value">
          {{ option.label }}
        </mat-option>
      </mat-select>
      <mat-hint *ngIf="hint">{{ hint }}</mat-hint>
    </mat-form-field>
  `,
  styleUrls: ['./ui-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiSelectComponent<T = unknown> {
  @Input() label?: string;
  @Input() hint?: string;
  @Input() placeholder?: string;
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Input() options: UiSelectOption<T>[] = [];
  @Input() multiple = false;
  @Input() disabled = false;
  @Input() value: T | T[] | null = null;
  @Input() dataTestId?: string;
  @Input() ariaLabel?: string;
  @Input() ariaDescribedBy?: string;

  @Output() valueChange = new EventEmitter<T | T[] | null>();

  onValueChange(value: T | T[] | null): void {
    this.value = value;
    this.valueChange.emit(value);
  }
}
