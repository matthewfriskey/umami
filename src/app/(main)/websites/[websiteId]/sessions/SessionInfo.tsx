import { Column, Grid, Icon, Label, Row } from '@umami/react-zen';
import type { ReactNode } from 'react';
import { DateDistance } from '@/components/common/DateDistance';
import { TypeIcon } from '@/components/common/TypeIcon';
import { useFormat, useMapType, useMessages, useRegionNames } from '@/components/hooks';
import { Calendar, KeyRound, Landmark, MapPin } from '@/components/icons';
import { MAP_TYPES } from '@/lib/constants';

export function SessionInfo({ data }) {
  const { formatMessage, labels } = useMessages();
  const { formatCity, formatValue } = useFormat();
  const { getRegionName, regionNames } = useRegionNames();
  const mapType = useMapType();
  const countryName = formatValue(data?.country, 'country');
  const regionCode = data?.region
    ? data?.region.includes('-')
      ? data?.region
      : `${data?.country || 'US'}-${data?.region}`
    : null;
  const stateName = regionCode ? regionNames[regionCode] : null;
  const showState = mapType === MAP_TYPES.usa && data?.country === 'US' && !!stateName;

  return (
    <Grid columns="repeat(auto-fit, minmax(200px, 1fr)" gap>
      <Info label={formatMessage(labels.distinctId)} icon={<KeyRound />}>
        {data?.distinctId}
      </Info>

      <Info label={formatMessage(labels.lastSeen)} icon={<Calendar />}>
        <DateDistance date={new Date(data.lastAt)} />
      </Info>

      <Info label={formatMessage(labels.firstSeen)} icon={<Calendar />}>
        <DateDistance date={new Date(data.firstAt)} />
      </Info>

      {showState ? (
        <>
          <Info
            label={formatMessage(labels.state)}
            icon={<TypeIcon type="country" value={data?.country} />}
          >
            {stateName}
          </Info>
          <Info
            label={formatMessage(labels.country)}
            icon={<TypeIcon type="country" value={data?.country} />}
          >
            {countryName}
          </Info>
        </>
      ) : (
        <>
          <Info
            label={formatMessage(labels.country)}
            icon={<TypeIcon type="country" value={data?.country} />}
          >
            {countryName}
          </Info>
          <Info label={formatMessage(labels.region)} icon={<MapPin />}>
            {getRegionName(data?.region)}
          </Info>
        </>
      )}

      <Info label={formatMessage(labels.city)} icon={<Landmark />}>
        {data?.city ? formatCity(data.city, data.country, data.region) : null}
      </Info>

      <Info
        label={formatMessage(labels.browser)}
        icon={<TypeIcon type="browser" value={data?.browser} />}
      >
        {formatValue(data?.browser, 'browser')}
      </Info>

      <Info
        label={formatMessage(labels.os)}
        icon={<TypeIcon type="os" value={data?.os?.toLowerCase()?.replaceAll(/\W/g, '-')} />}
      >
        {formatValue(data?.os, 'os')}
      </Info>

      <Info
        label={formatMessage(labels.device)}
        icon={<TypeIcon type="device" value={data?.device} />}
      >
        {formatValue(data?.device, 'device')}
      </Info>
    </Grid>
  );
}

const Info = ({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}) => {
  return (
    <Column>
      <Label>{label}</Label>
      <Row alignItems="center" gap>
        {icon && <Icon>{icon}</Icon>}
        {children || '—'}
      </Row>
    </Column>
  );
};
