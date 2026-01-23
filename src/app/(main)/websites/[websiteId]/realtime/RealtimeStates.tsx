import { useCallback } from 'react';
import { useMessages, useRegionNames } from '@/components/hooks';
import { ListTable } from '@/components/metrics/ListTable';

const OUTSIDE_USA_KEY = '__outside__';

export function RealtimeStates({ data }) {
  const { t, labels } = useMessages();
  const { regionNames } = useRegionNames();

  const renderStateName = useCallback(
    ({ label: code }) => {
      if (code === OUTSIDE_USA_KEY) {
        return t(labels.outsideUsa);
      }

      return regionNames[code] || code;
    },
    [t, labels.outsideUsa, regionNames],
  );

  return (
    <ListTable
      title={t(labels.states)}
      metric={t(labels.visitors)}
      data={data.map(({ x, y, z }: { x: string; y: number; z: number }) => ({
        label: x,
        count: y,
        percent: z,
      }))}
      renderLabel={renderStateName}
    />
  );
}
