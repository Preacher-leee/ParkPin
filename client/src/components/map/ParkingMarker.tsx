import React from "react";

interface ParkingMarkerProps {
  latitude: number;
  longitude: number;
  locationName: string;
}

// In a real implementation, this marker would be positioned based on map coordinates
// For now, we'll use fixed positioning with some offset based on mock data
export function ParkingMarker({ latitude, longitude, locationName }: ParkingMarkerProps) {
  // These styles would normally be calculated from the map instance and coordinates
  // This is just a placeholder for the UI
  const markerStyle = {
    top: "45%", 
    left: "48%"
  };

  return (
    <div className="absolute" style={markerStyle}>
      <div className="relative">
        <div className="absolute -top-1 -left-1 w-10 h-10 bg-primary rounded-full opacity-30 animate-ping"></div>
        <div className="relative w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6c0 1.887.772 3.586 2.017 4.814l3.983 3.983 3.983-3.983A6.001 6.001 0 0010 2zm0 9a3 3 0 110-6 3 3 0 010 6z" />
          </svg>
        </div>
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-3 py-1 rounded-lg shadow-lg whitespace-nowrap z-10">
          <span className="text-xs font-medium">{locationName}</span>
        </div>
      </div>
    </div>
  );
}

export default ParkingMarker;
