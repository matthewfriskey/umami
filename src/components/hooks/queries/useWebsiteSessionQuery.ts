import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function useWebsiteSessionQuery(websiteId: string, sessionId: string) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`sessions`);

  return useQuery({
    queryKey: ['session', { websiteId, sessionId, modified }],
    queryFn: () => {
      return get(`/websites/${websiteId}/sessions/${sessionId}`);
    },
    enabled: Boolean(websiteId && sessionId),
  });
}
