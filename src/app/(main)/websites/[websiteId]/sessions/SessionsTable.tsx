import { DataColumn, DataTable, type DataTableProps } from '@umami/react-zen';
import Link from '@/components/common/Link';
import { Avatar } from '@/components/common/Avatar';
import { DateDistance } from '@/components/common/DateDistance';
import { TypeIcon } from '@/components/common/TypeIcon';
import { useFormat, useLocale, useMapType, useMessages, useRegionNames } from '@/components/hooks';
import { MAP_TYPES } from '@/lib/constants';

export function SessionsTable({
  websiteId,
  getSessionHref,
  ...props
}: DataTableProps & { websiteId: string; getSessionHref?: (row: any) => string }) {
  const { t, labels } = useMessages();
  const { formatValue } = useFormat();
  const { locale } = useLocale();
  const { regionNames } = useRegionNames(locale);
  const mapType = useMapType();
  const locationLabel = mapType === MAP_TYPES.usa ? labels.state : labels.country;
  const getLocationName = (country: string, region: string) => {
    if (mapType === MAP_TYPES.usa && country === 'US') {
      const regionCode = region?.includes('-') ? region : region ? `US-${region}` : null;
      const stateName = regionCode ? regionNames[regionCode] : null;
      if (stateName) {
        return stateName;
      }
    }

    return formatValue(country, 'country');
  };

  return (
    <DataTable {...props}>
      <DataColumn id="id" label={t(labels.session)} width="100px">
        {(row: any) => (
          <Link href={getSessionHref ? getSessionHref(row) : `/websites/${websiteId}/sessions/${row.id}`}>
            <Avatar seed={row.id} size={32} />
          </Link>
        )}
      </DataColumn>
      <DataColumn id="visits" label={t(labels.visits)} width="80px" />
      <DataColumn id="views" label={t(labels.views)} width="80px" />
      <DataColumn id="events" label={t(labels.events)} width="80px" />
      <DataColumn id="location" label={t(locationLabel)}>
        {(row: any) => (
          <TypeIcon type="country" value={row.country}>
            {row.city ? `${row.city}, ` : ''}
            {getLocationName(row.country, row.region)}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="browser" label={t(labels.browser)} width="140px">
        {(row: any) => (
          <TypeIcon type="browser" value={row.browser}>
            {formatValue(row.browser, 'browser')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="os" label={t(labels.os)} width="140px">
        {(row: any) => (
          <TypeIcon type="os" value={row.os}>
            {formatValue(row.os, 'os')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="device" label={t(labels.device)} width="140px">
        {(row: any) => (
          <TypeIcon type="device" value={row.device}>
            {formatValue(row.device, 'device')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="lastAt" label={t(labels.lastSeen)} width="140px">
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
    </DataTable>
  );
}
