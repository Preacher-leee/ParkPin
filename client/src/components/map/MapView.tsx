import React, { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { checkGeolocationPermission, getCurrentPosition } from "@/lib/mapUtils";
import { ParkingLocation } from "@shared/schema";
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Loader2, MapPin } from "lucide-react";
import { motion } from "framer-motion";

// Fix for Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom marker icons with more modern/minimalist design
const userIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #3b82f6; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.2);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const carIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3); 
          display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">P</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Animation component for location accuracy
function AccuracyCircle({ position, accuracy }: { position: L.LatLngExpression, accuracy: number }) {
  return (
    <Circle 
      center={position} 
      radius={accuracy || 20}
      pathOptions={{ 
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        weight: 1,
        opacity: 0.5,
        dashArray: '5, 5',
      }}
    />
  );
}

// Component to automatically center map on user location
function LocationMarker({ position, disableFollow = false }: { position: L.LatLngExpression, disableFollow?: boolean }) {
  const map = useMap();
  
  useEffect(() => {
    if (position && !disableFollow) {
      map.setView(position, map.getZoom());
    }
  }, [position, map, disableFollow]);
  
  return null;
}

// Component to handle map interactions
function MapControls({ onMapClick }: { onMapClick?: (event: L.LeafletMouseEvent) => void }) {
  const map = useMap();
  
  useEffect(() => {
    if (onMapClick) {
      map.on('click', onMapClick);
      
      return () => {
        map.off('click', onMapClick);
      };
    }
  }, [map, onMapClick]);
  
  return null;
}

interface MapViewProps {
  activeParkingLocation?: ParkingLocation;
  children?: React.ReactNode;
}

export function MapView({ activeParkingLocation, children }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number, accuracy?: number } | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { toast } = useToast();
  const mapRef = useRef<L.Map | null>(null);

  // Check geolocation permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      const hasPermission = await checkGeolocationPermission();
      setLocationPermissionGranted(hasPermission);
      
      if (!hasPermission) {
        toast({
          title: "Location Permission Required",
          description: "Please enable location services to use ParkPal effectively.",
          variant: "destructive",
        });
      }
    };
    
    checkPermission();
  }, [toast]);

  // Initialize user location tracking
  useEffect(() => {
    if (!locationPermissionGranted) return;

    // Get initial position
    getCurrentPosition()
      .then((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setMapLoaded(true);
      })
      .catch((error) => {
        console.error("Error getting current position:", error);
        toast({
          title: "Location Error",
          description: "Unable to get your current location.",
          variant: "destructive",
        });
      });

    // Set up position watcher
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        console.error("Error watching position:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );

    // Clean up watcher
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [locationPermissionGranted, toast]);

  // Display loading state until we have user location
  if (!userLocation) {
    return (
      <div className="map-container flex items-center justify-center bg-gray-100 dark:bg-gray-900 h-full">
        <motion.div 
          className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-4"
          >
            <Loader2 className="h-10 w-10 text-primary" />
          </motion.div>
          <h3 className="text-lg font-medium mb-2">Finding your location</h3>
          <p className="text-muted-foreground text-sm">
            Please make sure location services are enabled
          </p>
        </motion.div>
      </div>
    );
  }

  const parkingPosition = activeParkingLocation ? 
    [parseFloat(activeParkingLocation.latitude), parseFloat(activeParkingLocation.longitude)] as L.LatLngExpression : 
    null;

  return (
    <div className="map-container relative h-full w-full overflow-hidden">
      <MapContainer 
        center={[userLocation.lat, userLocation.lng]} 
        zoom={17} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        whenReady={(event: { target: L.Map }) => {
          mapRef.current = event.target;
        }}
        className="z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        {/* Auto-center map on user's current location */}
        <LocationMarker position={[userLocation.lat, userLocation.lng]} />
        
        {/* User location accuracy circle */}
        {userLocation.accuracy && userLocation.accuracy < 100 && (
          <AccuracyCircle 
            position={[userLocation.lat, userLocation.lng]} 
            accuracy={userLocation.accuracy} 
          />
        )}
        
        {/* User location marker */}
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup className="minimalist-popup">
            <div className="text-center py-1">
              <p className="font-medium text-sm">You are here</p>
            </div>
          </Popup>
        </Marker>
        
        {/* Parked car location marker */}
        {parkingPosition && (
          <Marker position={parkingPosition} icon={carIcon}>
            <Popup className="minimalist-popup">
              <div className="text-center py-1">
                <p className="font-medium text-sm">{activeParkingLocation?.locationName}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(activeParkingLocation!.parkedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Add map click handler */}
        <MapControls onMapClick={(e) => {
          // Optional - handle map clicks if needed
        }} />
      </MapContainer>
      
      {/* Custom CSS for map styling added separately in index.css */}
      
      {/* Main content overlay */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <div className="relative h-full w-full flex flex-col">
          {/* Children components (buttons, UI controls, etc.) */}
          <div className="pointer-events-auto">
            {children}
          </div>
          
          {/* Map attribution (discreet corner) */}
          <div className="absolute bottom-1 right-1 z-[400] text-[8px] text-gray-500 bg-white/70 px-1 rounded">
            © OpenStreetMap contributors
          </div>
        </div>
      </div>
      
      {/* Loading overlay that fades out */}
      <motion.div 
        className="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-30"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        onAnimationComplete={() => {
          // Add any post-load actions here
        }}
        style={{ pointerEvents: mapLoaded ? 'none' : 'auto' }}
      >
        <div className="text-center">
          <MapPin className="h-12 w-12 text-primary mb-3 mx-auto" />
          <h2 className="text-xl font-bold mb-1">ParkPal</h2>
          <p className="text-muted-foreground">Loading your location...</p>
        </div>
      </motion.div>
    </div>
  );
}

export default MapView;
