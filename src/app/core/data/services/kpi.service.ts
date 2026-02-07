import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { KpiMetric } from '../mock-data';
import { mockKpis } from '../mock-data';
import { respondWithLatency } from './service-utils';

@Injectable({
  providedIn: 'root'
})
export class KpiService {
  getKpis(): Observable<KpiMetric[]> {
    return respondWithLatency(mockKpis(), 400);
  }
}
