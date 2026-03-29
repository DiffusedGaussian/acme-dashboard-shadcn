import { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup } from 'react-simple-maps';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import type { CallRecord } from '../../types';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

const CITY_COORDS: Record<string, [number, number]> = {
  'Dallas':        [-96.797,  32.776],
  'Atlanta':       [-84.388,  33.749],
  'Chicago':       [-87.629,  41.878],
  'Denver':        [-104.990, 39.739],
  'Houston':       [-95.370,  29.760],
  'Phoenix':       [-112.074, 33.449],
  'Los Angeles':   [-118.243, 34.052],
  'Seattle':       [-122.332, 47.606],
  'Miami':         [-80.192,  25.775],
  'New York':      [-74.006,  40.712],
  'Nashville':     [-86.781,  36.163],
  'Memphis':       [-90.048,  35.150],
  'Portland':      [-122.676, 45.523],
  'San Francisco': [-122.419, 37.775],
  'Kansas City':   [-94.579,  39.100],
  'Minneapolis':   [-93.265,  44.978],
};

const ALL_LANES: Array<{ from: string; to: string }> = [
  { from: 'Dallas',       to: 'Atlanta'       },
  { from: 'Chicago',      to: 'Denver'        },
  { from: 'Houston',      to: 'Phoenix'       },
  { from: 'Los Angeles',  to: 'Seattle'       },
  { from: 'Miami',        to: 'New York'      },
  { from: 'Atlanta',      to: 'Dallas'        },
  { from: 'Nashville',    to: 'Memphis'       },
  { from: 'Portland',     to: 'San Francisco' },
  { from: 'Kansas City',  to: 'Minneapolis'   },
];

interface NetworkExplorerProps {
  calls: CallRecord[];
  selectedCall: CallRecord | null;
}

export function NetworkExplorer({ calls, selectedCall }: NetworkExplorerProps) {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([-96, 38]);

  useEffect(() => {
    if (selectedCall?.origin_city && selectedCall?.destination_city) {
      const from = CITY_COORDS[selectedCall.origin_city];
      const to   = CITY_COORDS[selectedCall.destination_city];
      if (from && to) {
        setCenter([(from[0] + to[0]) / 2, (from[1] + to[1]) / 2]);
        setZoom(3);
        return;
      }
    }
    setCenter([-96, 38]);
    setZoom(1);
  }, [selectedCall]);

  const bookedRoutes = calls
    .filter(
      c =>
        (c.outcome === 'load_booked' || c.outcome === 'price_agreed_transfer') &&
        c.origin_city &&
        c.destination_city
    )
    .reduce(
      (acc, c) => {
        const key = `${c.origin_city}→${c.destination_city}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

  // Compute close rate per lane for color encoding
  const laneStats = calls
    .filter(c => c.origin_city && c.destination_city)
    .reduce(
      (acc, c) => {
        const key = `${c.origin_city}→${c.destination_city}`;
        if (!acc[key]) acc[key] = { total: 0, booked: 0 };
        acc[key].total++;
        if (c.outcome === 'load_booked' || c.outcome === 'price_agreed_transfer') {
          acc[key].booked++;
        }
        return acc;
      },
      {} as Record<string, { total: number; booked: number }>
    );

  const cityActivity = calls.reduce(
    (acc, c) => {
      if (c.origin_city)      acc[c.origin_city]      = (acc[c.origin_city]      || 0) + 1;
      if (c.destination_city) acc[c.destination_city] = (acc[c.destination_city] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const selectedRouteKey =
    selectedCall?.origin_city && selectedCall?.destination_city
      ? `${selectedCall.origin_city}→${selectedCall.destination_city}`
      : null;
  const hasSelection = !!selectedCall;

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-semibold">Network Explorer</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {selectedCall?.origin_city
                ? `Showing: ${selectedCall.origin_city} → ${selectedCall.destination_city} · ${selectedCall.carrier_name}`
                : `${Object.keys(bookedRoutes).length} active lanes · ${Object.values(bookedRoutes).reduce((a, b) => a + b, 0)} bookings · line weight = volume`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-4 text-xs mr-2">
              <div className="flex items-center gap-1.5">
                <div className="h-0.5 w-5 bg-border rounded" />
                <span className="text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-0.5 w-5 rounded" style={{ backgroundColor: '#00C853' }} />
                <span className="text-muted-foreground">High close rate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-0.5 w-5 rounded" style={{ backgroundColor: '#F05A28' }} />
                <span className="text-muted-foreground">Low close rate</span>
              </div>
              {hasSelection && (
                <div className="flex items-center gap-1.5">
                  <div className="h-0.5 w-5 rounded" style={{ backgroundColor: '#00C853' }} />
                  <span className="text-muted-foreground">Selected</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setZoom(z => Math.min(z + 0.8, 8))}
              className="h-7 w-7 flex items-center justify-center rounded border bg-background hover:bg-muted transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(z - 0.8, 1))}
              className="h-7 w-7 flex items-center justify-center rounded border bg-background hover:bg-muted transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => { setZoom(1); setCenter([-96, 38]); }}
              className="h-7 w-7 flex items-center justify-center rounded border bg-background hover:bg-muted transition-colors"
              title="Reset view"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <ComposableMap projection="geoAlbersUsa" style={{ width: '100%', height: '400px' }}>
          <ZoomableGroup
            zoom={zoom}
            center={center}
            onMoveEnd={({ zoom: z, coordinates: c }) => { setZoom(z); setCenter(c); }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                (geographies as Array<{ rsmKey: string }>).map(geo => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="hsl(var(--muted))"
                    stroke="hsl(var(--border))"
                    strokeWidth={0.5}
                    style={{ outline: 'none' }}
                  />
                ))
              }
            </Geographies>

            {/* Available lanes — shown faintly */}
            {ALL_LANES.map(({ from, to }) => {
              const f = CITY_COORDS[from], t = CITY_COORDS[to];
              if (!f || !t) return null;
              const isSelected = selectedRouteKey === `${from}→${to}`;
              return (
                <Line
                  key={`avail-${from}-${to}`}
                  from={f} to={t}
                  stroke="hsl(var(--border))"
                  strokeWidth={isSelected ? 1 : 0.8}
                  strokeOpacity={hasSelection && !isSelected ? 0.2 : 0.6}
                />
              );
            })}

            {/* Booked routes — thickness = volume, color = close rate */}
            {Object.entries(bookedRoutes).map(([key, count]) => {
              const [from, to] = key.split('→');
              const f = CITY_COORDS[from], t = CITY_COORDS[to];
              if (!f || !t) return null;
              const isSelected = selectedRouteKey === key;
              const dimmed = hasSelection && !isSelected;
              const stats = laneStats[key];
              const closeRate = stats ? stats.booked / stats.total : 0;
              // Color: emerald for high close rate, amber for low
              const laneColor = isSelected
                ? '#00C853'
                : closeRate >= 0.5 ? '#00C853' : '#F05A28';

              return (
                <Line
                  key={`booked-${key}`}
                  from={f} to={t}
                  stroke={laneColor}
                  strokeWidth={isSelected ? Math.min(2 + count, 6) : Math.min(1.5 + count * 0.5, 4)}
                  strokeOpacity={dimmed ? 0.15 : 0.9}
                />
              );
            })}

            {/* City markers */}
            {Object.entries(CITY_COORDS).map(([city, coords]) => {
              const activity = cityActivity[city] || 0;
              const isEndpoint =
                selectedCall?.origin_city === city || selectedCall?.destination_city === city;
              const dimmed = hasSelection && !isEndpoint;
              const r = isEndpoint ? 6 : activity > 0 ? Math.min(3 + activity * 0.5, 7) : 2.5;
              const fill = isEndpoint
                ? '#00C853'
                : activity > 0 ? '#F05A28' : 'hsl(var(--muted-foreground))';
              return (
                <Marker key={city} coordinates={coords}>
                  <circle
                    r={r}
                    fill={fill}
                    fillOpacity={dimmed ? 0.15 : 0.9}
                    stroke="#fff"
                    strokeWidth={0.8}
                  />
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  );
}
