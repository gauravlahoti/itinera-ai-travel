"use client";

import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

interface Props {
  path: google.maps.LatLngLiteral[];
  color?: string;
}

export function MapPolyline({ path, color = "#0F380F" }: Props) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;

    const newPolyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 0.6,
      strokeWeight: 3,
      icons: [{
        icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
        offset: '100%',
        repeat: '100px'
      }]
    });

    newPolyline.setMap(map);

    return () => {
      newPolyline.setMap(null);
    };
  }, [map, path, color]);

  return null;
}
