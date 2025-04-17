import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define table schemas first
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  trialStartDate: timestamp("trial_start_date").notNull(),
  premiumUser: boolean("premium_user").default(false).notNull(),
  email: text("email"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
});

export const parkingLocations = pgTable("parking_locations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  locationName: text("location_name"),
  notes: text("notes"),
  parkedAt: timestamp("parked_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const parkingTimers = pgTable("parking_timers", {
  id: serial("id").primaryKey(),
  parkingLocationId: integer("parking_location_id").notNull().references(() => parkingLocations.id),
  durationMinutes: integer("duration_minutes").notNull(),
  endTime: timestamp("end_time").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// Define relations after all tables are defined
export const userRelations = relations(users, ({ many }) => ({
  parkingLocations: many(parkingLocations),
}));

export const parkingLocationRelations = relations(parkingLocations, ({ one, many }) => ({
  user: one(users, {
    fields: [parkingLocations.userId],
    references: [users.id],
  }),
  timers: many(parkingTimers),
}));

export const parkingTimerRelations = relations(parkingTimers, ({ one }) => ({
  parkingLocation: one(parkingLocations, {
    fields: [parkingTimers.parkingLocationId],
    references: [parkingLocations.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertParkingLocationSchema = createInsertSchema(parkingLocations).pick({
  latitude: true,
  longitude: true,
  locationName: true,
  notes: true,
});

export const insertParkingTimerSchema = createInsertSchema(parkingTimers).pick({
  parkingLocationId: true,
  durationMinutes: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ParkingLocation = typeof parkingLocations.$inferSelect;
export type ParkingTimer = typeof parkingTimers.$inferSelect;
export type InsertParkingLocation = z.infer<typeof insertParkingLocationSchema>;
export type InsertParkingTimer = z.infer<typeof insertParkingTimerSchema>;
