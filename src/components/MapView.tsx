import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

// Professional marker icon with indigo pulse
const primaryIcon = new L.DivIcon({
  className: "custom-leaflet-marker",
  html: `<div class="marker-pulse"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

// Vibrant amber marker for comparison
const compareIcon = new L.DivIcon({
  className: "custom-leaflet-marker",
  html: `<div class="marker-pulse marker-compare"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

interface MapMarker {
  lat: number;
  lon: number;
  label: string;
  sublabel?: string;
  isCompare?: boolean;
}

function FlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length >= 2) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lon]));
      map.flyToBounds(bounds, { padding: [60, 60], animate: true, duration: 1.5 });
    }
  }, [markers, map]);
  return null;
}

interface MapViewProps {
  markers: MapMarker[];
  zoom?: number;
  height?: string;
}

export default function MapView({ markers, zoom = 12, height = "100%" }: MapViewProps) {
  if (!markers.length) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-sm" style={{ minHeight: 300 }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p>Search an IP to display on the map</p>
        </div>
      </div>
    );
  }

  const center: [number, number] = [markers[0].lat, markers[0].lon];

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height, width: "100%", zIndex: 10, background: '#f8f9fa', borderRadius: 'inherit' }}
    >
      {markers.length >= 2 ? (
        <FitBounds markers={markers} />
      ) : (
        <FlyTo center={center} zoom={zoom} />
      )}

      {/* CARTO Positron - Ultra-Light Theme for High Contrast */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
      />

      {markers.map((marker, i) => (
        <Marker
          key={`${marker.lat}-${marker.lon}-${i}`}
          position={[marker.lat, marker.lon]}
          icon={marker.isCompare ? compareIcon : primaryIcon}
        >
          <Popup>
            <div className="text-center min-w-[120px]">
              <p className="font-semibold text-brand-dark text-sm mb-0.5">{marker.label}</p>
              {marker.sublabel && (
                <p className="text-indigo-600 font-mono text-xs">{marker.sublabel}</p>
              )}
              <p className="text-slate-500 font-mono text-[10px] mt-1">
                {marker.lat.toFixed(4)}, {marker.lon.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export type { MapMarker };
