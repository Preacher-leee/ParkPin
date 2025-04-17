import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TrialStatus {
  isPremium: boolean;
  isTrialActive: boolean;
  daysLeft: number;
  trialEndDate: string;
}

export function MenuModal({ isOpen, onClose }: MenuModalProps) {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // Fetch trial status
  const { data: trialStatus } = useQuery<TrialStatus>({
    queryKey: ["/api/trial-status"],
    enabled: isOpen, // Only fetch when modal is open
  });

  const handleLogout = () => {
    logoutMutation.mutate();
    onClose();
  };

  const handleSubscribe = () => {
    onClose(); // Close the modal first
    navigate("/subscribe"); // Redirect to the subscription page
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-t-xl shadow-xl w-full max-h-[80%] overflow-auto slide-up">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menu</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>
          
          {!trialStatus?.isPremium && (
            <div className="bg-primary/10 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Trial Period</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {trialStatus?.isTrialActive
                      ? `${trialStatus.daysLeft} days remaining`
                      : "Trial expired"
                    }
                  </p>
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={handleSubscribe}
              >
                Upgrade to Premium • $0.99/month
              </Button>
            </div>
          )}
          
          <div className="space-y-1 mb-6">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
                <span>Your Account</span>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span>App Settings</span>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span>Help & Support</span>
              </div>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-500" 
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v1H9a1 1 0 100 2h3v1a1 1 0 102 0V9h1a1 1 0 100-2h-1V7z" clipRule="evenodd" />
                </svg>
                <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
              </div>
            </Button>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Premium Features</h3>
            <div className="space-y-4">
              <div className="flex">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-3 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11a1 1 0 11-2 0v-5a1 1 0 112 0v5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Auto-Pay Parking Integration</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pay for parking directly from the app with our partner services.</p>
                </div>
              </div>
              <div className="flex">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-3 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Voice Control</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Use voice commands like "Hey ParkPal, where's my car?"</p>
                </div>
              </div>
              <div className="flex">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-3 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Location History Timeline</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View your past parked locations, dates, and durations.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuModal;
