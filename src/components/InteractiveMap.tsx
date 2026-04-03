import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

const customIcon = new L.DivIcon({
  className: "custom-leaflet-marker",
  html: `<div class="marker-pulse"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12, { animate: true, duration: 1.5 });
  }, [center, map]);
  return null;
}

export default function InteractiveMap({ lat, lon, city }: { lat: number, lon: number, city: string }) {
  if (!lat || !lon) return null;

  return (
    <MapContainer 
      center={[lat, lon]} 
      zoom={12} 
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", zIndex: 10, background: '#020617' }}
    >
      <ChangeView center={[lat, lon]} />
      <TileLayer
        url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        attribution="&copy; Google Maps"
      />
      <Marker position={[lat, lon]} icon={customIcon}>
        <Popup className="bg-brand-dark/90 text-white rounded-lg border border-brand-border">
          <div className="font-semibold text-center text-black">
            {city}<br/>
            <span className="text-blue-600 font-mono" style={{fontSize: "12px"}}>{lat.toFixed(4)}, {lon.toFixed(4)}</span>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
