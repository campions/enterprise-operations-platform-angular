import type { AfterContentInit, TemplateRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  inject
} from '@angular/core';
import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import type { UiTableCellContext } from './ui-table-cell.directive';
import { UiTableCellDirective } from './ui-table-cell.directive';

export interface UiTableColumn<T = unknown> {
  key: string;
  header: string;
  align?: 'start' | 'center' | 'end';
  cell?: (row: T, index: number) => string | number | null;
  sortable?: boolean;
}

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [MatTableModule, MatIconModule, NgFor, NgIf, NgTemplateOutlet],
  template: `
    <table
      mat-table
      class="ui-table mat-elevation-z1"
      [dataSource]="dataSource"
      [attr.data-testid]="dataTestId ?? null"
    >
      <ng-container *ngFor="let column of columns" [matColumnDef]="column.key">
        <th
          mat-header-cell
          *matHeaderCellDef
          [class.align-end]="column.align === 'end'"
          [class.align-center]="column.align === 'center'"
          [class.sortable]="column.sortable"
          (click)="handleHeaderClick(column)"
          [attr.role]="column.sortable ? 'button' : null"
          [attr.tabindex]="column.sortable ? 0 : null"
          [attr.aria-label]="column.sortable ? 'Sort by ' + column.header : null"
          [attr.aria-sort]="column.sortable ? getAriaSort(column.key) : null"
          (keydown)="handleHeaderKeydown($event, column)"
        >
          {{ column.header }}
          <mat-icon *ngIf="column.sortable" class="sort-icon">
            {{ getSortIcon(column.key) }}
          </mat-icon>
        </th>
        <td
          mat-cell
          *matCellDef="let row; let i = index"
          [class.align-end]="column.align === 'end'"
          [class.align-center]="column.align === 'center'"
        >
          <ng-container
            *ngIf="getTemplate(column.key) as tpl; else defaultCell"
            [ngTemplateOutlet]="tpl"
            [ngTemplateOutletContext]="{ $implicit: row, row: row }"
          ></ng-container>
          <ng-template #defaultCell>
            {{ column.cell ? column.cell(row, i) : getDefaultCellValue(row, column.key) }}
          </ng-template>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumnKeys"></tr>
      <tr
        mat-row
        *matRowDef="let row; let i = index; columns: displayedColumnKeys"
        (click)="onRowClick(row)"
        [class.ui-table__row-selectable]="rowSelectable"
        [attr.data-testid]="getRowTestId(row, i)"
      ></tr>
    </table>

    <div class="ui-table__empty" *ngIf="dataSource.length === 0">
      {{ emptyState }}
    </div>
  `,
  styleUrls: ['./ui-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiTableComponent<T = unknown> implements AfterContentInit {
  @Input() dataSource: ReadonlyArray<T> = [];
  @Input() columns: UiTableColumn<T>[] = [];
  @Input() rowSelectable = false;
  @Input() emptyState = 'No data available';
  @Input() dataTestId?: string;
  @Input() sortKey: string | null = null;
  @Input() sortDir: 'asc' | 'desc' = 'asc';
  @Input() rowTestIdFn?: (row: T, index: number) => string | null;

  @Output() sortChange = new EventEmitter<string>();
  @Output() rowSelected = new EventEmitter<T>();

  @ContentChildren(UiTableCellDirective) private readonly cellTemplates?: QueryList<UiTableCellDirective<T>>;

  private readonly destroyRef = inject(DestroyRef);
  private templateMap = new Map<string, TemplateRef<UiTableCellContext<T>>>();

  constructor() {
    this.destroyRef.onDestroy(() => this.templateMap.clear());
  }

  get displayedColumnKeys(): string[] {
    return this.columns.map((column) => column.key);
  }

  ngAfterContentInit(): void {
    this.buildTemplateMap();
    this.cellTemplates
      ?.changes.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.buildTemplateMap());
  }

  getTemplate(columnKey: string): TemplateRef<UiTableCellContext<T>> | null {
    return this.templateMap.get(columnKey) ?? null;
  }

  handleHeaderKeydown(event: KeyboardEvent, column: UiTableColumn<T>): void {
    if (!column.sortable) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.emitSort(column);
    }
  }

  private emitSort(column: UiTableColumn<T>): void {
    if (!column.sortable) {
      return;
    }
    this.sortChange.emit(column.key);
  }

  handleHeaderClick(column: UiTableColumn<T>): void {
    this.emitSort(column);
  }

  getSortIcon(columnKey: string): string {
    if (this.sortKey !== columnKey) {
      return 'unfold_more';
    }
    return this.sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  getAriaSort(columnKey: string): 'none' | 'ascending' | 'descending' {
    if (this.sortKey !== columnKey) {
      return 'none';
    }
    return this.sortDir === 'asc' ? 'ascending' : 'descending';
  }

  getRowTestId(row: T, index: number): string | null {
    if (this.rowTestIdFn) {
      const value = this.rowTestIdFn(row, index);
      return value ?? null;
    }
    if (this.dataTestId) {
      return `${this.dataTestId}__row-${index}`;
    }
    return null;
  }

  getDefaultCellValue(row: T, key: string): unknown {
    if (row && Object.prototype.hasOwnProperty.call(row as object, key)) {
      return (row as Record<string, unknown>)[key];
    }
    return '';
  }

  onRowClick(row: T): void {
    if (this.rowSelectable) {
      this.rowSelected.emit(row);
    }
  }

  private buildTemplateMap(): void {
    this.templateMap.clear();
    this.cellTemplates?.forEach((tpl) => {
      if (tpl.columnKey) {
        this.templateMap.set(tpl.columnKey, tpl.template);
      }
    });
  }
}
