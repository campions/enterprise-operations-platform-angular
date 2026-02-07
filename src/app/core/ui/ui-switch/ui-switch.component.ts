import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'ui-switch',
  standalone: true,
  imports: [MatSlideToggleModule, NgIf],
  templateUrl: './ui-switch.component.html',
  styleUrl: './ui-switch.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiSwitchComponent {
  @Input() label!: string;
  @Input() description?: string;
  @Input() checked = false;
  @Input() disabled = false;
  @Input() dataTestId?: string;
  @Input() ariaLabel?: string;

  @Output() checkedChange = new EventEmitter<boolean>();

  onToggle(next: boolean): void {
    this.checkedChange.emit(next);
  }
}
