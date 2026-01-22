import { MAP_TYPES } from '@/lib/constants';
import { useLink } from './context/useLink';
import { usePixel } from './context/usePixel';
import { useWebsite } from './context/useWebsite';

export function useMapType() {
  const website = useWebsite();
  const link = useLink();
  const pixel = usePixel();

  return website?.mapType || link?.mapType || pixel?.mapType || MAP_TYPES.world;
}
