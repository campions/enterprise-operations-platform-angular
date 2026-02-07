import { act, render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { TableViewComponent } from '../features/table-view/table-view.component';
import { EquipmentService } from '../core/data/services/equipment.service';
import { mockEquipmentRows } from '../core/data/mock-data';
import { UiModalService } from '../core/ui/ui-modal/ui-modal.service';

class MockEquipmentService {
  getRows() {
    return of(mockEquipmentRows(50)).pipe(delay(500));
  }
}

const modalStub = {
  open: jest.fn().mockReturnValue({ afterClosed: () => of(false) }),
  confirm: jest.fn()
};

describe('TableViewComponent', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('reduces visible rows when the filter input changes', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await render(TableViewComponent, {
      providers: [
        provideNoopAnimations(),
        { provide: EquipmentService, useClass: MockEquipmentService },
        { provide: UiModalService, useValue: modalStub }
      ]
    });

    expect(screen.getByText(/Loading tables/i)).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    const initialRows = await screen.findAllByTestId(/table-row-/);
    expect(initialRows.length).toBeGreaterThan(0);

    const filterInput = screen.getByLabelText(/filter/i);
    await user.clear(filterInput);
    await user.type(filterInput, 'nonexistent');

    await waitFor(() => {
      expect(screen.queryAllByTestId(/table-row-/)).toHaveLength(0);
    });
  });
});
