import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { EquipmentRow } from '../mock-data';
import { mockEquipmentRows } from '../mock-data';
import { respondWithLatency } from './service-utils';

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  getRows(): Observable<EquipmentRow[]> {
    return respondWithLatency(mockEquipmentRows(200), 500);
  }
}
