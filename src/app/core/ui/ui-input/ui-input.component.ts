import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, NgIf],
  template: `
    <mat-form-field
      class="ui-input"
      [appearance]="appearance"
      [attr.data-testid]="dataTestId ?? null"
    >
      <mat-label *ngIf="label">{{ label }}</mat-label>
      <input
        matInput
        [type]="type"
        [placeholder]="placeholder ?? ''"
        [value]="value ?? ''"
        [attr.name]="name ?? null"
        [min]="min"
        [max]="max"
        [step]="step"
        [disabled]="disabled"
        [attr.aria-label]="ariaLabel ?? label ?? placeholder ?? null"
        [attr.aria-describedby]="ariaDescribedBy ?? null"
        (input)="onInput($any($event.target).value)"
      />
      <mat-hint *ngIf="hint">{{ hint }}</mat-hint>
    </mat-form-field>
  `,
  styleUrls: ['./ui-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiInputComponent {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Input() type: 'text' | 'number' | 'password' = 'text';
  @Input() name?: string;
  @Input() hint?: string;
  @Input() disabled = false;
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number;
  @Input() dataTestId?: string;
  @Input() value: string | number | null = null;
  @Input() ariaLabel?: string;
  @Input() ariaDescribedBy?: string;

  @Output() valueChange = new EventEmitter<string | number | null>();

  onInput(value: string): void {
    let parsed: string | number | null = value;
    if (this.type === 'number') {
      parsed = value === '' || value === null ? null : Number(value);
    }
    this.value = parsed;
    this.valueChange.emit(parsed);
  }
}
