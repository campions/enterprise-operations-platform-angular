import { act, render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { ConfigurationComponent } from '../features/configuration/configuration.component';
import { ConfigService } from '../core/data/services/config.service';
import { defaultConfigState } from '../core/data/mock-data';
import { UiToastService } from '../core/ui/ui-toast/ui-toast.service';

class MockConfigService {
  getConfig() {
    return of(defaultConfigState).pipe(delay(300));
  }
}

describe('ConfigurationComponent', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('disables save when invalid and triggers toast on valid save', async () => {
    const toast = { success: jest.fn() };
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await render(ConfigurationComponent, {
      providers: [
        provideNoopAnimations(),
        { provide: ConfigService, useClass: MockConfigService },
        { provide: UiToastService, useValue: toast }
      ]
    });

    expect(screen.getByText(/Loading workspace settings/i)).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    const saveButton = await screen.findByTestId('save-settings');
    expect(saveButton).toBeEnabled();

    const siteNameInput = screen.getByLabelText(/site name/i);
    await user.clear(siteNameInput);
    await user.type(siteNameInput, 'Hi');

    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });

    await user.clear(siteNameInput);
    await user.type(siteNameInput, 'Enterprise Center');

    await waitFor(() => {
      expect(saveButton).toBeEnabled();
    });

    await user.click(saveButton);
    expect(toast.success).toHaveBeenCalledWith('Configuration saved');
  });
});
