// This file contains utility functions for working with maps and GPS coordinates

/**
 * Calculate the distance between two points in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Format a distance in meters to a human-readable format
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  } else {
    return `${(meters / 1000).toFixed(1)} km`;
  }
}

/**
 * Format a GPS coordinate to a readable format
 */
export function formatCoordinate(coord: number, isLatitude: boolean): string {
  const direction = isLatitude ? (coord >= 0 ? "N" : "S") : coord >= 0 ? "E" : "W";
  const abs = Math.abs(coord);
  const degrees = Math.floor(abs);
  const minutes = (abs - degrees) * 60;
  return `${degrees}° ${minutes.toFixed(2)}' ${direction}`;
}

/**
 * Get the approximate address from GPS coordinates
 * In a real app, this would call a reverse geocoding service
 */
export function getLocationNamePlaceholder(latitude: number, longitude: number): string {
  return "Parked Location";
}

/**
 * Format duration in minutes to human-readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
  }
}

/**
 * Format a duration between two dates
 */
export function formatTimeSince(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

/**
 * Format time remaining for timer
 */
export function formatTimeRemaining(endTime: Date): string {
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();
  
  if (diff <= 0) {
    return "00:00:00";
  }
  
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate the percentage of time elapsed in a timer
 */
export function calculateTimerPercentage(startTime: Date, endTime: Date): number {
  const now = new Date();
  const total = endTime.getTime() - startTime.getTime();
  const elapsed = now.getTime() - startTime.getTime();
  
  if (elapsed <= 0) return 0;
  if (elapsed >= total) return 100;
  
  return Math.round((elapsed / total) * 100);
}

/**
 * Get user's current position as a Promise
 */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    }
  });
}

/**
 * Check if the user has geolocation permissions
 */
export async function checkGeolocationPermission(): Promise<boolean> {
  if (!navigator.permissions) {
    try {
      await getCurrentPosition();
      return true;
    } catch {
      return false;
    }
  }
  
  const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
  return permission.state === 'granted';
}
