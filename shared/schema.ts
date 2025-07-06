import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  extractedText: text("extracted_text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resumeAnalysis = pgTable("resume_analysis", {
  id: serial("id").primaryKey(),
  resumeId: integer("resume_id").references(() => resumes.id),
  suggestedRoles: json("suggested_roles").$type<string[]>().notNull(),
  skills: json("skills").$type<string[]>().notNull(),
  experienceLevel: text("experience_level").notNull(),
  location: text("location"),
  industries: json("industries").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobOptimizations = pgTable("job_optimizations", {
  id: serial("id").primaryKey(),
  resumeId: integer("resume_id").references(() => resumes.id),
  jobDescription: text("job_description").notNull(),
  companyName: text("company_name").notNull(),
  jobTitle: text("job_title").notNull(),
  matchScore: integer("match_score").notNull(),
  missingSkills: json("missing_skills").$type<string[]>().notNull(),
  optimizedResume: text("optimized_resume").notNull(),
  coverLetter: text("cover_letter").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  optimizationId: integer("optimization_id").references(() => jobOptimizations.id),
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull(),
  amount: integer("amount").notNull(), // in cents
  status: text("status").notNull(), // pending, succeeded, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertResumeSchema = createInsertSchema(resumes).omit({ id: true, createdAt: true });
export const insertResumeAnalysisSchema = createInsertSchema(resumeAnalysis).omit({ id: true, createdAt: true });
export const insertJobOptimizationSchema = createInsertSchema(jobOptimizations).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type Resume = typeof resumes.$inferSelect;
export type ResumeAnalysis = typeof resumeAnalysis.$inferSelect;
export type JobOptimization = typeof jobOptimizations.$inferSelect;
export type Payment = typeof payments.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type InsertResumeAnalysis = z.infer<typeof insertResumeAnalysisSchema>;
export type InsertJobOptimization = z.infer<typeof insertJobOptimizationSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
