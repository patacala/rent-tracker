import { useGetNeighborhoodSafetyQuery } from '@features/safety/store/safetyApi';
import { useAuth } from '@shared/context/AuthContext';

export function useNeighborhoodSafety(name: string, lat: number, lng: number) {
  const { isLoggedIn } = useAuth();

  const { data, isLoading, error } = useGetNeighborhoodSafetyQuery(
    { name, lat, lng },
    { skip: !isLoggedIn || !name || !lat || !lng },
  );

  return {
    safety: data?.data ?? null,
    isLoading,
    error,
  };
}