import { useGetFavoritesQuery, useToggleFavoriteMutation } from '@features/saved/store/savedApi';
import { useExploreNeighborhoods } from '@features/explore/hooks/useExploreNeighborhoods';
import { useToast } from '@shared/context/ToastContext';

interface UseSavedNeighborhoodsReturn {
  data: ReturnType<typeof useExploreNeighborhoods>['data'];
  remove: (id: string) => void;
  isLoading: boolean;
}

export function useSavedNeighborhoods(): UseSavedNeighborhoodsReturn {
  const toast = useToast();
  const { data: favoritesData, isLoading } = useGetFavoritesQuery();
  const [toggleFavorite] = useToggleFavoriteMutation();
  const { data: allNeighborhoods } = useExploreNeighborhoods();

  const favoriteIds = new Map(
    favoritesData?.neighborhoods?.map((n, idx) => [n.id, idx]) ?? [],
  );

  const data = allNeighborhoods
    .filter((n) => favoriteIds.has(n.id))
    .sort((a, b) => (favoriteIds.get(a.id) ?? 0) - (favoriteIds.get(b.id) ?? 0));

  const remove = async (id: string) => {
    try {
      await toggleFavorite(id).unwrap();
      toast.success('Removed from favorites');
    } catch {
      toast.error('Something went wrong, please try again');
    }
  };

  return { data, remove, isLoading };
}