declare module 'react-simple-maps' {
  import { ReactNode, CSSProperties } from 'react';

  interface ComposableMapProps {
    projection?: string;
    style?: CSSProperties;
    children?: ReactNode;
  }
  export function ComposableMap(props: ComposableMapProps): JSX.Element;

  interface GeographiesProps {
    geography: string;
    children: (args: { geographies: unknown[] }) => ReactNode;
  }
  export function Geographies(props: GeographiesProps): JSX.Element;

  interface GeographyProps {
    key?: string;
    geography: unknown;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: Record<string, unknown>;
  }
  export function Geography(props: GeographyProps): JSX.Element;

  interface MarkerProps {
    coordinates: [number, number];
    children?: ReactNode;
  }
  export function Marker(props: MarkerProps): JSX.Element;

  interface LineProps {
    from: [number, number];
    to: [number, number];
    stroke?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
    strokeLinecap?: string;
  }
  export function Line(props: LineProps): JSX.Element;

  interface ZoomableGroupProps {
    zoom?: number;
    center?: [number, number];
    onMoveEnd?: (position: { zoom: number; coordinates: [number, number] }) => void;
    children?: ReactNode;
  }
  export function ZoomableGroup(props: ZoomableGroupProps): JSX.Element;
}
