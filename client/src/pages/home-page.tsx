import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ParkingLocation } from "@shared/schema";
import { formatTimeSince, getCurrentPosition, getLocationNamePlaceholder } from "@/lib/mapUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Logo from "@/components/ui/logo";
import MapView from "@/components/map/MapView";
import ParkingTimer from "@/components/ParkingTimer";
import TimerModal from "@/components/TimerModal";
import MenuModal from "@/components/MenuModal";
import ParkingSuccessModal from "@/components/ParkingSuccessModal";
import { 
  PlusIcon, 
  MenuIcon, 
  TimerIcon, 
  MapPinIcon, 
  NavigationIcon,
  HomeIcon,
  ClockIcon,
  SettingsIcon,
  LocateIcon
} from "lucide-react";
import Onboarding from "@/components/Onboarding";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isParkingSuccessModalOpen, setIsParkingSuccessModalOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // Check if this is the first login to show onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setIsOnboarding(true);
    }
  }, []);

  const handleCompleteOnboarding = () => {
    setIsOnboarding(false);
    localStorage.setItem("hasSeenOnboarding", "true");
  };

  // Get active parking location
  const { 
    data: activeParkingLocation, 
    isLoading: isLoadingParkingLocation,
  } = useQuery<ParkingLocation | undefined>({
    queryKey: ["/api/parking/active"],
    retry: 1,
  });

  // Get trial status
  const { data: trialStatus } = useQuery<{ isPremium: boolean; isTrialActive: boolean; daysLeft: number; trialEndDate: string }>({
    queryKey: ["/api/trial-status"],
  });

  // Park car mutation
  const parkCarMutation = useMutation({
    mutationFn: async () => {
      // Get current position
      const position = await getCurrentPosition();
      
      // Create parking location
      const res = await apiRequest("POST", "/api/parking", {
        latitude: position.coords.latitude.toString(),
        longitude: position.coords.longitude.toString(),
        locationName: getLocationNamePlaceholder(position.coords.latitude, position.coords.longitude),
        notes: "Parking Spot"
      });
      
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/parking/active"] });
      setIsParkingSuccessModalOpen(true);
      toast({
        title: "Parking Location Saved",
        description: "We'll help you find your car when you're ready to leave.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save location",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // End parking session mutation
  const endParkingMutation = useMutation({
    mutationFn: async () => {
      if (!activeParkingLocation) return;
      const res = await apiRequest("POST", `/api/parking/${activeParkingLocation.id}/end`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parking/active"] });
      toast({
        title: "Parking Session Ended",
        description: "Your parking location has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to end parking",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Toggle parking
  const handleToggleParking = () => {
    if (activeParkingLocation) {
      endParkingMutation.mutate();
    } else {
      parkCarMutation.mutate();
    }
  };

  // Open directions
  const handleOpenDirections = () => {
    if (!activeParkingLocation) return;
    
    // In a real app, this would open navigation
    toast({
      title: "Opening Navigation",
      description: "Turn-by-turn directions would open here.",
    });
  };

  // Get user current position
  const handleGetCurrentPosition = async () => {
    try {
      await getCurrentPosition();
      toast({
        title: "Location Updated",
        description: "Map is now centered on your current location.",
      });
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Could not get your current location.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      {isOnboarding ? (
        <Onboarding onComplete={handleCompleteOnboarding} />
      ) : (
        <div className="fixed inset-0 z-30 flex flex-col">
          {/* Map Container */}
          <MapView activeParkingLocation={activeParkingLocation}>
            {/* We have moved controls inside the MapView to ensure they're always visible */}
            <div className="flex items-center justify-center">
              {/* Main Action Button (Floating in center) */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, type: "spring" }}
                className="relative"
              >
                <Button
                  variant="default"
                  size="lg"
                  className="h-16 w-16 rounded-full flex items-center justify-center shadow-lg relative z-10 bg-primary hover:bg-primary/90"
                  onClick={handleToggleParking}
                  disabled={parkCarMutation.isPending || endParkingMutation.isPending}
                >
                  {parkCarMutation.isPending || endParkingMutation.isPending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <svg className="h-8 w-8 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </motion.div>
                  ) : activeParkingLocation ? (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm1 3a1 1 0 100 2 1 1 0 000-2zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </Button>
                
                {/* Animated ring around button */}
                <motion.div 
                  className="absolute inset-0 rounded-full"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ 
                    background: `radial-gradient(circle, ${activeParkingLocation ? 'rgba(220, 38, 38, 0.3)' : 'rgba(16, 185, 129, 0.3)'} 0%, transparent 70%)`,
                    zIndex: 1 
                  }}
                />
                
                <span className="absolute top-full left-1/2 transform -translate-x-1/2 text-sm font-medium bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-md mt-2 whitespace-nowrap">
                  {activeParkingLocation ? "I Found My Car" : "I Parked Here"}
                </span>
              </motion.div>
            </div>
          </MapView>
          
          {/* UI Controls */}
          {/* Top Bar (Fixed) */}
          <motion.div 
            className="absolute top-4 left-0 right-0 px-4 flex justify-between items-center z-40"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md"
              >
                <Logo size="sm" />
              </motion.div>
              
              {!user?.premiumUser && trialStatus && (
                <motion.div 
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="ml-2"
                >
                  <div className="px-3 py-1 bg-primary/90 backdrop-blur-sm rounded-full text-xs font-medium text-white shadow-sm">
                    {(trialStatus as any).daysLeft > 0 
                      ? `${(trialStatus as any).daysLeft} days left in trial`
                      : "Trial expired"
                    }
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="rounded-full shadow-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0"
                  onClick={handleGetCurrentPosition}
                >
                  <LocateIcon className="h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="rounded-full shadow-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0"
                  onClick={() => setIsMenuModalOpen(true)}
                >
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Status Cards (Conditionally displayed) */}
          <AnimatePresence>
            {activeParkingLocation && (
              <motion.div 
                className="absolute top-20 left-4 right-4 z-40"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md p-3 flex items-center"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white mr-3 shadow-sm">
                    <MapPinIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {activeParkingLocation.locationName || "Parked Location"}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatTimeSince(new Date(activeParkingLocation.parkedAt))}</span>
                    </div>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="default" 
                      size="sm"
                      className="ml-2 rounded-full shadow-sm bg-primary hover:bg-primary/90 text-white"
                      onClick={handleOpenDirections}
                    >
                      <NavigationIcon className="h-4 w-4 mr-1" />
                      Directions
                    </Button>
                  </motion.div>
                </motion.div>

                {/* Timer Card (if parking location active) */}
                <motion.div
                  className="mt-3"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <ParkingTimer parkingLocationId={activeParkingLocation.id} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Side Action Buttons */}
          <motion.div 
            className="absolute bottom-20 right-4 z-40"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="icon" 
                variant="secondary" 
                className="w-12 h-12 rounded-full shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                onClick={() => {
                  if (activeParkingLocation) {
                    setIsTimerModalOpen(true);
                  } else {
                    toast({
                      title: "No Active Parking",
                      description: "Mark your parking location first before setting a timer.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <TimerIcon className="h-6 w-6" />
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Bottom Navigation Bar (Fixed) */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 z-40 p-4 pb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-100 dark:border-gray-700 flex justify-around items-center mx-auto max-w-sm h-14">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" className="h-full px-4 rounded-full flex flex-col items-center justify-center text-primary">
                  <HomeIcon className="h-5 w-5" />
                  <span className="text-xs mt-0.5">Home</span>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Link href="/history">
                  <Button variant="ghost" className="h-full px-4 rounded-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <ClockIcon className="h-5 w-5" />
                    <span className="text-xs mt-0.5">History</span>
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" className="h-full px-4 rounded-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                  <SettingsIcon className="h-5 w-5" />
                  <span className="text-xs mt-0.5">Settings</span>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Modals */}
      {activeParkingLocation && (
        <TimerModal 
          isOpen={isTimerModalOpen} 
          onClose={() => setIsTimerModalOpen(false)} 
          parkingLocationId={activeParkingLocation.id}
        />
      )}
      
      <MenuModal 
        isOpen={isMenuModalOpen} 
        onClose={() => setIsMenuModalOpen(false)} 
      />
      
      {activeParkingLocation && isParkingSuccessModalOpen && (
        <ParkingSuccessModal 
          isOpen={isParkingSuccessModalOpen}
          onClose={() => setIsParkingSuccessModalOpen(false)}
          onSetTimer={() => {
            setIsParkingSuccessModalOpen(false);
            setIsTimerModalOpen(true);
          }}
          parkingLocation={activeParkingLocation}
        />
      )}
    </>
  );
}
