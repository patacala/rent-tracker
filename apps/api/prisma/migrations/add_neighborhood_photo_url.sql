-- Add photoUrl column to Neighborhood table for Google Street View caching
ALTER TABLE "Neighborhood" ADD COLUMN IF NOT EXISTS "photoUrl" TEXT;
