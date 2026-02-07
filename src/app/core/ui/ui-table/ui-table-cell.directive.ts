import { Directive, Input, TemplateRef } from '@angular/core';

export interface UiTableCellContext<T> {
  $implicit: T;
  row: T;
}

@Directive({
  selector: 'ng-template[uiTableCell]',
  standalone: true
})
export class UiTableCellDirective<T = unknown> {
  @Input('uiTableCell') columnKey!: string;

  constructor(public readonly template: TemplateRef<UiTableCellContext<T>>) {}
}
