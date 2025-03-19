import { useState, useEffect } from 'react';
import { useEnhancedMaps, MapLocation } from '@/hooks/use-enhanced-maps';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { 
  MapPin, 
  Search, 
  Locate, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle 
} from 'lucide-react';
import { countries } from '@/lib/locations';

export interface MapPickerProps {
  value?: MapLocation | null;
  onChange?: (location: MapLocation) => void;
  onSelect?: (location: MapLocation) => void;
  showSearch?: boolean;
  showControls?: boolean;
  showLocationDetails?: boolean;
  initialCountry?: 'GH' | 'CM';
  height?: string;
  className?: string;
  readOnly?: boolean;
}

export function MapPicker({
  value,
  onChange,
  onSelect,
  showSearch = true,
  showControls = true,
  showLocationDetails = true,
  initialCountry = 'GH',
  height = '400px',
  className = '',
  readOnly = false
}: MapPickerProps) {
  const [showDetails, setShowDetails] = useState(true);

  // Initialize with provided value if available
  const initialCenter = value 
    ? { lat: value.lat, lng: value.lng } 
    : undefined;

  const {
    mapContainerRef,
    searchBoxRef,
    map,
    mapLoaded,
    selectedLocation,
    userPosition,
    isLoadingUserPosition,
    getUserLocation,
    panTo,
    addOrUpdateMarker
  } = useEnhancedMaps({
    initialCountry,
    center: initialCenter,
    zoom: 14,
    onLocationSelect: (location) => {
      if (onChange) onChange(location);
      if (onSelect) onSelect(location);
    }
  });

  // When value prop changes externally, update the map
  useEffect(() => {
    if (!mapLoaded || !value) return;
    
    // Only update if the location has changed significantly
    if (selectedLocation && 
        Math.abs(selectedLocation.lat - value.lat) < 0.0001 && 
        Math.abs(selectedLocation.lng - value.lng) < 0.0001) {
      return;
    }

    panTo(value.lat, value.lng, 14);
  }, [value, mapLoaded, panTo, selectedLocation]);

  // Add marker when location is selected
  useEffect(() => {
    if (!mapLoaded || !selectedLocation) return;

    addOrUpdateMarker('selected-location', {
      id: 'selected-location',
      position: {
        lat: selectedLocation.lat,
        lng: selectedLocation.lng
      },
      title: selectedLocation.address || 'Selected Location'
    });
  }, [selectedLocation, mapLoaded, addOrUpdateMarker]);

  // Handle user location button click
  const handleGetUserLocation = async () => {
    try {
      const position = await getUserLocation();
      panTo(position.lat, position.lng, 16);
    } catch (error) {
      console.error('Failed to get user location:', error);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className={`w-full rounded-md overflow-hidden border border-input`}
        style={{ height }}
      ></div>

      {/* Search Bar */}
      {showSearch && !readOnly && (
        <div className="absolute top-3 left-0 right-0 mx-auto w-[90%] max-w-md z-10">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchBoxRef}
              type="text"
              placeholder="Search for a location"
              className="w-full pl-10 pr-20 bg-white shadow-md"
            />
            {showControls && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1/2 right-2 transform -translate-y-1/2 h-8"
                onClick={handleGetUserLocation}
                disabled={isLoadingUserPosition}
              >
                {isLoadingUserPosition ? (
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                ) : (
                  <Locate className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Location Details */}
      {showLocationDetails && selectedLocation && (
        <Card className="absolute bottom-3 left-0 right-0 mx-auto w-[90%] max-w-md z-10 p-3 bg-white shadow-md">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <MapPin className="h-4 w-4 text-primary mr-2" />
                <h3 className="text-sm font-medium">
                  {selectedLocation.address || 'Selected Location'}
                </h3>
              </div>

              {showDetails && (
                <div className="mt-2 text-xs text-muted-foreground space-y-1">
                  {selectedLocation.city && (
                    <div>
                      <span className="font-medium">City:</span> {selectedLocation.city}
                    </div>
                  )}
                  {selectedLocation.country && (
                    <div>
                      <span className="font-medium">Country:</span> {selectedLocation.country}
                    </div>
                  )}
                  {selectedLocation.nearestAirportCode && (
                    <div>
                      <span className="font-medium">Nearest Airport:</span> {selectedLocation.nearestAirportCode}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Coordinates:</span>{' '}
                    {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Loading Indicator */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Error State */}
      {!window.google && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-bold">Maps API Error</h3>
          <p className="text-sm text-center text-muted-foreground max-w-xs mt-2">
            Unable to load Google Maps. Please check your API key or internet connection.
          </p>
        </div>
      )}
    </div>
  );
}