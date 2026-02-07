import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export const SIMULATED_ERROR = new Error('Simulated error');

export function shouldSimulateError(): boolean {
  if (typeof window === 'undefined' || !window?.location) {
    return false;
  }

  try {
    const params = new URLSearchParams(window.location.search ?? '');
    return params.get('error') === '1';
  } catch {
    return false;
  }
}

export function respondWithLatency<T>(value: T, latencyMs: number): Observable<T> {
  if (shouldSimulateError()) {
    return throwError(() => SIMULATED_ERROR);
  }

  return of(value).pipe(delay(latencyMs));
}
