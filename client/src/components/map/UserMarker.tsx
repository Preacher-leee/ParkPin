import React from "react";

interface UserMarkerProps {
  latitude: number;
  longitude: number;
}

// In a real implementation, this marker would be positioned based on map coordinates
// For now, we'll use fixed positioning with some offset based on mock data
export function UserMarker({ latitude, longitude }: UserMarkerProps) {
  // These styles would normally be calculated from the map instance and coordinates
  // This is just a placeholder for the UI
  const markerStyle = {
    bottom: "35%", 
    right: "40%"
  };

  return (
    <div className="absolute" style={markerStyle}>
      <div className="relative">
        <div className="absolute -top-1 -left-1 w-8 h-8 bg-blue-500 rounded-full opacity-30 animate-ping"></div>
        <div className="relative w-6 h-6 bg-blue-500 border-2 border-white rounded-full"></div>
      </div>
    </div>
  );
}

export default UserMarker;
