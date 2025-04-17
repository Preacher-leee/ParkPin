import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  parkingLocationId: number;
}

export function TimerModal({ isOpen, onClose, parkingLocationId }: TimerModalProps) {
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(30);
  const { toast } = useToast();

  const setTimerMutation = useMutation({
    mutationFn: async () => {
      const totalMinutes = (hours * 60) + minutes;
      const res = await apiRequest("POST", "/api/timer", {
        parkingLocationId,
        durationMinutes: totalMinutes
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/timer/${parkingLocationId}`] });
      toast({
        title: "Timer Set",
        description: `Timer set for ${hours > 0 ? `${hours} hr${hours > 1 ? 's' : ''} ` : ''}${minutes > 0 ? `${minutes} min` : ''}`,
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to set timer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleIncreaseHours = () => {
    if (hours < 24) setHours(hours + 1);
  };

  const handleDecreaseHours = () => {
    if (hours > 0) setHours(hours - 1);
  };

  const handleIncreaseMinutes = () => {
    if (minutes < 55) setMinutes(minutes + 5);
  };

  const handleDecreaseMinutes = () => {
    if (minutes > 0) setMinutes(minutes - 5);
  };

  const handleSetTimer = () => {
    if (hours === 0 && minutes === 0) {
      toast({
        title: "Invalid Timer",
        description: "Please set a timer duration greater than 0.",
        variant: "destructive",
      });
      return;
    }
    
    setTimerMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden slide-up">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Set Parking Timer</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Get notified before your parking expires</p>
          
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <span className="block text-gray-500 dark:text-gray-400 text-sm">Hours</span>
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="rounded-full" 
                    onClick={handleDecreaseHours}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </Button>
                  <span className="mx-4 text-3xl font-semibold text-gray-800 dark:text-white">
                    {hours}
                  </span>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="rounded-full" 
                    onClick={handleIncreaseHours}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </div>
              </div>
              
              <div className="text-center">
                <span className="block text-gray-500 dark:text-gray-400 text-sm">Minutes</span>
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="rounded-full" 
                    onClick={handleDecreaseMinutes}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </Button>
                  <span className="mx-4 text-3xl font-semibold text-gray-800 dark:text-white">
                    {minutes}
                  </span>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="rounded-full" 
                    onClick={handleIncreaseMinutes}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            The timer will notify you <span className="font-medium">10 minutes before</span> your parking expires.
          </p>
          
          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleSetTimer}
              disabled={setTimerMutation.isPending}
            >
              {setTimerMutation.isPending ? "Setting..." : "Start Timer"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimerModal;
