import { DatePipe, DecimalPipe, NgClass, NgIf, TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewChild,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';

import { UiButtonComponent } from '../../core/ui/ui-button/ui-button.component';
import { UiInputComponent } from '../../core/ui/ui-input/ui-input.component';
import { UiSelectComponent } from '../../core/ui/ui-select/ui-select.component';
import { UiTableCellDirective } from '../../core/ui/ui-table/ui-table-cell.directive';
import type { UiTableColumn } from '../../core/ui/ui-table/ui-table.component';
import { UiTableComponent } from '../../core/ui/ui-table/ui-table.component';
import { EquipmentService } from '../../core/data/services/equipment.service';
import { createDataState } from '../../core/states/data-state';
import type { EquipmentRow } from '../../core/data/mock-data';
import { LoadingStateComponent } from '../../core/states/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../core/states/error-state/error-state.component';
import { EmptyStateComponent } from '../../core/states/empty-state/empty-state.component';
import { UiModalService } from '../../core/ui/ui-modal/ui-modal.service';
import { applyFilter, applyPagination, applySort, createTableState } from '../../core/utils/table-utils';

type EditDraft = Pick<EquipmentRow, 'name' | 'status' | 'score'>;

type ViewTemplateContext = { $implicit: EquipmentRow; row: EquipmentRow };
type EditTemplateContext = {
  $implicit: EquipmentRow;
  row: EquipmentRow;
  draft: () => EditDraft | null;
  statusOptions: { label: string; value: EquipmentRow['status'] }[];
  updateName: (value: string | number | null) => void;
  updateStatus: (value: EquipmentRow['status'] | null) => void;
  updateScore: (value: number | null) => void;
};

@Component({
  selector: 'app-table-view',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    NgClass,
    NgIf,
    TitleCasePipe,
    UiButtonComponent,
    UiInputComponent,
    UiSelectComponent,
    UiTableComponent,
    UiTableCellDirective,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent
  ],
  templateUrl: './table-view.component.html',
  styleUrl: './table-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableViewComponent {
  private readonly equipmentService = inject(EquipmentService);
  private readonly modal = inject(UiModalService);

  @ViewChild('viewRowTemplate', { read: TemplateRef }) private viewRowTemplate?: TemplateRef<ViewTemplateContext>;
  @ViewChild('editRowTemplate', { read: TemplateRef }) private editRowTemplate?: TemplateRef<EditTemplateContext>;

  readonly rowsState = createDataState(() => this.equipmentService.getRows());
  readonly rows = signal<EquipmentRow[]>([]);
  readonly tableState = createTableState<EquipmentRow>();

  readonly statusOptions: { label: string; value: EquipmentRow['status'] }[] = [
    { label: 'Operational', value: 'OK' },
    { label: 'Warning', value: 'WARN' },
    { label: 'Error', value: 'ERROR' }
  ];

  readonly pageSizeOptions = [10, 25, 50];
  readonly pageSizeSelectOptions = this.pageSizeOptions.map((size) => ({
    label: `${size} / page`,
    value: size
  }));

  readonly filteredRows = computed(() => applyFilter(this.rows(), this.tableState.filterText()));
  readonly sortedRows = computed(() => applySort(this.filteredRows(), this.tableState.sortKey(), this.tableState.sortDir()));
  readonly pagedRows = computed(() =>
    applyPagination(this.sortedRows(), this.tableState.page(), this.tableState.pageSize())
  );
  readonly totalRows = computed(() => this.sortedRows().length);
  readonly canGoPrevious = computed(() => this.tableState.page() > 0);
  readonly canGoNext = computed(() => {
    const total = this.totalRows();
    if (!total) {
      return false;
    }
    return (this.tableState.page() + 1) * this.tableState.pageSize() < total;
  });

  readonly rangeLabel = computed(() => {
    const total = this.totalRows();
    if (!total) {
      return '0-0 of 0';
    }
    const page = this.tableState.page();
    const size = this.tableState.pageSize();
    const start = page * size + 1;
    const end = Math.min((page + 1) * size, total);
    return `${start}-${end} of ${total}`;
  });

  readonly averageScore = computed(() => {
    const current = this.filteredRows();
    if (!current.length) {
      return 0;
    }
    const total = current.reduce((sum, row) => sum + row.score, 0);
    return Number((total / current.length).toFixed(1));
  });

  readonly columns: UiTableColumn<EquipmentRow>[] = [
    { key: 'id', header: 'Asset ID' },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'location', header: 'Location' },
    { key: 'score', header: 'Score', align: 'end', sortable: true },
    { key: 'updatedAt', header: 'Last Updated', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'actions', header: 'Actions', align: 'end' }
  ];

  readonly editDraft = signal<EditDraft | null>(null);
  readonly editingRow = signal<EquipmentRow | null>(null);
  readonly rowTestId = (row: EquipmentRow, _index?: number) => `table-row-${row.id}`;

  constructor() {
    effect(
      () => {
        const data = this.rowsState.data();
        if (data) {
          this.rows.set(data);
        }
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        const total = this.sortedRows().length;
        const size = this.tableState.pageSize();
        const maxPage = Math.max(Math.ceil(total / size) - 1, 0);
        if (this.tableState.page() > maxPage) {
          this.tableState.setPage(maxPage);
        }
      },
      { allowSignalWrites: true }
    );
  }

  onFilterChange(value: string | number | null): void {
    this.tableState.setFilterText((value ?? '').toString());
  }

  onSortChange(columnKey: string): void {
    this.tableState.setSort(columnKey as keyof EquipmentRow);
  }

  changePage(delta: number): void {
    if (delta < 0 && !this.canGoPrevious()) {
      return;
    }
    if (delta > 0 && !this.canGoNext()) {
      return;
    }
    this.tableState.setPage(this.tableState.page() + delta);
  }

  onPageSizeChange(value: number | number[] | null): void {
    const normalized = Array.isArray(value) ? value[0] : value;
    if (typeof normalized === 'number' && !Number.isNaN(normalized)) {
      this.tableState.setPageSize(normalized);
    }
  }

  openView(row: EquipmentRow): void {
    if (!this.viewRowTemplate) {
      return;
    }
    this.modal.open({
      title: row.name,
      dataTestId: 'view-row-modal',
      template: this.viewRowTemplate,
      templateContext: { $implicit: row, row },
      hideActions: true,
      width: '520px',
      ariaLabel: `Asset details for ${row.name}`
    });
  }

  openEdit(row: EquipmentRow): void {
    if (!this.editRowTemplate) {
      return;
    }

    this.editingRow.set(row);
    this.editDraft.set({ name: row.name, status: row.status, score: row.score });

    this.modal
      .open({
        title: `Edit ${row.name}`,
        dataTestId: 'edit-row-modal',
        confirmLabel: 'Save',
        cancelLabel: 'Cancel',
        template: this.editRowTemplate,
        templateContext: {
          $implicit: row,
          row,
          draft: this.editDraft,
          statusOptions: this.statusOptions,
          updateName: (value: string | number | null) => this.updateEditName(value),
          updateStatus: (value: EquipmentRow['status'] | null) => this.updateEditStatus(value),
          updateScore: (value: number | null) => this.updateEditScore(value)
        },
        ariaLabel: `Edit asset ${row.name}`
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.persistEdit();
        } else {
          this.resetEditState();
        }
      });
  }

  updateEditName(value: string | number | null): void {
    const draftName = this.editDraft()?.name ?? this.editingRow()?.name ?? '';
    const safe = typeof value === 'string' ? value : draftName;
    this.updateEditDraft('name', safe);
  }

  updateEditStatus(value: EquipmentRow['status'] | null): void {
    const allowed = this.statusOptions.map((option) => option.value);
    const fallback = this.editDraft()?.status ?? this.statusOptions[0].value;
    const nextStatus = value && allowed.includes(value) ? value : fallback;
    this.updateEditDraft('status', nextStatus);
  }

  updateEditScore(value: number | null): void {
    const fallback = this.editDraft()?.score ?? this.editingRow()?.score ?? 0;
    const safe = typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
    this.updateEditDraft('score', safe);
  }

  trackRows = (_: number, row: EquipmentRow) => row.id;

  private updateEditDraft<K extends keyof EditDraft>(key: K, value: EditDraft[K]): void {
    this.editDraft.update((draft) => {
      if (!draft) {
        return draft;
      }
      return { ...draft, [key]: value };
    });
  }

  private persistEdit(): void {
    const draft = this.editDraft();
    const row = this.editingRow();
    if (!draft || !row) {
      this.resetEditState();
      return;
    }

    this.rows.update((items) => items.map((item) => (item.id === row.id ? { ...item, ...draft } : item)));
    this.resetEditState();
  }

  private resetEditState(): void {
    this.editingRow.set(null);
    this.editDraft.set(null);
  }
}
