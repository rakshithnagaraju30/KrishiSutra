import { farms } from '../api/endpoints';
import { useApi } from '../api/useApi';

/** Loads the farmer's first farm (one farm is enough for most smallholders). */
export function useMyFarm() {
  const list = useApi('farms', () => farms.list());
  const id = list.data?.[0]?.id ?? null;
  const farm = useApi(id ? `farm:${id}` : null, () => farms.get(id!));
  return {
    farm: id ? farm.data : null,
    hasNone: list.data !== null && list.data.length === 0,
    loading: list.loading || farm.loading,
    error: list.error ?? farm.error,
    offline: list.offline || farm.offline,
    reload: () => {
      list.reload();
      farm.reload();
    },
  };
}
