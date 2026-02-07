import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UiButtonComponent } from '../../core/ui/ui-button/ui-button.component';
import { UiCardComponent } from '../../core/ui/ui-card/ui-card.component';
import { UiInputComponent } from '../../core/ui/ui-input/ui-input.component';
import { UiSelectComponent } from '../../core/ui/ui-select/ui-select.component';
import { UiSwitchComponent } from '../../core/ui/ui-switch/ui-switch.component';
import { LoadingStateComponent } from '../../core/states/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../core/states/error-state/error-state.component';
import { ConfigService } from '../../core/data/services/config.service';
import type { ConfigFormState } from '../../core/data/mock-data';
import { defaultConfigState } from '../../core/data/mock-data';
import { UiToastService } from '../../core/ui/ui-toast/ui-toast.service';

type ConfigFormControls = {
  siteName: FormControl<string>;
  language: FormControl<'en' | 'ro' | 'de'>;
  refreshInterval: FormControl<number>;
  enableAlerts: FormControl<boolean>;
  threshold: FormControl<number>;
};

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    UiButtonComponent,
    UiCardComponent,
    UiInputComponent,
    UiSelectComponent,
    UiSwitchComponent,
    LoadingStateComponent,
    ErrorStateComponent
  ],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigurationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly configService = inject(ConfigService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(UiToastService);

  readonly languageOptions = [
    { label: 'English', value: 'en' as const },
    { label: 'Romanian', value: 'ro' as const },
    { label: 'German', value: 'de' as const }
  ];

  readonly form: FormGroup<ConfigFormControls> = this.fb.nonNullable.group({
    siteName: this.fb.nonNullable.control('', {
      validators: [Validators.required, Validators.minLength(3)]
    }),
    language: this.fb.nonNullable.control('en', Validators.required),
    refreshInterval: this.fb.nonNullable.control(15, {
      validators: [Validators.required, Validators.min(5), Validators.max(300)]
    }),
    enableAlerts: this.fb.nonNullable.control(true),
    threshold: this.fb.nonNullable.control(80, {
      validators: [Validators.required, Validators.min(0), Validators.max(100)]
    })
  }) as FormGroup<ConfigFormControls>;

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly error = signal<Error | null>(null);
  readonly submitted = signal(false);

  private loadedSnapshot: ConfigFormState = defaultConfigState;

  constructor() {
    this.loadConfig();
  }

  get controls() {
    return this.form.controls;
  }

  readonly isSaveDisabled = computed(() => this.isLoading() || this.isSaving() || this.form.invalid);

  private loadConfig(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.configService
      .getConfig()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (config) => {
          this.loadedSnapshot = config;
          this.form.reset(config);
          this.form.markAsPristine();
          this.isLoading.set(false);
          this.submitted.set(false);
        },
        error: (err) => {
          const error = err instanceof Error ? err : new Error(String(err));
          this.error.set(error);
          this.isLoading.set(false);
        }
      });
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const payload = this.form.getRawValue();
    console.info('Saving configuration', payload);
    this.loadedSnapshot = payload;
    this.toast.success('Configuration saved');
    this.form.markAsPristine();
    this.isSaving.set(false);
  }

  cancel(): void {
    this.form.reset(this.loadedSnapshot);
    this.form.markAsPristine();
    this.submitted.set(false);
  }

  handleSiteNameChange(value: string | number | null): void {
    const next: string = typeof value === 'string' ? value : this.controls.siteName.value;
    this.updateControl('siteName', next);
  }

  handleLanguageChange(value: unknown): void {
    const normalized = Array.isArray(value) ? (value[0] as 'en' | 'ro' | 'de' | undefined) : (value as 'en' | 'ro' | 'de' | null);
    const fallback: 'en' | 'ro' | 'de' = this.controls.language.value ?? 'en';
    const next: 'en' | 'ro' | 'de' = normalized ?? fallback;
    this.updateControl('language', next);
  }

  updateControl<K extends keyof ConfigFormControls>(key: K, value: ConfigFormControls[K]['value']): void {
    const control = this.controls[key] as FormControl<ConfigFormControls[K]['value']>;
    control.setValue(value);
    control.markAsTouched();
    control.markAsDirty();
  }

  updateNumberControl<K extends keyof ConfigFormControls>(key: K, value: unknown, fallback = 0): void {
    const raw = typeof value === 'number' && !Number.isNaN(value) ? value : Number(value ?? fallback);
    const numericValue = Number.isNaN(raw) ? fallback : raw;
    this.updateControl(key, numericValue as ConfigFormControls[K]['value']);
  }

  showError(controlName: keyof ConfigFormControls): boolean {
    const control = this.controls[controlName];
    return control.invalid && (control.touched || this.submitted());
  }

  getErrorMessage(controlName: keyof ConfigFormControls): string {
    const control = this.controls[controlName];
    if (!control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }

    if (control.errors['minlength']) {
      return `Enter at least ${control.errors['minlength'].requiredLength} characters.`;
    }

    if (control.errors['min']) {
      return `Value must be at least ${control.errors['min'].min}.`;
    }

    if (control.errors['max']) {
      return `Value must be at most ${control.errors['max'].max}.`;
    }

    return 'Invalid value.';
  }

  retry(): void {
    this.loadConfig();
  }
}
