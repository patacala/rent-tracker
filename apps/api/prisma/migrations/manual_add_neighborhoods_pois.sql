-- CreateTable
CREATE TABLE "Neighborhood" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "boundary" JSONB NOT NULL,
    "source" TEXT NOT NULL,
    "centerLat" DOUBLE PRECISION NOT NULL,
    "centerLng" DOUBLE PRECISION NOT NULL,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Neighborhood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "POI" (
    "id" TEXT NOT NULL,
    "neighborhoodId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,
    "mapboxId" TEXT,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "POI_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Neighborhood_centerLat_centerLng_idx" ON "Neighborhood"("centerLat", "centerLng");

-- CreateIndex
CREATE INDEX "Neighborhood_cachedAt_idx" ON "Neighborhood"("cachedAt");

-- CreateIndex
CREATE UNIQUE INDEX "POI_mapboxId_key" ON "POI"("mapboxId");

-- CreateIndex
CREATE INDEX "POI_neighborhoodId_category_idx" ON "POI"("neighborhoodId", "category");

-- CreateIndex
CREATE INDEX "POI_category_idx" ON "POI"("category");

-- CreateIndex
CREATE INDEX "POI_cachedAt_idx" ON "POI"("cachedAt");

-- CreateIndex
CREATE INDEX "POI_latitude_longitude_idx" ON "POI"("latitude", "longitude");

-- AddForeignKey
ALTER TABLE "POI" ADD CONSTRAINT "POI_neighborhoodId_fkey" FOREIGN KEY ("neighborhoodId") REFERENCES "Neighborhood"("id") ON DELETE CASCADE ON UPDATE CASCADE;
