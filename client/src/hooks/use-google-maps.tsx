import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface UseGoogleMapsOptions {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export function useGoogleMaps(options: UseGoogleMapsOptions = {}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address?: string;
  } | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then(() => {
      if (!mapRef.current) return;

      const mapInstance = new google.maps.Map(mapRef.current, {
        center: options.center || { lat: 5.6037, lng: -0.1870 }, // Default to Accra
        zoom: options.zoom || 12,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      setMap(mapInstance);

      // Create marker
      const markerInstance = new google.maps.Marker({
        map: mapInstance,
        draggable: true,
        position: options.center || { lat: 5.6037, lng: -0.1870 }
      });

      setMarker(markerInstance);

      // Handle marker drag events
      markerInstance.addListener('dragend', () => {
        const position = markerInstance.getPosition();
        if (position) {
          const lat = position.lat();
          const lng = position.lng();
          updateLocationInfo({ lat, lng });
        }
      });

      // Initialize search box if ref exists
      if (searchBoxRef.current) {
        const searchBox = new google.maps.places.SearchBox(searchBoxRef.current);
        
        mapInstance.addListener('bounds_changed', () => {
          searchBox.setBounds(mapInstance.getBounds() as google.maps.LatLngBounds);
        });

        searchBox.addListener('places_changed', () => {
          const places = searchBox.getPlaces();
          if (!places || places.length === 0) return;

          const place = places[0];
          if (!place.geometry || !place.geometry.location) return;

          // Update map and marker
          mapInstance.setCenter(place.geometry.location);
          markerInstance.setPosition(place.geometry.location);

          // Update selected location
          updateLocationInfo({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address
          });

          if (options.onPlaceSelect) {
            options.onPlaceSelect(place);
          }
        });
      }
    });
  }, [options.center, options.zoom]);

  const updateLocationInfo = async (location: { lat: number; lng: number; address?: string }) => {
    if (!location.address) {
      try {
        const geocoder = new google.maps.Geocoder();
        const result = await geocoder.geocode({
          location: { lat: location.lat, lng: location.lng }
        });
        
        if (result.results[0]) {
          location.address = result.results[0].formatted_address;
        }
      } catch (error) {
        console.error('Geocoding failed:', error);
      }
    }
    
    setSelectedLocation(location);
  };

  const panTo = (lat: number, lng: number) => {
    if (map && marker) {
      const position = new google.maps.LatLng(lat, lng);
      map.panTo(position);
      marker.setPosition(position);
      updateLocationInfo({ lat, lng });
    }
  };

  return {
    mapRef,
    searchBoxRef,
    map,
    marker,
    selectedLocation,
    panTo
  };
}