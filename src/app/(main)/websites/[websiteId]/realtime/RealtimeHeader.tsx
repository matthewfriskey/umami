import { useMapType, useMessages } from '@/components/hooks';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { MAP_TYPES, US_STATE_CODES } from '@/lib/constants';

export function RealtimeHeader({ data }: { data: any }) {
  const { formatMessage, labels } = useMessages();
  const mapType = useMapType();
  const { totals }: any = data || {};
  const stateCodes = new Set(US_STATE_CODES);
  const stateCount = Object.keys(data?.regions || {}).filter(code => stateCodes.has(code)).length;
  const locationLabel = mapType === MAP_TYPES.usa ? labels.states : labels.countries;
  const locationValue = mapType === MAP_TYPES.usa ? stateCount : totals.countries;

  return (
    <MetricsBar>
      <MetricCard label={formatMessage(labels.views)} value={totals.views} />
      <MetricCard label={formatMessage(labels.visitors)} value={totals.visitors} />
      <MetricCard label={formatMessage(labels.events)} value={totals.events} />
      <MetricCard label={formatMessage(locationLabel)} value={locationValue} />
    </MetricsBar>
  );
}
