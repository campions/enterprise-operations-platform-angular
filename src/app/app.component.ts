import { NgFor, NgIf } from '@angular/common';
import { BreakpointObserver, LayoutModule } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

import { NAV_ITEMS } from './core/layout/navigation.config';
import type { NavItem } from './core/ui/nav-item';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    LayoutModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private wasCompact = false;

  readonly navItems = signal<NavItem[]>(NAV_ITEMS);

  private readonly isCompact = toSignal(
    this.breakpointObserver.observe(['(max-width: 960px)']).pipe(map((state) => state.matches)),
    { initialValue: false }
  );

  readonly sidebarOpened = signal(true);

  private readonly currentRoute = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url ?? '/dashboard')
    ),
    { initialValue: '/dashboard' }
  );

  readonly activeTitle = computed(() => {
    return this.navItems().find((item) => item.route === this.currentRoute())?.label ?? 'Dashboard';
  });

  constructor() {
    effect(
      () => {
        const compact = this.isCompact();
        if (!compact) {
          this.sidebarOpened.set(true);
        } else if (!this.wasCompact && compact) {
          this.sidebarOpened.set(false);
        }
        this.wasCompact = compact;
      },
      { allowSignalWrites: true }
    );
  }

  protected readonly isHandset = computed(() => this.isCompact());

  toggleSidebar(): void {
    this.sidebarOpened.update((open) => !open);
  }

  handleNavClick(): void {
    if (this.isCompact()) {
      this.closeSidebar();
    }
  }

  closeSidebar(): void {
    this.sidebarOpened.set(false);
  }

  protected readonly trackByRoute = (_: number, item: NavItem): string => item.route;
}
