import type { WritableSignal } from '@angular/core';
import { DestroyRef, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface DataState<T> {
  data: WritableSignal<T | null>;
  loading: WritableSignal<boolean>;
  error: WritableSignal<Error | null>;
  reload: () => void;
}

export function createDataState<T>(loader: () => Observable<T>): DataState<T> {
  const destroyRef = inject(DestroyRef);
  const data = signal<T | null>(null);
  const loading = signal<boolean>(true);
  const error = signal<Error | null>(null);

  const execute = () => {
    loading.set(true);
    error.set(null);

    loader()
      .pipe(
        takeUntilDestroyed(destroyRef),
        finalize(() => loading.set(false))
      )
      .subscribe({
        next: (value) => data.set(value),
        error: (err) => error.set(err instanceof Error ? err : new Error(String(err)))
      });
  };

  execute();

  return { data, loading, error, reload: execute };
}
