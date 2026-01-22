import { Column, type ColumnProps, FloatingTooltip, useTheme } from '@umami/react-zen';
import { colord } from 'colord';
import { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { useLocale, useMessages, useRegionNames, useWebsiteMetricsQuery } from '@/components/hooks';
import { getThemeColors } from '@/lib/colors';
import { MAP_USA_FILE, US_STATE_FIPS_TO_ABBR } from '@/lib/constants';
import { percentFilter } from '@/lib/filters';
import { formatLongNumber } from '@/lib/format';

export interface UsaMapProps extends ColumnProps {
  websiteId?: string;
  data?: any[];
}

export function UsaMap({ websiteId, data, ...props }: UsaMapProps) {
  const [tooltip, setTooltipPopup] = useState();
  const { theme } = useTheme();
  const { colors } = getThemeColors(theme);
  const { locale } = useLocale();
  const { formatMessage, labels } = useMessages();
  const { regionNames } = useRegionNames();
  const visitorsLabel = formatMessage(labels.visitors).toLocaleLowerCase(locale);
  const unknownLabel = formatMessage(labels.unknown);

  const { data: mapData } = useWebsiteMetricsQuery(websiteId, {
    type: 'region',
  });

  const stateCodes = useMemo(
    () => new Set(Object.values(US_STATE_FIPS_TO_ABBR).map(code => `US-${code}`)),
    [],
  );

  const metrics = useMemo(() => {
    const source = (data || mapData) as any[] | undefined;
    if (!source) return [];
    const filtered = source.filter(item => stateCodes.has(item?.x));
    return percentFilter(filtered);
  }, [data, mapData, stateCodes]);

  const getRegionCode = (fips: string) => {
    const abbr = US_STATE_FIPS_TO_ABBR[fips];
    return abbr ? `US-${abbr}` : null;
  };

  const getFillColor = (regionCode: string | null) => {
    if (!regionCode) {
      return colors.map.fillColor;
    }

    const region = metrics?.find(({ x }) => x === regionCode);

    if (!region) {
      return colors.map.fillColor;
    }

    return colord(colors.map.baseColor)
      [theme === 'light' ? 'lighten' : 'darken'](0.4 * (1.0 - region.z / 100))
      .toHex();
  };

  const handleHover = (regionCode: string | null, fallbackName?: string) => {
    if (!regionCode) return;
    const region = metrics?.find(({ x }) => x === regionCode);
    const regionName = regionNames[regionCode] || fallbackName || unknownLabel;
    setTooltipPopup(`${regionName}: ${formatLongNumber(region?.y || 0)} ${visitorsLabel}` as any);
  };

  return (
    <Column
      {...props}
      data-tip=""
      data-for="usa-map-tooltip"
      style={{ margin: 'auto 0', overflow: 'hidden' }}
    >
      <ComposableMap projection="geoAlbersUsa">
        <Geographies geography={`${process.env.basePath || ''}${MAP_USA_FILE}`}>
          {({ geographies }) => {
            return geographies.map(geo => {
              const regionCode = getRegionCode(String(geo.id));

              if (!regionCode) {
                return null;
              }

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getFillColor(regionCode)}
                  stroke={colors.map.strokeColor}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: colors.map.hoverColor },
                    pressed: { outline: 'none' },
                  }}
                  onMouseOver={() => handleHover(regionCode, geo.properties?.name)}
                  onMouseOut={() => setTooltipPopup(null)}
                />
              );
            });
          }}
        </Geographies>
      </ComposableMap>
      {tooltip && <FloatingTooltip>{tooltip}</FloatingTooltip>}
    </Column>
  );
}
