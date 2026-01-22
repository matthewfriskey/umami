import type { ColumnProps } from '@umami/react-zen';
import { useMapType } from '@/components/hooks/useMapType';
import { MAP_TYPES } from '@/lib/constants';
import { UsaMap } from './UsaMap';
import { WorldMap } from './WorldMap';

export interface LocationMapProps extends ColumnProps {
  websiteId?: string;
  data?: any[];
  mapType?: string;
}

export function LocationMap({ websiteId, data, mapType, ...props }: LocationMapProps) {
  const storedMapType = useMapType();
  const resolvedMapType = mapType || storedMapType;

  if (resolvedMapType === MAP_TYPES.usa) {
    return <UsaMap websiteId={websiteId} data={data} {...props} />;
  }

  return <WorldMap websiteId={websiteId} data={data} {...props} />;
}
