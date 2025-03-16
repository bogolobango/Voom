import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  initialCoordinates?: [number, number];
  height?: string;
  draggableMarker?: boolean;
  zoom?: number;
  readOnly?: boolean;
}

export function MapComponent({
  onLocationSelect,
  initialCoordinates = [40.7128, -74.0060], // Default coordinates
  height = "300px",
  draggableMarker = true,
  zoom = 13,
  readOnly = false,
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [address, setAddress] = useState<string>("");

  // Fix Leaflet icon issue
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView(initialCoordinates, zoom);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Add initial marker
      const marker = L.marker(initialCoordinates, { draggable: draggableMarker && !readOnly }).addTo(map);
      markerRef.current = marker;
      
      if (draggableMarker && !readOnly) {
        // Handle marker drag events
        marker.on('dragend', async function() {
          const position = marker.getLatLng();
          
          try {
            // Since we don't have Google Maps API for reverse geocoding,
            // we'll use coordinates as the address for now
            const addressText = `Location at ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
            setAddress(addressText);
            
            if (onLocationSelect) {
              onLocationSelect(position.lat, position.lng, addressText);
            }
          } catch (error) {
            console.error("Error handling location:", error);
          }
        });
      }
      
      // Handle map click events (if not readonly)
      if (!readOnly) {
        map.on('click', async function(e) {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          
          try {
            // Use coordinates as the address for now
            const addressText = `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            setAddress(addressText);
            
            if (onLocationSelect) {
              onLocationSelect(lat, lng, addressText);
            }
          } catch (error) {
            console.error("Error handling location:", error);
          }
        });
      }
      
      mapRef.current = map;
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initialCoordinates, zoom, draggableMarker, readOnly, onLocationSelect]);
  
  return (
    <div>
      <div ref={mapContainerRef} style={{ height, width: "100%" }} />
      {address && !readOnly && (
        <div className="mt-2 text-sm text-gray-600">
          Selected location: {address}
        </div>
      )}
    </div>
  );
}