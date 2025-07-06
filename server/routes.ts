import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import Stripe from "stripe";
import { storage } from "./storage";
import { extractTextFromFile, generateJobSearchUrls } from "./services/file-processor";
import { analyzeResumeForRoles, compareResumeToJob, generateCoverLetter, generateOptimizedResume } from "./services/gemini";
import { generatePDFDocuments } from "./services/pdf-generator";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = ['.pdf', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Upload and analyze resume
  app.post("/api/upload-resume", upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Get or create user
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({ email });
      }

      // Process file
      const processedFile = await extractTextFromFile(req.file.path, req.file.originalname);
      
      // Store resume
      const resume = await storage.createResume({
        userId: user.id,
        fileName: processedFile.fileName,
        fileSize: processedFile.fileSize,
        mimeType: processedFile.mimeType,
        extractedText: processedFile.text,
      });

      // Analyze resume with Gemini
      const analysis = await analyzeResumeForRoles(processedFile.text);
      
      // Store analysis
      await storage.createResumeAnalysis({
        resumeId: resume.id,
        suggestedRoles: analysis.roles.map(r => r.title),
        skills: analysis.skills,
        experienceLevel: analysis.experienceLevel,
        location: analysis.location,
        industries: analysis.industries,
        explanation: analysis.explanation,
      });

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json({
        resumeId: resume.id,
        analysis: {
          roles: analysis.roles,
          skills: analysis.skills,
          experienceLevel: analysis.experienceLevel,
          location: analysis.location,
          industries: analysis.industries,
        }
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Generate job search links
  app.post("/api/generate-job-links", async (req, res) => {
    try {
      const { resumeId, selectedRoles } = req.body;
      
      const resume = await storage.getResume(resumeId);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }

      const analysis = await storage.getResumeAnalysis(resumeId);
      if (!analysis) {
        return res.status(404).json({ message: "Resume analysis not found" });
      }

      const jobLinks = generateJobSearchUrls(selectedRoles, analysis.location || "");
      
      res.json({ jobLinks });
    } catch (error: any) {
      console.error('Job links error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Optimize resume against job description
  app.post("/api/optimize-resume", async (req, res) => {
    try {
      const { resumeId, jobDescription, companyName, jobTitle } = req.body;
      
      const resume = await storage.getResume(resumeId);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }

      // Compare resume to job description
      const jobMatch = await compareResumeToJob(resume.extractedText, jobDescription);
      
      // Generate optimized resume
      const optimizedResume = await generateOptimizedResume(resume.extractedText, jobMatch);
      
      // Generate cover letter
      const coverLetter = await generateCoverLetter(resume.extractedText, jobDescription, companyName);
      
      // Store optimization
      const optimization = await storage.createJobOptimization({
        resumeId: resume.id,
        jobDescription,
        companyName,
        jobTitle,
        matchScore: jobMatch.matchScore,
        missingSkills: jobMatch.missingSkills,
        optimizedResume,
        coverLetter,
      });

      res.json({
        optimizationId: optimization.id,
        matchScore: jobMatch.matchScore,
        missingSkills: jobMatch.missingSkills,
        recommendations: jobMatch.recommendations,
        optimizedResume,
        coverLetter,
      });
    } catch (error: any) {
      console.error('Optimization error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get optimization details
  app.get("/api/optimization/:id", async (req, res) => {
    try {
      const optimization = await storage.getJobOptimization(parseInt(req.params.id));
      if (!optimization) {
        return res.status(404).json({ message: "Optimization not found" });
      }

      res.json(optimization);
    } catch (error: any) {
      console.error('Get optimization error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Create payment intent
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { optimizationId } = req.body;
      const amount = 999; // $9.99 in cents
      
      const optimization = await storage.getJobOptimization(optimizationId);
      if (!optimization) {
        return res.status(404).json({ message: "Optimization not found" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        metadata: { optimizationId: optimizationId.toString() },
      });

      // Store payment record
      await storage.createPayment({
        optimizationId,
        stripePaymentIntentId: paymentIntent.id,
        amount,
        status: 'pending',
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error('Payment intent error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Check payment status
  app.get("/api/payment-status/:optimizationId", async (req, res) => {
    try {
      const optimizationId = parseInt(req.params.optimizationId);
      const payment = await storage.getPaymentByOptimizationId(optimizationId);
      
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      // Check with Stripe for latest status
      const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
      
      if (paymentIntent.status === 'succeeded' && payment.status !== 'succeeded') {
        await storage.updatePaymentStatus(payment.id, 'succeeded');
      }

      res.json({ 
        status: paymentIntent.status,
        canDownload: paymentIntent.status === 'succeeded'
      });
    } catch (error: any) {
      console.error('Payment status error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Download documents
  app.get("/api/download/:optimizationId/:type", async (req, res) => {
    try {
      const optimizationId = parseInt(req.params.optimizationId);
      const type = req.params.type; // 'resume' or 'cover-letter'
      
      const payment = await storage.getPaymentByOptimizationId(optimizationId);
      if (!payment || payment.status !== 'succeeded') {
        return res.status(403).json({ message: "Payment required" });
      }

      const optimization = await storage.getJobOptimization(optimizationId);
      if (!optimization) {
        return res.status(404).json({ message: "Optimization not found" });
      }

      const documents = await generatePDFDocuments({
        resumeText: optimization.optimizedResume,
        coverLetter: optimization.coverLetter,
        includeWatermark: false,
      });

      const filename = type === 'resume' ? 'optimized-resume.pdf' : 'cover-letter.pdf';
      const content = type === 'resume' ? documents.resumePDF : documents.coverLetterPDF;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(content);
    } catch (error: any) {
      console.error('Download error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
