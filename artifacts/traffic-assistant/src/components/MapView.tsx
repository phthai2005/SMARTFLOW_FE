import { useEffect, useRef } from "react";
import type { Map, Marker } from "leaflet";

interface MapPoint {
  lat: number;
  lng: number;
  label: string;
  status: "pending" | "approved" | "rejected";
}

interface MapViewProps {
  points: MapPoint[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

const STATUS_COLOR: Record<string, string> = {
  pending: "#f59e0b",
  approved: "#10b981",
  rejected: "#ef4444",
};

export default function MapView({ points, center = [10.7769, 106.7009], zoom = 12, height = "400px" }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!containerRef.current || mapRef.current) return;

      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!isMounted || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    async function updateMarkers() {
      const L = (await import("leaflet")).default;
      const map = mapRef.current;
      if (!map) return;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      points.forEach((point) => {
        const color = STATUS_COLOR[point.status] || "#64748b";
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width: 12px;
            height: 12px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 1px 4px rgba(0,0,0,0.4);
          "></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const marker = L.marker([point.lat, point.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: sans-serif; font-size: 13px; min-width: 140px;">
              <strong>${point.label}</strong><br/>
              <span style="color: ${color}; font-weight: 600;">${
                point.status === "pending" ? "Chờ duyệt" :
                point.status === "approved" ? "Đã duyệt" : "Từ chối"
              }</span><br/>
              <span style="color: #64748b; font-size: 11px;">${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}</span>
            </div>
          `);

        markersRef.current.push(marker);
      });
    }

    updateMarkers();
  }, [points]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: "100%", borderRadius: "0 0 0.5rem 0.5rem" }}
      className="z-0"
    />
  );
}
