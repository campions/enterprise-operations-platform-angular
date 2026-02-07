import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  templateUrl: './loading-state.component.html',
  styleUrl: './loading-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingStateComponent {
  @Input() title = 'Loading';
  @Input() message = 'Please wait while we fetch the latest data.';
  @Input() placeholders = 3;

  get placeholderArray(): number[] {
    return Array.from({ length: this.placeholders }, (_, i) => i);
  }
}
