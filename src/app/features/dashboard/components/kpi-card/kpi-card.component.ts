import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UiCardComponent } from '../../../../core/ui/ui-card/ui-card.component';
import type { KpiMetric } from '../../../../core/data/mock-data';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, UiCardComponent],
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpiCardComponent {
  @Input({ required: true }) metric!: KpiMetric;

  get hasDelta(): boolean {
    return typeof this.metric.delta === 'number';
  }

  get formattedValue(): string {
    return typeof this.metric.value === 'number' ? this.metric.value.toLocaleString() : this.metric.value;
  }

  get deltaLabel(): string {
    if (!this.hasDelta) {
      return '';
    }
    const delta = this.metric.delta ?? 0;
    const prefix = delta >= 0 ? '+' : '';
    return `${prefix}${delta}`;
  }
}
