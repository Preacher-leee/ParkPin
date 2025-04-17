import React, { useEffect, useState } from "react";
import Logo from "@/components/ui/logo";

interface SplashScreenProps {
  onFinished: () => void;
  duration?: number;
}

export function SplashScreen({ onFinished, duration = 2000 }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onFinished, 500); // Wait for fade out animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onFinished]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-primary-dark transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="text-center">
        <Logo size="lg" className="mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-1">ParkPal</h1>
        <p className="text-primary-light">Never forget where you parked</p>
      </div>
    </div>
  );
}

export default SplashScreen;
