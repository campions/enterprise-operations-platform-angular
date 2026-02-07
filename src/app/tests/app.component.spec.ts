import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';

import { AppComponent } from '../app.component';
import { appRoutes } from '../app.routes';

describe('AppComponent', () => {
  it('renders navigation links for each feature', async () => {
    await render(AppComponent, {
      routes: appRoutes,
      providers: [provideRouter(appRoutes), provideNoopAnimations()]
    });

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /table view/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /configuration/i })).toBeInTheDocument();
  });

  it('defaults to the dashboard view', async () => {
    await render(AppComponent, {
      routes: appRoutes,
      providers: [provideRouter(appRoutes), provideNoopAnimations()]
    });

    expect(await screen.findByText(/recent activity/i)).toBeInTheDocument();
  });
});
