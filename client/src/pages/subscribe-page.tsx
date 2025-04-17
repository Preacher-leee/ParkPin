import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Logo from "@/components/ui/logo";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    setIsProcessing(false);

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "You are now a premium ParkPal user!",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="space-y-4">
        <PaymentElement />
      </div>
      <Button 
        type="submit" 
        className="w-full"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Subscribe Now"
        )}
      </Button>
    </form>
  );
};

export default function SubscribePage() {
  const [clientSecret, setClientSecret] = useState("");
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [isLoadingPayment, setIsLoadingPayment] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Create PaymentIntent as soon as the page loads
    setIsLoadingPayment(true);
    apiRequest("POST", "/api/create-payment-intent", { 
      amount: 99, // $0.99 in cents
      description: "ParkPal Premium Subscription"
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setIsLoadingPayment(false);
      })
      .catch(error => {
        toast({
          title: "Error",
          description: "Could not initialize payment. Please try again later.",
          variant: "destructive"
        });
        setIsLoadingPayment(false);
      });
  }, [user, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (isLoadingPayment || !clientSecret) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Preparing payment form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-4 py-6 border-b">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-2">
            <Logo size="sm" />
            <span className="font-semibold text-lg">ParkPal</span>
          </div>
          <Button variant="ghost" onClick={() => window.history.back()}>
            Cancel
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Upgrade to Premium</h1>
            <p className="text-muted-foreground mt-1">Unlock all premium features for just $0.99/month</p>
          </div>

          <div className="mb-8">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start">
                <div className="bg-primary/10 rounded-full p-2 text-primary mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11a1 1 0 11-2 0v-5a1 1 0 112 0v5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Auto-Pay Parking Integration</h3>
                  <p className="text-sm text-muted-foreground">Pay for parking directly from the app</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 rounded-full p-2 text-primary mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Voice Control</h3>
                  <p className="text-sm text-muted-foreground">Use voice commands for hands-free use</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 rounded-full p-2 text-primary mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Location History Timeline</h3>
                  <p className="text-sm text-muted-foreground">View your past parking locations</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg mb-6">
            <div className="flex justify-between items-center mb-2">
              <span>Monthly subscription</span>
              <span>$0.99/month</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Cancel anytime. No hidden fees.
            </div>
          </div>

          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <SubscribeForm />
          </Elements>
        </div>
      </div>
    </div>
  );
}