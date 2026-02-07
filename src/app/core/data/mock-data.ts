export interface KpiMetric {
  id: string;
  label: string;
  value: number | string;
  delta?: number;
  unit?: string;
}

export interface EquipmentRow {
  id: string;
  name: string;
  status: 'OK' | 'WARN' | 'ERROR';
  location: string;
  updatedAt: string;
  score: number;
}

export interface ConfigFormState {
  siteName: string;
  language: 'en' | 'ro' | 'de';
  refreshInterval: number;
  enableAlerts: boolean;
  threshold: number;
}

const KPI_ENTRIES: KpiMetric[] = [
  { id: 'ops-throughput', label: 'Ops Throughput', value: 98.2, delta: 2.4, unit: '%' },
  { id: 'avg-resolution', label: 'Avg. Resolution Time', value: '3h 42m', delta: -0.6 },
  { id: 'active-flows', label: 'Active Flows', value: 42, delta: 5 },
  { id: 'pending-approvals', label: 'Pending Approvals', value: 18, delta: -3 },
  { id: 'data-quality', label: 'Data Quality', value: 97.1, delta: 0.8, unit: '%' },
  { id: 'automation-rate', label: 'Automation Rate', value: 76, delta: 4, unit: '%' }
];

const EQUIPMENT_STATUSES: EquipmentRow['status'][] = ['OK', 'WARN', 'ERROR'];
const EQUIPMENT_LOCATIONS = ['Bucharest', 'Berlin', 'Cluj', 'Prague', 'Warsaw'];

export function mockKpis(): KpiMetric[] {
  return KPI_ENTRIES.map((metric) => ({ ...metric }));
}

export function mockEquipmentRows(count = 200): EquipmentRow[] {
  const total = Math.max(0, Math.floor(count));

  return Array.from({ length: total }, (_, index) => {
    const status = EQUIPMENT_STATUSES[index % EQUIPMENT_STATUSES.length];
    const location = EQUIPMENT_LOCATIONS[index % EQUIPMENT_LOCATIONS.length];
    const day = ((index % 28) + 1).toString().padStart(2, '0');
    const hour = (index % 24).toString().padStart(2, '0');
    const minute = ((index * 7) % 60).toString().padStart(2, '0');
    const updatedAt = `2026-02-${day}T${hour}:${minute}:00Z`;
    const baseScore = 70 + (index % 25);
    const adjustment = (index % 4) * 1.5;
    const score = Number((baseScore + adjustment).toFixed(1));

    return {
      id: `EQ-${(index + 1).toString().padStart(4, '0')}`,
      name: `Equipment ${index + 1}`,
      status,
      location,
      updatedAt,
      score
    } satisfies EquipmentRow;
  });
}

export const defaultConfigState: ConfigFormState = {
  siteName: 'Enterprise Ops Central',
  language: 'en',
  refreshInterval: 15,
  enableAlerts: true,
  threshold: 80
};
