import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface OnboardingStep {
  title: string;
  description: string;
  image: string;
}

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: OnboardingStep[] = [
    {
      title: "Mark Your Spot",
      description: "Tap the button to save your parking location with precise GPS coordinates.",
      image: "https://images.unsplash.com/photo-1567808291548-fc3ee04dbcf0?auto=format&fit=crop&q=80&w=500&h=500&crop=entropy",
    },
    {
      title: "Find Your Way Back",
      description: "Get turn-by-turn directions back to your car, even without internet.",
      image: "https://images.unsplash.com/photo-1579336024796-35f5f4715df3?auto=format&fit=crop&q=80&w=500&h=500&crop=entropy",
    },
    {
      title: "Parking Timer",
      description: "Set reminders for meter expiration to avoid parking tickets.",
      image: "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&q=80&w=500&h=500&crop=entropy",
    },
    {
      title: "Premium Features",
      description: "After your 7-day trial, upgrade for just $0.99/month to access auto-pay parking, voice control, and location history.",
      image: "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?auto=format&fit=crop&q=80&w=500&h=500&crop=entropy",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background">
      <div className="flex justify-end p-4">
        <Button 
          variant="ghost" 
          className="text-primary font-medium" 
          onClick={onComplete}
        >
          Skip
        </Button>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md px-6">
          <div className="relative h-96">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`absolute inset-0 flex flex-col items-center text-center transition-opacity duration-300 ${
                  index === currentStep ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <div className="w-48 h-48 mb-8 flex items-center justify-center">
                  <img 
                    src={step.image} 
                    alt={step.title} 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">{step.title}</h2>
                <p className="text-muted-foreground max-w-xs">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-center space-x-2 mb-6">
          {steps.map((_, index) => (
            <div 
              key={index} 
              className={`h-2 w-2 rounded-full ${
                index === currentStep ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
        
        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <Button 
            className="flex-1" 
            onClick={handleNext}
          >
            {currentStep === steps.length - 1 ? "Get Started" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
