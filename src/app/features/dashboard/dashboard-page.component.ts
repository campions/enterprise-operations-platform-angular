import { DatePipe, DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';

import { KpiService } from '../../core/data/services/kpi.service';
import { EquipmentService } from '../../core/data/services/equipment.service';
import type { KpiMetric, EquipmentRow } from '../../core/data/mock-data';
import { createDataState } from '../../core/states/data-state';
import { KpiCardComponent } from './components/kpi-card/kpi-card.component';
import { LoadingStateComponent } from '../../core/states/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../core/states/error-state/error-state.component';
import { EmptyStateComponent } from '../../core/states/empty-state/empty-state.component';
import { UiButtonComponent } from '../../core/ui/ui-button/ui-button.component';
import { UiTableComponent } from '../../core/ui/ui-table/ui-table.component';
import { UiTableCellDirective } from '../../core/ui/ui-table/ui-table-cell.directive';
import type { UiTableColumn } from '../../core/ui/ui-table/ui-table.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    NgClass,
    NgFor,
    NgIf,
    KpiCardComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    UiButtonComponent,
    UiTableComponent,
    UiTableCellDirective
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent {
  private readonly kpiService = inject(KpiService);
  private readonly equipmentService = inject(EquipmentService);

  readonly kpiState = createDataState(() => this.kpiService.getKpis());
  readonly kpis = computed(() => this.kpiState.data() ?? []);

  readonly equipmentState = createDataState(() => this.equipmentService.getRows());
  readonly pageSize = 10;
  readonly pageIndex = signal(0);

  readonly totalPages = computed(() => {
    const total = this.equipmentState.data()?.length ?? 0;
    return Math.max(1, Math.ceil(total / this.pageSize)) || 1;
  });

  readonly pagedRows = computed(() => {
    const rows = this.equipmentState.data() ?? [];
    const start = this.pageIndex() * this.pageSize;
    return rows.slice(start, start + this.pageSize);
  });

  readonly columns: UiTableColumn<EquipmentRow>[] = [
    { key: 'name', header: 'Name' },
    { key: 'status', header: 'Status' },
    { key: 'location', header: 'Location' },
    { key: 'updatedAt', header: 'Updated' },
    { key: 'score', header: 'Score', align: 'end' }
  ];
  readonly recentRowTestId = (row: EquipmentRow, _index?: number) => `recent-row-${row.id}`;

  constructor() {
    effect(() => {
      const total = this.totalPages();
      if (this.pageIndex() > total - 1) {
        this.pageIndex.set(Math.max(total - 1, 0));
      }
    });
  }

  readonly trackKpi = (_: number, metric: KpiMetric) => metric.id;

  nextPage(): void {
    if (this.pageIndex() < this.totalPages() - 1) {
      this.pageIndex.update((value) => value + 1);
    }
  }

  prevPage(): void {
    if (this.pageIndex() > 0) {
      this.pageIndex.update((value) => value - 1);
    }
  }
}
