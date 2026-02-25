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

  const favoriteIds = new Set(
    favoritesData?.neighborhoods?.map((n) => n.id) ?? [],
  );

  const data = allNeighborhoods.filter((n) => favoriteIds.has(n.id));

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