import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertParkingLocationSchema, insertParkingTimerSchema } from "@shared/schema";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Parking location API endpoints
  app.post("/api/parking", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertParkingLocationSchema.parse(req.body);
      const parkingLocation = await storage.createParkingLocation({
        ...validatedData,
        userId: req.user.id
      });
      res.status(201).json(parkingLocation);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/parking/active", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const location = await storage.getActiveParkingLocation(req.user.id);
      if (!location) {
        return res.status(404).json({ message: "No active parking location found" });
      }
      res.status(200).json(location);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/parking/:id/end", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id, 10);
      const location = await storage.getParkingLocationById(id);
      
      if (!location) {
        return res.status(404).json({ message: "Parking location not found" });
      }
      
      if (location.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to end this parking session" });
      }
      
      await storage.deactivateParkingLocation(id);
      res.status(200).json({ message: "Parking session ended" });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/parking/history", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Check if user is premium for history feature
      if (!req.user.premiumUser) {
        const trialEndDate = new Date(req.user.trialStartDate);
        trialEndDate.setDate(trialEndDate.getDate() + 7);
        
        if (new Date() > trialEndDate) {
          return res.status(403).json({ message: "Premium feature. Please upgrade to access parking history." });
        }
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const history = await storage.getParkingHistoryByUser(req.user.id, limit);
      res.status(200).json(history);
    } catch (err) {
      next(err);
    }
  });

  // Parking timer API endpoints
  app.post("/api/timer", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertParkingTimerSchema.parse(req.body);
      
      // Verify that the parking location belongs to the user
      const location = await storage.getParkingLocationById(validatedData.parkingLocationId);
      if (!location || location.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to set timer for this parking location" });
      }
      
      const timer = await storage.createParkingTimer(validatedData);
      res.status(201).json(timer);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/timer/:parkingId", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const parkingId = parseInt(req.params.parkingId, 10);
      
      // Verify that the parking location belongs to the user
      const location = await storage.getParkingLocationById(parkingId);
      if (!location || location.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to access this timer" });
      }
      
      const timer = await storage.getActiveTimerByParkingLocation(parkingId);
      if (!timer) {
        return res.status(404).json({ message: "No active timer found" });
      }
      
      res.status(200).json(timer);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/timer/:id/cancel", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id, 10);
      
      // We'd need to verify ownership here in a real app
      await storage.deactivateTimer(id);
      res.status(200).json({ message: "Timer cancelled" });
    } catch (err) {
      next(err);
    }
  });

  // Check trial status
  app.get("/api/trial-status", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const trialStartDate = new Date(req.user.trialStartDate);
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + 7);
    
    const now = new Date();
    const isPremium = req.user.premiumUser;
    const isTrialActive = now <= trialEndDate;
    const daysLeft = isTrialActive 
      ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    res.status(200).json({
      isPremium,
      isTrialActive,
      daysLeft,
      trialEndDate
    });
  });
  
  // Stripe payment routes for subscription
  app.post("/api/create-payment-intent", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { amount, description } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount, // Already in cents
        currency: "usd",
        metadata: {
          userId: req.user.id.toString(),
          description: description || "ParkPal Premium Subscription"
        },
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Stripe error:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Update user to premium status
  app.post("/api/confirm-subscription", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { paymentIntentId } = req.body;
      
      // Verify the payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ message: "Payment has not been completed" });
      }
      
      // Update the user's premium status
      const user = await storage.updateUserPremiumStatus(req.user.id, true);
      
      res.json({ success: true, user });
    } catch (error: any) {
      console.error("Error confirming subscription:", error);
      res.status(500).json({ message: "Error confirming subscription: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
