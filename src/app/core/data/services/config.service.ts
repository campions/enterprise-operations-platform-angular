import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { ConfigFormState } from '../mock-data';
import { defaultConfigState } from '../mock-data';
import { respondWithLatency } from './service-utils';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  getConfig(): Observable<ConfigFormState> {
    return respondWithLatency({ ...defaultConfigState }, 300);
  }
}
