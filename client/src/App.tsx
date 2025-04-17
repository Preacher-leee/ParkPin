import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { useState, useEffect } from "react";
import SplashScreen from "@/components/SplashScreen";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import SubscribePage from "@/pages/subscribe-page";
import HistoryPage from "@/pages/history-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/subscribe" component={SubscribePage} />
      <ProtectedRoute path="/history" component={HistoryPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showingSplash, setShowingSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {showingSplash ? (
          <SplashScreen onFinished={() => setShowingSplash(false)} />
        ) : (
          <Router />
        )}
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
