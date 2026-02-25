import React, { JSX, ReactNode, useMemo } from 'react';
import { StyleProp, ViewStyle, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';

const { MapView, Camera, MarkerView, ShapeSource, FillLayer, LineLayer, UserLocation } = Mapbox as any;

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface MapRootProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  styleURL?: string;
  onPress?: (feature: any) => void;
  onLongPress?: (feature: any) => void;
}

export interface MapCameraProps {
  centerCoordinate?: [number, number];
  zoomLevel?: number;
  defaultSettings?: {
    centerCoordinate?: [number, number];
    zoomLevel?: number;
    pitch?: number;
    heading?: number;
  };
  minZoomLevel?: number;
  maxZoomLevel?: number;
}

export interface MapMarkerProps {
  id: string;
  coordinate: [number, number];
  children?: ReactNode;
  onPress?: () => void;
  anchor?: { x: number; y: number };
}

export interface MapCircleProps {
  id: string;
  centerCoordinate: [number, number];
  radiusInMeters: number;
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
}

export interface MapPolygonProps {
  id: string;
  /** GeoJSON Polygon geometry to render */
  polygon: any;
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
}

export interface MapUserLocationProps {
  visible?: boolean;
  animated?: boolean;
  renderMode?: 'normal' | 'native';
  androidRenderMode?: 'normal' | 'compass' | 'gps';
  showsUserHeadingIndicator?: boolean;
  minDisplacement?: number;
}

function createCircleGeoJSON(
  center: [number, number],
  radiusInMeters: number,
  points = 64,
): GeoJSON.Feature {
  const distanceX = radiusInMeters / (111320 * Math.cos((center[1] * Math.PI) / 180));
  const distanceY = radiusInMeters / 110574;
  const coords: number[][] = [];

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    coords.push([center[0] + distanceX * Math.cos(theta), center[1] + distanceY * Math.sin(theta)]);
  }
  coords.push(coords[0]);

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [coords] },
  };
}

function MapRoot({ children, style, styleURL, onPress, onLongPress }: MapRootProps): JSX.Element {
  const MapViewComponent = MapView as any;

  return (
    <MapViewComponent
      style={style}
      styleURL={styleURL || Mapbox.StyleURL.Street}
      onPress={onPress}
      onLongPress={onLongPress}
      logoEnabled={false}
      attributionEnabled={false}
      scaleBarEnabled={false}
    >
      {children as React.ReactElement}
    </MapViewComponent>
  );
}

function MapCamera({
  centerCoordinate,
  zoomLevel,
  defaultSettings,
  minZoomLevel,
  maxZoomLevel,
}: MapCameraProps): JSX.Element {
  const finalCenter = defaultSettings?.centerCoordinate || centerCoordinate;
  const finalZoom = defaultSettings?.zoomLevel || zoomLevel;

  return (
    <Camera
      centerCoordinate={finalCenter}
      zoomLevel={finalZoom}
      minZoomLevel={minZoomLevel}
      maxZoomLevel={maxZoomLevel}
    />
  );
}

function MapMarker({ id, coordinate, children, onPress }: MapMarkerProps): JSX.Element {
  const MarkerViewComponent = MarkerView as any;

  return (
    <MarkerViewComponent id={id} coordinate={coordinate} onPress={onPress}>
      {(children as React.ReactElement) || <View />}
    </MarkerViewComponent>
  );
}

function MapCircle({
  id,
  centerCoordinate,
  radiusInMeters,
  fillColor = 'rgba(0, 122, 255, 0.2)',
  fillOpacity = 1,
  strokeColor = '#007AFF',
  strokeWidth = 2,
  strokeOpacity = 1,
}: MapCircleProps): JSX.Element {
  const shape = createCircleGeoJSON(centerCoordinate, radiusInMeters);

  return (
    <ShapeSource id={`${id}-source`} shape={shape}>
      <FillLayer
        id={`${id}-fill`}
        style={{ fillColor, fillOpacity }}
      />
      <LineLayer
        id={`${id}-stroke`}
        style={{ lineColor: strokeColor, lineWidth: strokeWidth, lineOpacity: strokeOpacity }}
      />
    </ShapeSource>
  );
}

export function MapPolygon({
  id,
  polygon,
  fillColor = 'rgba(37, 99, 235, 0.12)',
  fillOpacity = 1,
  strokeColor = '#2563EB',
  strokeWidth = 2,
  strokeOpacity = 0.8,
}: MapPolygonProps): JSX.Element {
  // Memoize so ShapeSource receives a stable reference and doesn't re-mount on every render
  const shape = useMemo(() => ({
    type: 'Feature' as const,
    properties: {},
    geometry: polygon,
  }), [polygon]);

  return (
    <ShapeSource id={`${id}-source`} shape={shape}>
      <FillLayer
        id={`${id}-fill`}
        style={{ fillColor, fillOpacity }}
      />
      <LineLayer
        id={`${id}-stroke`}
        style={{ lineColor: strokeColor, lineWidth: strokeWidth, lineOpacity: strokeOpacity }}
      />
    </ShapeSource>
  );
}

function MapUserLocation({
  visible = true,
  animated = true,
  renderMode,
  androidRenderMode,
  showsUserHeadingIndicator,
  minDisplacement,
}: MapUserLocationProps): JSX.Element | null {
  if (!visible) return null;

  return (
    <UserLocation
      visible={visible}
      animated={animated}
      renderMode={renderMode}
      androidRenderMode={androidRenderMode}
      showsUserHeadingIndicator={showsUserHeadingIndicator}
      minDisplacement={minDisplacement}
    />
  );
}

export const Map = Object.assign(MapRoot, {
  Camera: MapCamera,
  Marker: MapMarker,
  Circle: MapCircle,
  Polygon: MapPolygon,
  UserLocation: MapUserLocation,
});
