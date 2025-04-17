import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ParkingLocation } from "@shared/schema";
import { formatTimeSince, formatDistance, calculateDistance } from "@/lib/mapUtils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HomeIcon,
  ClockIcon,
  ArrowLeftIcon,
  MapIcon,
  CalendarIcon,
  NavigationIcon,
  LockIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import Logo from "@/components/ui/logo";

export default function HistoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Get parking history
  const {
    data: parkingHistory,
    isLoading,
    isError,
    error,
  } = useQuery<ParkingLocation[]>({
    queryKey: ["/api/parking/history"],
    retry: false,
  });

  // Handle premium upgrade required
  const isPremiumRequired = isError && (error as any)?.message?.includes("Premium feature");

  // Format date/time for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short", 
      day: "numeric"
    });
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
            </Link>
            <Logo size="sm" />
            <h1 className="text-xl font-bold">Parking History</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-4 pb-20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading your parking history...</p>
          </div>
        ) : isPremiumRequired ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/30 rounded-xl shadow-lg p-6 text-center my-4"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <LockIcon className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Premium Feature</h2>
            <p className="text-muted-foreground mb-6">
              Unlock your parking history timeline with our premium plan for just $0.99/month.
            </p>
            <Link href="/subscribe">
              <Button className="px-6">Upgrade to Premium</Button>
            </Link>
          </motion.div>
        ) : parkingHistory?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 text-center my-4"
          >
            <MapIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Parking History</h2>
            <p className="text-muted-foreground mb-6">
              Once you park your vehicle, your history will appear here.
            </p>
            <Link href="/">
              <Button>
                <HomeIcon className="mr-2 h-4 w-4" />
                Back to Map
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {parkingHistory?.map((location) => (
              <motion.div key={location.id} variants={item}>
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{location.locationName}</CardTitle>
                        <CardDescription>
                          {formatDate(location.parkedAt.toString())}
                        </CardDescription>
                      </div>
                      <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                        {location.isActive ? "Active" : "Past"}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <span>Parked {formatTimeSince(new Date(location.parkedAt))}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapIcon className="h-4 w-4 mr-2" />
                      <span className="truncate">
                        {location.notes || "No additional notes"}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 dark:bg-gray-800/50 flex justify-between pt-3">
                    <div className="text-xs text-muted-foreground">
                      {`${location.latitude.substring(0, 8)}, ${location.longitude.substring(0, 8)}`}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => {
                        // In a real app this would show on map or navigate
                        toast({
                          title: "Navigation",
                          description: "Viewing past locations on map will be available soon.",
                        });
                      }}
                    >
                      <NavigationIcon className="h-4 w-4 mr-1" />
                      View on Map
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-6">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-100 dark:border-gray-700 flex justify-around items-center mx-auto max-w-sm h-14">
          <Link href="/">
            <Button variant="ghost" className="rounded-full">
              <HomeIcon className="h-5 w-5" />
            </Button>
          </Link>
          <Button variant="ghost" className="rounded-full text-primary bg-primary/10">
            <ClockIcon className="h-5 w-5" />
          </Button>
          <Link href="/subscribe">
            <Button variant="ghost" className="rounded-full">
              <CalendarIcon className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}