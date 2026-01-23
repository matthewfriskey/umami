'use client';
import { Grid } from '@umami/react-zen';
import { firstBy } from 'thenby';
import { GridRow } from '@/components/common/GridRow';
import { PageBody } from '@/components/common/PageBody';
import { Panel } from '@/components/common/Panel';
import { useMapType, useMobile, useRealtimeQuery } from '@/components/hooks';
import { LocationMap } from '@/components/metrics/LocationMap';
import { RealtimeChart } from '@/components/metrics/RealtimeChart';
import { MAP_TYPES, US_STATE_CODES } from '@/lib/constants';
import { percentFilter } from '@/lib/filters';
import { RealtimeCountries } from './RealtimeCountries';
import { RealtimeHeader } from './RealtimeHeader';
import { RealtimeLog } from './RealtimeLog';
import { RealtimePaths } from './RealtimePaths';
import { RealtimeReferrers } from './RealtimeReferrers';
import { RealtimeStates } from './RealtimeStates';

const OUTSIDE_USA_KEY = '__outside__';

export function RealtimePage({ websiteId }: { websiteId: string }) {
  const { data, isLoading, error } = useRealtimeQuery(websiteId);
  const { isMobile } = useMobile();
  const mapType = useMapType();
  const stateCodes = new Set(US_STATE_CODES);

  if (isLoading || error) {
    return <PageBody isLoading={isLoading} error={error} />;
  }

  const countries = percentFilter(
    Object.keys(data.countries)
      .map(key => ({ x: key, y: data.countries[key] }))
      .sort(firstBy('y', -1)),
  );
  const stateRows = Object.keys(data.regions || {})
    .filter(key => stateCodes.has(key))
    .map(key => ({ x: key, y: data.regions[key] }))
    .sort(firstBy('y', -1));
  const outsideCount = Object.keys(data.countries || {}).reduce((sum, key) => {
    if (key && key !== 'US') {
      return sum + data.countries[key];
    }
    return sum;
  }, 0);
  const stateListData = percentFilter([
    ...stateRows,
    ...(outsideCount ? [{ x: OUTSIDE_USA_KEY, y: outsideCount }] : []),
  ]);
  const stateMapData = percentFilter(stateRows);
  const mapData = mapType === MAP_TYPES.usa ? stateMapData : countries;

  return (
    <Grid gap="3">
      <RealtimeHeader data={data} />
      <Panel>
        <RealtimeChart data={data} unit="minute" />
      </Panel>
      <Panel>
        <RealtimeLog data={data} />
      </Panel>
      <GridRow layout="two">
        <Panel>
          <RealtimePaths data={data} />
        </Panel>
        <Panel>
          <RealtimeReferrers data={data} />
        </Panel>
      </GridRow>
      <GridRow layout="one-two">
        <Panel>
          {mapType === MAP_TYPES.usa ? (
            <RealtimeStates data={stateListData} />
          ) : (
            <RealtimeCountries data={countries} />
          )}
        </Panel>
        <Panel gridColumn={isMobile ? null : 'span 2'} padding="0">
          <LocationMap data={mapData} mapType={mapType} />
        </Panel>
      </GridRow>
    </Grid>
  );
}
