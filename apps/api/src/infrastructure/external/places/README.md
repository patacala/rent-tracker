# Google Places Integration (Future)

This folder is prepared for the real Google Places API client.

## When to implement:
1. Replace `MockPlacesService` with `GooglePlacesService`
2. Install: `pnpm add @googlemaps/google-maps-services-js`
3. Set `GOOGLE_PLACES_API_KEY` in `.env`

## Interface to implement:
`IPlacesService` — see `apps/api/src/domain/services/external-services.interface.ts`

## Swap in module:
`infrastructure.module.ts` → change provider from `MockPlacesService` to `GooglePlacesService`
