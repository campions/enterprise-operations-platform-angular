import { TemplateRef } from '@angular/core';

export interface UiModalConfig {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  disableClose?: boolean;
  width?: string;
  dataTestId?: string;
  template?: TemplateRef<unknown>;
  templateContext?: Record<string, unknown>;
  hideActions?: boolean;
  ariaLabel?: string;
}
