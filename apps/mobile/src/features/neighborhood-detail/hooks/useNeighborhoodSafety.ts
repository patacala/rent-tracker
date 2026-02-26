import { useGetNeighborhoodSafetyQuery } from '@features/safety/store/safetyApi';
import { useAuth } from '@shared/context/AuthContext';

export function useNeighborhoodSafety(neighborhoodId: string, lat: number, lng: number) {
  const { isLoggedIn } = useAuth();

  const { data, isLoading, error } = useGetNeighborhoodSafetyQuery(
    { neighborhoodId, lat, lng },
    { skip: !isLoggedIn || !neighborhoodId || !lat || !lng },
  );

  return {
    safety: data?.data ?? null,
    isLoading,
    error,
  };
}