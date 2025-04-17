import React, { useEffect } from "react";
import { formatTimeSince } from "@/lib/mapUtils";
import { Button } from "@/components/ui/button";
import { ParkingLocation } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { CheckIcon, Clock, MapPinIcon, TimerIcon } from "lucide-react";
import confetti from "canvas-confetti";

interface ParkingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetTimer: () => void;
  parkingLocation: ParkingLocation;
}

export function ParkingSuccessModal({ 
  isOpen, 
  onClose, 
  onSetTimer,
  parkingLocation
}: ParkingSuccessModalProps) {
  // Trigger confetti animation when modal opens
  useEffect(() => {
    if (isOpen) {
      // Celebrate with confetti!
      const duration = 2000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#4F46E5', '#10B981', '#ffffff'],
        });
        
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#4F46E5', '#10B981', '#ffffff'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const locationName = parkingLocation.locationName || "Parking Location";
  const parkedTime = new Date(parkingLocation.parkedAt);
  const formattedTime = parkedTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div 
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ 
              type: "spring", 
              damping: 15, 
              stiffness: 300 
            }}
          >
            <div className="p-6 text-center">
              <motion.div 
                className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 relative"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  delay: 0.2,
                  damping: 12
                }}
              >
                {/* Pulse animation for the icon */}
                <motion.div 
                  className="absolute inset-0 rounded-full bg-green-400/30"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 0, 0.7] 
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                />
                
                <CheckIcon className="h-10 w-10 text-green-500 dark:text-green-400" />
              </motion.div>
              
              <motion.h2 
                className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Parking Location Saved!
              </motion.h2>
              
              <motion.p 
                className="text-gray-600 dark:text-gray-400 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Your car's location has been saved. We'll help you find your way back.
              </motion.p>
              
              <motion.div 
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 border border-gray-100 dark:border-gray-600"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {formattedTime}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {parkingLocation.notes || "Parking Spot"}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white mr-2">
                    <MapPinIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{locationName}</span>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {parkingLocation.latitude.substring(0, 7)}, {parkingLocation.longitude.substring(0, 7)}
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button 
                    className="w-full h-12 text-base rounded-lg font-medium"
                    onClick={onSetTimer}
                  >
                    <TimerIcon className="mr-2 h-5 w-5" />
                    Set Parking Timer
                  </Button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button 
                    variant="outline" 
                    className="w-full h-11 text-base rounded-lg" 
                    onClick={onClose}
                  >
                    Continue
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ParkingSuccessModal;
