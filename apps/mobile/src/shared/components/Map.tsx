import React, { JSX, ReactNode } from 'react';
import { StyleProp, ViewStyle, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';

const { MapView, Camera, MarkerView } = Mapbox;

// ─── Types ────────────────────────────────────────

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

export interface MapUserLocationProps {
  visible?: boolean;
  animated?: boolean;
  renderMode?: 'normal' | 'native';
  androidRenderMode?: 'normal' | 'compass' | 'gps';
  showsUserHeadingIndicator?: boolean;
  minDisplacement?: number;
}

// ─── Root Component ───────────────────────────────

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

// ─── Camera Component ─────────────────────────────

function MapCamera({
  centerCoordinate,
  zoomLevel,
  defaultSettings,
  minZoomLevel,
  maxZoomLevel,
}: MapCameraProps): JSX.Element {
  // Use defaultSettings if provided, otherwise use direct props
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

// ─── Marker Component ─────────────────────────────

function MapMarker({ id, coordinate, children, onPress }: MapMarkerProps): JSX.Element {
  const MarkerViewComponent = MarkerView as any;

  return (
    <MarkerViewComponent id={id} coordinate={coordinate} onPress={onPress}>
      {(children as React.ReactElement) || <View />}
    </MarkerViewComponent>
  );
}

// ─── Circle Component ─────────────────────────────

function MapCircle(props: MapCircleProps): JSX.Element {
  // TODO: Implement circle using correct Mapbox API
  // Currently not rendering due to ShapeSource/FillLayer/LineLayer import issues
  console.warn('Map.Circle not yet fully implemented', props.id);
  return <View />;
}

// ─── User Location Component ──────────────────────

function MapUserLocation({
  visible = true,
}: MapUserLocationProps): JSX.Element | null {
  if (!visible) return null;

  // TODO: Implement user location using correct Mapbox API
  console.warn('Map.UserLocation not yet fully implemented');
  return null;
}

// ─── Exports ──────────────────────────────────────

export const Map = Object.assign(MapRoot, {
  Camera: MapCamera,
  Marker: MapMarker,
  Circle: MapCircle,
  UserLocation: MapUserLocation,
});
