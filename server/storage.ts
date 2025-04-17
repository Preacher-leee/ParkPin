import { users, type User, type InsertUser, parkingLocations, parkingTimers, type ParkingLocation, type ParkingTimer, type InsertParkingLocation, type InsertParkingTimer } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { eq, and, desc } from "drizzle-orm";
import { db, pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPremiumStatus(userId: number, isPremium: boolean): Promise<User>;
  updateStripeCustomerId(userId: number, customerId: string): Promise<User>;
  updateUserStripeInfo(userId: number, info: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User>;

  // Parking location operations
  createParkingLocation(location: InsertParkingLocation & { userId: number }): Promise<ParkingLocation>;
  getActiveParkingLocation(userId: number): Promise<ParkingLocation | undefined>;
  deactivateParkingLocation(id: number): Promise<void>;
  getParkingLocationById(id: number): Promise<ParkingLocation | undefined>;
  getParkingHistoryByUser(userId: number, limit?: number): Promise<ParkingLocation[]>;
  
  // Parking timer operations
  createParkingTimer(timer: InsertParkingTimer): Promise<ParkingTimer>;
  getActiveTimerByParkingLocation(parkingLocationId: number): Promise<ParkingTimer | undefined>;
  deactivateTimer(id: number): Promise<void>;
  
  sessionStore: any; // Express session store
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Express session store

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users)
      .values({
        ...insertUser,
        trialStartDate: new Date(),
        premiumUser: false
      })
      .returning();
    return user;
  }

  async updateUserPremiumStatus(userId: number, isPremium: boolean): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ premiumUser: isPremium })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }

  async updateStripeCustomerId(userId: number, customerId: string): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }

  async updateUserStripeInfo(userId: number, info: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ 
        stripeCustomerId: info.stripeCustomerId,
        stripeSubscriptionId: info.stripeSubscriptionId,
        premiumUser: true
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }

  async createParkingLocation(location: InsertParkingLocation & { userId: number }): Promise<ParkingLocation> {
    // Deactivate any existing active parking locations for this user
    const existingActive = await this.getActiveParkingLocation(location.userId);
    if (existingActive) {
      await this.deactivateParkingLocation(existingActive.id);
    }

    const [parkingLocation] = await db.insert(parkingLocations)
      .values({
        ...location,
        parkedAt: new Date(),
        isActive: true
      })
      .returning();
    
    return parkingLocation;
  }

  async getActiveParkingLocation(userId: number): Promise<ParkingLocation | undefined> {
    const [location] = await db.select()
      .from(parkingLocations)
      .where(
        and(
          eq(parkingLocations.userId, userId),
          eq(parkingLocations.isActive, true)
        )
      );
    
    return location;
  }

  async deactivateParkingLocation(id: number): Promise<void> {
    await db.update(parkingLocations)
      .set({ isActive: false })
      .where(eq(parkingLocations.id, id));
    
    // Also deactivate any associated timer
    const timer = await this.getActiveTimerByParkingLocation(id);
    if (timer) {
      await this.deactivateTimer(timer.id);
    }
  }

  async getParkingLocationById(id: number): Promise<ParkingLocation | undefined> {
    const [location] = await db.select()
      .from(parkingLocations)
      .where(eq(parkingLocations.id, id));
    
    return location;
  }

  async getParkingHistoryByUser(userId: number, limit = 10): Promise<ParkingLocation[]> {
    return db.select()
      .from(parkingLocations)
      .where(eq(parkingLocations.userId, userId))
      .orderBy(desc(parkingLocations.parkedAt))
      .limit(limit);
  }

  async createParkingTimer(timer: InsertParkingTimer): Promise<ParkingTimer> {
    // Deactivate any existing timer for this parking location
    const existingTimer = await this.getActiveTimerByParkingLocation(timer.parkingLocationId);
    if (existingTimer) {
      await this.deactivateTimer(existingTimer.id);
    }

    const now = new Date();
    const endTime = new Date(now.getTime() + timer.durationMinutes * 60000);
    
    const [parkingTimer] = await db.insert(parkingTimers)
      .values({
        ...timer,
        endTime,
        isActive: true
      })
      .returning();
    
    return parkingTimer;
  }

  async getActiveTimerByParkingLocation(parkingLocationId: number): Promise<ParkingTimer | undefined> {
    const [timer] = await db.select()
      .from(parkingTimers)
      .where(
        and(
          eq(parkingTimers.parkingLocationId, parkingLocationId),
          eq(parkingTimers.isActive, true)
        )
      );
    
    return timer;
  }

  async deactivateTimer(id: number): Promise<void> {
    await db.update(parkingTimers)
      .set({ isActive: false })
      .where(eq(parkingTimers.id, id));
  }
}

export const storage = new DatabaseStorage();
