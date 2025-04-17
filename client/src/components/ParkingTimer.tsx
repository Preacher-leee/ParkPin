import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatTimeRemaining, calculateTimerPercentage } from "@/lib/mapUtils";
import { ParkingTimer as TimerType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { AlertTriangleIcon, TimerIcon } from "lucide-react";

interface ParkingTimerProps {
  parkingLocationId: number;
}

export function ParkingTimer({ parkingLocationId }: ParkingTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState("00:00:00");
  const [percentage, setPercentage] = useState(0);
  const [timerStarted, setTimerStarted] = useState<Date | null>(null);
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const { toast } = useToast();
  
  // Fetch timer data from API
  const { data: timer, isLoading } = useQuery<TimerType>({
    queryKey: [`/api/timer/${parkingLocationId}`],
    retry: 1,
  });

  useEffect(() => {
    if (timer && timer.isActive) {
      const endTime = new Date(timer.endTime);
      const now = new Date();
      
      // If we don't have a start time yet, calculate an approximate one
      if (!timerStarted) {
        const startTime = new Date(endTime);
        startTime.setMinutes(startTime.getMinutes() - timer.durationMinutes);
        setTimerStarted(startTime);
      }
      
      // Set initial values
      const timeRemaining = formatTimeRemaining(endTime);
      setTimeRemaining(timeRemaining);
      
      const currentPercentage = timerStarted ? 
        calculateTimerPercentage(timerStarted, endTime) : 0;
      setPercentage(currentPercentage);
      
      // Check if timer is about to expire (less than 5 minutes left)
      const minutesLeft = (endTime.getTime() - now.getTime()) / (1000 * 60);
      setIsExpiringSoon(minutesLeft < 5 && minutesLeft > 0);
      
      // Update timer every second
      const intervalId = setInterval(() => {
        const now = new Date();
        if (now >= endTime) {
          clearInterval(intervalId);
          setTimeRemaining("00:00:00");
          setPercentage(100);
          setIsExpiringSoon(false);
          
          // Notify user that timer expired
          toast({
            title: "Parking Timer Expired",
            description: "Your parking time has run out!",
            variant: "destructive",
          });
        } else {
          const updatedTime = formatTimeRemaining(endTime);
          setTimeRemaining(updatedTime);
          
          const updatedPercentage = timerStarted ? 
            calculateTimerPercentage(timerStarted, endTime) : 0;
          setPercentage(updatedPercentage);
          
          // Check if timer is about to expire (less than 5 minutes left)
          const minutesLeft = (endTime.getTime() - now.getTime()) / (1000 * 60);
          setIsExpiringSoon(minutesLeft < 5 && minutesLeft > 0);
        }
      }, 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [timer, timerStarted, toast]);

  if (isLoading || !timer?.isActive) {
    return null;
  }

  // Color transitions based on percentage
  const getTimerColor = () => {
    if (percentage < 50) return "bg-emerald-500";
    if (percentage < 75) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <motion.div 
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md p-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <motion.div
            animate={isExpiringSoon ? { 
              scale: [1, 1.1, 1],
              rotate: [-5, 0, 5, 0],
            } : {}}
            transition={{ 
              duration: 0.6, 
              repeat: isExpiringSoon ? Infinity : 0,
              repeatType: "reverse" 
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 shadow-sm
              ${isExpiringSoon ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}
          >
            {isExpiringSoon ? (
              <AlertTriangleIcon className="h-4 w-4" />
            ) : (
              <TimerIcon className="h-4 w-4" />
            )}
          </motion.div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Parking Timer</h3>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {isExpiringSoon ? "Time running out!" : "Time remaining"}
            </div>
          </div>
        </div>
        <motion.div
          initial={{ scale: 1 }}
          animate={isExpiringSoon ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={{ 
            duration: 1.5, 
            repeat: isExpiringSoon ? Infinity : 0,
            repeatType: "reverse" 
          }}
          className={`text-lg font-medium ${
            isExpiringSoon ? 'text-red-500' : 
            percentage > 75 ? 'text-amber-500' : 'text-emerald-500'
          }`}
        >
          {timeRemaining}
        </motion.div>
      </div>
      
      <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <motion.div 
          className={`h-2.5 rounded-full ${getTimerColor()}`}
          initial={{ width: "0%" }}
          animate={{ width: `${Math.min(100, percentage)}%` }}
          transition={{ 
            duration: 0.8, 
            ease: "easeOut"
          }}
        />
        
        {/* Animated pulse effect for progress bar */}
        {isExpiringSoon && (
          <motion.div
            className="absolute inset-0 bg-red-500 opacity-30 rounded-full"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
      </div>
    </motion.div>
  );
}

export default ParkingTimer;
