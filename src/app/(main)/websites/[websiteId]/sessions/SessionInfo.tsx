import { Column, Grid, Icon, Label, Row } from '@umami/react-zen';
import type { ReactNode } from 'react';
import { DateDistance } from '@/components/common/DateDistance';
import { TypeIcon } from '@/components/common/TypeIcon';
import { useFormat, useLocale, useMapType, useMessages, useRegionNames } from '@/components/hooks';
import { Calendar, KeyRound, Landmark, MapPin } from '@/components/icons';
import { MAP_TYPES } from '@/lib/constants';

export function SessionInfo({ data }) {
  const { locale } = useLocale();
  const { t, labels } = useMessages();
  const { formatCity, formatValue } = useFormat();
  const { getRegionName, regionNames } = useRegionNames(locale);
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
      <Info label={t(labels.distinctId)} icon={<KeyRound />}>
        {data?.distinctId}
      </Info>

      <Info label={t(labels.lastSeen)} icon={<Calendar />}>
        <DateDistance date={new Date(data.lastAt)} />
      </Info>

      <Info label={t(labels.firstSeen)} icon={<Calendar />}>
        <DateDistance date={new Date(data.firstAt)} />
      </Info>

      {showState ? (
        <>
          <Info label={t(labels.state)} icon={<TypeIcon type="country" value={data?.country} />}>
            {stateName}
          </Info>
          <Info label={t(labels.country)} icon={<TypeIcon type="country" value={data?.country} />}>
            {countryName}
          </Info>
        </>
      ) : (
        <>
          <Info label={t(labels.country)} icon={<TypeIcon type="country" value={data?.country} />}>
            {countryName}
          </Info>
          <Info label={t(labels.region)} icon={<MapPin />}>
            {getRegionName(data?.region, data?.country)}
          </Info>
        </>
      )}

      <Info label={t(labels.city)} icon={<Landmark />}>
        {data?.city ? formatCity(data.city, data.country, data.region) : null}
      </Info>

      <Info label={t(labels.browser)} icon={<TypeIcon type="browser" value={data?.browser} />}>
        {formatValue(data?.browser, 'browser')}
      </Info>

      <Info
        label={t(labels.os)}
        icon={<TypeIcon type="os" value={data?.os?.toLowerCase()?.replaceAll(/\W/g, '-')} />}
      >
        {formatValue(data?.os, 'os')}
      </Info>

      <Info label={t(labels.device)} icon={<TypeIcon type="device" value={data?.device} />}>
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
