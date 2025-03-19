import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { countries, getCountryByCoordinates, getNearestCity, getNearestAirport } from '@/lib/locations';

// Make sure this env variable is available
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export interface MapLocation {
  lat: number;
  lng: number;
  address?: string;
  placeId?: string;
  city?: string;
  country?: string;
  nearestAirportCode?: string;
}

export interface EnhancedMapOptions {
  initialCountry?: 'GH' | 'CM'; // Ghana or Cameroon
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  enableClustering?: boolean;
  onLocationSelect?: (location: MapLocation) => void;
  onMapLoaded?: (map: google.maps.Map) => void;
}

export interface EnhancedMapMarker {
  id: string | number;
  position: google.maps.LatLngLiteral;
  icon?: string;
  title?: string;
  info?: string;
  onClick?: () => void;
}

interface MapState {
  map: google.maps.Map | null;
  mapLoaded: boolean;
  markers: {
    [id: string]: google.maps.Marker;
  };
  markerCluster: any | null; // Type will depend on the clustering library
  activeInfoWindow: google.maps.InfoWindow | null;
}

export function useEnhancedMaps(options: EnhancedMapOptions = {}) {
  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLInputElement>(null);
  
  // State
  const [mapState, setMapState] = useState<MapState>({
    map: null,
    mapLoaded: false,
    markers: {},
    markerCluster: null,
    activeInfoWindow: null
  });
  
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [userPosition, setUserPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [isLoadingUserPosition, setIsLoadingUserPosition] = useState(false);
  
  // Determine initial map center based on country
  const getInitialCenter = useCallback(() => {
    if (options.center) return options.center;
    
    const country = options.initialCountry || 'GH'; // Default to Ghana
    const selectedCountry = countries.find(c => c.code === country);
    
    if (selectedCountry) {
      return {
        lat: selectedCountry.defaultCenter[0],
        lng: selectedCountry.defaultCenter[1]
      };
    }
    
    // Default to Accra if country not found
    return { lat: 5.6037, lng: -0.1870 };
  }, [options.center, options.initialCountry]);

  // Initialize map
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key is missing');
      return;
    }
    
    if (!mapContainerRef.current) return;
    
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry', 'visualization']
    });
    
    loader.load().then(() => {
      if (!mapContainerRef.current) return;
      
      const center = getInitialCenter();
      const zoom = options.zoom || 12;
      
      const mapInstance = new google.maps.Map(mapContainerRef.current, {
        center,
        zoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'greedy'
      });
      
      // Create an info window to share between markers
      const infoWindow = new google.maps.InfoWindow();
      
      setMapState(prev => ({
        ...prev, 
        map: mapInstance,
        mapLoaded: true,
        activeInfoWindow: infoWindow
      }));
      
      if (options.onMapLoaded) {
        options.onMapLoaded(mapInstance);
      }
      
      // Initialize SearchBox if ref exists
      if (searchBoxRef.current) {
        initializeSearchBox(searchBoxRef.current, mapInstance);
      }
    }).catch(error => {
      console.error('Error loading Google Maps:', error);
    });
  }, [getInitialCenter, options.onMapLoaded, options.zoom]);
  
  // Initialize search box
  const initializeSearchBox = (inputElement: HTMLInputElement, map: google.maps.Map) => {
    const searchBox = new google.maps.places.SearchBox(inputElement);
    
    map.addListener('bounds_changed', () => {
      searchBox.setBounds(map.getBounds() as google.maps.LatLngBounds);
    });
    
    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (!places || places.length === 0) return;
      
      const place = places[0];
      if (!place.geometry || !place.geometry.location) return;
      
      // Center map on the selected place
      map.setCenter(place.geometry.location);
      map.setZoom(16); // Zoom in
      
      // Create or update the marker for the selected place
      addOrUpdateMarker('selected-place', {
        id: 'selected-place',
        position: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        },
        title: place.name,
        info: place.formatted_address
      });
      
      // Get additional location info
      const locationInfo = getLocationDetails(
        place.geometry.location.lat(),
        place.geometry.location.lng(),
        place.formatted_address,
        place.place_id
      );
      
      setSelectedLocation(locationInfo);
      
      if (options.onLocationSelect) {
        options.onLocationSelect(locationInfo);
      }
    });
  };
  
  // Get the user's current location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return Promise.reject('Geolocation not supported');
    }
    
    setIsLoadingUserPosition(true);
    
    return new Promise<google.maps.LatLngLiteral>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setUserPosition(userPos);
          setIsLoadingUserPosition(false);
          resolve(userPos);
        },
        (error) => {
          console.error('Error getting user location:', error);
          setIsLoadingUserPosition(false);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);
  
  // Get location details from coordinates
  const getLocationDetails = useCallback((
    lat: number, 
    lng: number, 
    formattedAddress?: string,
    placeId?: string
  ): MapLocation => {
    const country = getCountryByCoordinates(lat, lng);
    const nearestCity = country ? getNearestCity(lat, lng, country.code) : undefined;
    const nearestAirport = country ? getNearestAirport(lat, lng, country.code) : undefined;
    
    return {
      lat,
      lng,
      address: formattedAddress,
      placeId,
      city: nearestCity?.name,
      country: country?.name,
      nearestAirportCode: nearestAirport?.code
    };
  }, []);
  
  // Geocode an address to get coordinates
  const geocodeAddress = useCallback((address: string): Promise<MapLocation> => {
    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject(new Error('Google Maps not loaded'));
        return;
      }
      
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location;
          const locationInfo = getLocationDetails(
            location.lat(),
            location.lng(),
            results[0].formatted_address,
            results[0].place_id
          );
          
          resolve(locationInfo);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }, [getLocationDetails]);
  
  // Reverse geocode coordinates to get address
  const reverseGeocode = useCallback((lat: number, lng: number): Promise<MapLocation> => {
    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject(new Error('Google Maps not loaded'));
        return;
      }
      
      const geocoder = new google.maps.Geocoder();
      const latlng = { lat, lng };
      
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const locationInfo = getLocationDetails(
            lat,
            lng,
            results[0].formatted_address,
            results[0].place_id
          );
          
          resolve(locationInfo);
        } else {
          // Even if geocoding fails, return basic location info
          resolve(getLocationDetails(lat, lng));
        }
      });
    });
  }, [getLocationDetails]);
  
  // Pan the map to a specific location
  const panTo = useCallback((lat: number, lng: number, zoom?: number) => {
    if (!mapState.map) return;
    
    mapState.map.panTo({ lat, lng });
    if (zoom) mapState.map.setZoom(zoom);
    
    reverseGeocode(lat, lng).then(locationInfo => {
      setSelectedLocation(locationInfo);
      
      if (options.onLocationSelect) {
        options.onLocationSelect(locationInfo);
      }
      
      // Update the marker
      addOrUpdateMarker('selected-place', {
        id: 'selected-place',
        position: { lat, lng },
        title: locationInfo.address || 'Selected Location',
        info: locationInfo.address
      });
    });
  }, [mapState.map, reverseGeocode, options.onLocationSelect]);
  
  // Add or update a marker on the map
  const addOrUpdateMarker = useCallback((id: string | number, marker: EnhancedMapMarker) => {
    if (!mapState.map) return;
    
    // Convert id to string for consistency
    const markerId = String(id);
    
    // Check if the marker already exists
    if (mapState.markers[markerId]) {
      // Update existing marker
      const existingMarker = mapState.markers[markerId];
      existingMarker.setPosition(marker.position);
      
      if (marker.title) {
        existingMarker.setTitle(marker.title);
      }
      
      if (marker.icon) {
        existingMarker.setIcon(marker.icon);
      }
    } else {
      // Create new marker
      const newMarker = new google.maps.Marker({
        position: marker.position,
        map: mapState.map,
        title: marker.title,
        icon: marker.icon,
        animation: google.maps.Animation.DROP
      });
      
      // Add click listener
      newMarker.addListener('click', () => {
        if (marker.info && mapState.activeInfoWindow) {
          mapState.activeInfoWindow.setContent(marker.info);
          mapState.activeInfoWindow.open(mapState.map, newMarker);
        }
        
        if (marker.onClick) {
          marker.onClick();
        }
      });
      
      // Add to markers object
      setMapState(prev => ({
        ...prev,
        markers: {
          ...prev.markers,
          [markerId]: newMarker
        }
      }));
    }
  }, [mapState.map, mapState.activeInfoWindow, mapState.markers]);
  
  // Remove a marker from the map
  const removeMarker = useCallback((id: string | number) => {
    const markerId = String(id);
    
    if (mapState.markers[markerId]) {
      mapState.markers[markerId].setMap(null);
      
      setMapState(prev => {
        const updatedMarkers = { ...prev.markers };
        delete updatedMarkers[markerId];
        
        return {
          ...prev,
          markers: updatedMarkers
        };
      });
    }
  }, [mapState.markers]);
  
  // Clear all markers from the map
  const clearMarkers = useCallback(() => {
    Object.values(mapState.markers).forEach(marker => {
      marker.setMap(null);
    });
    
    setMapState(prev => ({
      ...prev,
      markers: {}
    }));
  }, [mapState.markers]);
  
  // Set multiple markers at once
  const setMarkers = useCallback((markers: EnhancedMapMarker[]) => {
    // Clear existing markers first
    clearMarkers();
    
    // Add new markers
    markers.forEach(marker => {
      addOrUpdateMarker(marker.id, marker);
    });
  }, [addOrUpdateMarker, clearMarkers]);
  
  // Return all the functions and state
  return {
    mapContainerRef,
    searchBoxRef,
    map: mapState.map,
    mapLoaded: mapState.mapLoaded,
    selectedLocation,
    userPosition,
    isLoadingUserPosition,
    getUserLocation,
    panTo,
    geocodeAddress,
    reverseGeocode,
    addOrUpdateMarker,
    removeMarker,
    clearMarkers,
    setMarkers
  };
}