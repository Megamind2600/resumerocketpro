import { eq } from "drizzle-orm";
import {
  users,
  resumes,
  resumeAnalysis,
  jobOptimizations,
  payments,
  type User,
  type Resume,
  type ResumeAnalysis,
  type JobOptimization,
  type Payment,
  type InsertUser,
  type InsertResume,
  type InsertResumeAnalysis,
  type InsertJobOptimization,
  type InsertPayment,
} from "../shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Resume operations
  createResume(resume: InsertResume): Promise<Resume>;
  getResume(id: number): Promise<Resume | undefined>;
  getResumesByUserId(userId: number): Promise<Resume[]>;

  // Resume analysis operations
  createResumeAnalysis(analysis: InsertResumeAnalysis): Promise<ResumeAnalysis>;
  getResumeAnalysis(resumeId: number): Promise<ResumeAnalysis | undefined>;

  // Job optimization operations
  createJobOptimization(optimization: InsertJobOptimization): Promise<JobOptimization>;
  getJobOptimization(id: number): Promise<JobOptimization | undefined>;
  getJobOptimizationsByResumeId(resumeId: number): Promise<JobOptimization[]>;

  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: number): Promise<Payment | undefined>;
  updatePaymentStatus(id: number, status: string): Promise<Payment>;
  getPaymentByOptimizationId(optimizationId: number): Promise<Payment | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const { db } = await import("./db");
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { db } = await import("./db");
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { db } = await import("./db");
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createResume(insertResume: InsertResume): Promise<Resume> {
    const { db } = await import("./db");
    const [resume] = await db
      .insert(resumes)
      .values(insertResume)
      .returning();
    return resume;
  }

  async getResume(id: number): Promise<Resume | undefined> {
    const { db } = await import("./db");
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume || undefined;
  }

  async getResumesByUserId(userId: number): Promise<Resume[]> {
    const { db } = await import("./db");
    return await db.select().from(resumes).where(eq(resumes.userId, userId));
  }

  async createResumeAnalysis(insertAnalysis: InsertResumeAnalysis): Promise<ResumeAnalysis> {
    const { db } = await import("./db");
    const [analysis] = await db
      .insert(resumeAnalysis)
      .values(insertAnalysis as any)
      .returning();
    return analysis;
  }

  async getResumeAnalysis(resumeId: number): Promise<ResumeAnalysis | undefined> {
    const { db } = await import("./db");
    const [analysis] = await db.select().from(resumeAnalysis).where(eq(resumeAnalysis.resumeId, resumeId));
    return analysis || undefined;
  }

  async createJobOptimization(insertOptimization: InsertJobOptimization): Promise<JobOptimization> {
    const { db } = await import("./db");
    const [optimization] = await db
      .insert(jobOptimizations)
      .values(insertOptimization as any)
      .returning();
    return optimization;
  }

  async getJobOptimization(id: number): Promise<JobOptimization | undefined> {
    const { db } = await import("./db");
    const [optimization] = await db.select().from(jobOptimizations).where(eq(jobOptimizations.id, id));
    return optimization || undefined;
  }

  async getJobOptimizationsByResumeId(resumeId: number): Promise<JobOptimization[]> {
    const { db } = await import("./db");
    return await db.select().from(jobOptimizations).where(eq(jobOptimizations.resumeId, resumeId));
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const { db } = await import("./db");
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const { db } = await import("./db");
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment> {
    const { db } = await import("./db");
    const [payment] = await db
      .update(payments)
      .set({ status })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async getPaymentByOptimizationId(optimizationId: number): Promise<Payment | undefined> {
    const { db } = await import("./db");
    const [payment] = await db.select().from(payments).where(eq(payments.optimizationId, optimizationId));
    return payment || undefined;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private resumes: Map<number, Resume> = new Map();
  private resumeAnalyses: Map<number, ResumeAnalysis> = new Map();
  private jobOptimizations: Map<number, JobOptimization> = new Map();
  private payments: Map<number, Payment> = new Map();
  private currentUserId = 1;
  private currentResumeId = 1;
  private currentAnalysisId = 1;
  private currentOptimizationId = 1;
  private currentPaymentId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async createResume(insertResume: InsertResume): Promise<Resume> {
    const resume: Resume = {
      ...insertResume,
      userId: insertResume.userId ?? null,
      id: this.currentResumeId++,
      createdAt: new Date(),
    };
    this.resumes.set(resume.id, resume);
    return resume;
  }

  async getResume(id: number): Promise<Resume | undefined> {
    return this.resumes.get(id);
  }

  async getResumesByUserId(userId: number): Promise<Resume[]> {
    return Array.from(this.resumes.values()).filter(resume => resume.userId === userId);
  }

  async createResumeAnalysis(insertAnalysis: InsertResumeAnalysis): Promise<ResumeAnalysis> {
    const analysis: ResumeAnalysis = {
      id: this.currentAnalysisId++,
      resumeId: insertAnalysis.resumeId ?? null,
      suggestedRoles: insertAnalysis.suggestedRoles as string[],
      skills: insertAnalysis.skills as string[],
      experienceLevel: insertAnalysis.experienceLevel,
      location: insertAnalysis.location ?? null,
      industries: insertAnalysis.industries as string[],
      explanation: insertAnalysis.explanation,
      createdAt: new Date(),
    };
    this.resumeAnalyses.set(analysis.id, analysis);
    return analysis;
  }

  async getResumeAnalysis(resumeId: number): Promise<ResumeAnalysis | undefined> {
    return Array.from(this.resumeAnalyses.values()).find(analysis => analysis.resumeId === resumeId);
  }

  async createJobOptimization(insertOptimization: InsertJobOptimization): Promise<JobOptimization> {
    const optimization: JobOptimization = {
      id: this.currentOptimizationId++,
      resumeId: insertOptimization.resumeId ?? null,
      jobDescription: insertOptimization.jobDescription,
      companyName: insertOptimization.companyName,
      jobTitle: insertOptimization.jobTitle,
      matchScore: insertOptimization.matchScore,
      missingSkills: insertOptimization.missingSkills as string[],
      optimizedResume: insertOptimization.optimizedResume,
      coverLetter: insertOptimization.coverLetter,
      createdAt: new Date(),
    };
    this.jobOptimizations.set(optimization.id, optimization);
    return optimization;
  }

  async getJobOptimization(id: number): Promise<JobOptimization | undefined> {
    return this.jobOptimizations.get(id);
  }

  async getJobOptimizationsByResumeId(resumeId: number): Promise<JobOptimization[]> {
    return Array.from(this.jobOptimizations.values()).filter(opt => opt.resumeId === resumeId);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const payment: Payment = {
      ...insertPayment,
      optimizationId: insertPayment.optimizationId ?? null,
      id: this.currentPaymentId++,
      createdAt: new Date(),
    };
    this.payments.set(payment.id, payment);
    return payment;
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment> {
    const payment = this.payments.get(id);
    if (!payment) {
      throw new Error(`Payment with id ${id} not found`);
    }
    payment.status = status;
    return payment;
  }

  async getPaymentByOptimizationId(optimizationId: number): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(payment => payment.optimizationId === optimizationId);
  }
}

export const storage = new MemStorage();
