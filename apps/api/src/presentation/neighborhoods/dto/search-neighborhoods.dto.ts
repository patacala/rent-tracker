import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { GeoJSON } from 'geojson';

export class SearchNeighborhoodsDto {
  @ApiProperty({
    description: 'GeoJSON Polygon to search within',
    example: {
      type: 'Polygon',
      coordinates: [
        [
          [-80.2, 25.7],
          [-80.1, 25.7],
          [-80.1, 25.8],
          [-80.2, 25.8],
          [-80.2, 25.7],
        ],
      ],
    },
  })
  @IsObject()
  polygon: GeoJSON.Polygon;
}
