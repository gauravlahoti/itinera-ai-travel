"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Activity } from "@/types";

// Day route colours (muted palette)
const DAY_COLORS = ["#7C9E87", "#C9622B", "#C8A84B", "#6B90A8", "#8B6B9E", "#708090"];

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  dayIndex: number;
  activity: Activity;
}

interface DayPath {
  positions: [number, number][];
  color: string;
}

interface Props {
  locations: Location[];
  dayPaths: DayPath[];
  hoveredActivityId: string | null;
  onActivitySelect: (activity: Activity) => void;
  center: { lat: number; lng: number };
}

function makeIcon(color: string, hovered: boolean) {
  const size = hovered ? 32 : 24;
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:50% 50% 50% 0;
      background:${color};
      border:2px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
      transform:rotate(-45deg);
      transition:all 0.15s ease;
    "></div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

// Fly to center when it changes
function MapController({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

export function TripMap({ locations, dayPaths, hoveredActivityId, onActivitySelect, center }: Props) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={12}
      style={{ width: "100%", height: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
      />

      <MapController center={center} />

      {/* Day route polylines */}
      {dayPaths.map((day, i) => (
        <Polyline
          key={i}
          positions={day.positions}
          color={day.color}
          weight={3}
          opacity={0.65}
          dashArray="6 4"
        />
      ))}

      {/* Activity markers */}
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.lat, loc.lng]}
          icon={makeIcon(DAY_COLORS[loc.dayIndex % DAY_COLORS.length], hoveredActivityId === loc.id)}
          zIndexOffset={hoveredActivityId === loc.id ? 1000 : 0}
          eventHandlers={{ click: () => onActivitySelect(loc.activity) }}
        >
          <Popup>
            <p className="font-medium text-sm">{loc.name}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
