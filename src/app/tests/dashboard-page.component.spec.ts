import { act, render, screen } from '@testing-library/angular';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { DashboardPageComponent } from '../features/dashboard/dashboard-page.component';
import { KpiService } from '../core/data/services/kpi.service';
import { EquipmentService } from '../core/data/services/equipment.service';
import { mockEquipmentRows, mockKpis } from '../core/data/mock-data';

class MockKpiService {
  getKpis() {
    return of(mockKpis()).pipe(delay(400));
  }
}

class MockEquipmentService {
  getRows() {
    return of(mockEquipmentRows(20)).pipe(delay(500));
  }
}

describe('DashboardPageComponent', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('shows a loading state before rendering KPI cards', async () => {
    await render(DashboardPageComponent, {
      providers: [
        provideNoopAnimations(),
        { provide: KpiService, useClass: MockKpiService },
        { provide: EquipmentService, useClass: MockEquipmentService }
      ]
    });

    expect(screen.getByText(/Loading KPI metrics/i)).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    const cards = await screen.findAllByTestId(/kpi-/);
    expect(cards).toHaveLength(mockKpis().length);
  });
});
