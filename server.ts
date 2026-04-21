import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security and utility middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP to allow arbitrary styles/images in Vite if not tuned
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiter for AI Endpoints (10 requests per minute)
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 10, 
  message: { error: 'تم تجاوز الحد الأقصى للطلبات. يرجى الانتظار دقيقة.' },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'mohamay-pro-saudi-production',
    timestamp: new Date().toISOString(),
  });
});

// AI Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;
const systemInstruction = 'أنت مساعد قانوني سعودي. الإجابة استرشادية ويجب مراجعتها من محامٍ مرخص.';

// AI Endpoint Routing
app.post('/api/ai/legal-assistant', aiRateLimiter, async (req, res) => {
  if (!ai) { return res.status(500).json({ error: 'Server AI key is not configured' }); }
  try {
    const userMessage = String(req.body.userMessage || '');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: { systemInstruction },
    });
    return res.status(200).json({ text: response.text || '' });
  } catch (error) {
    console.error("AI Error:", error);
    return res.status(502).json({ error: 'AI upstream error' });
  }
});

app.post('/api/ai/draft', aiRateLimiter, async (req, res) => {
  if (!ai) { return res.status(500).json({ error: 'Server AI key is not configured' }); }
  try {
    const type = String(req.body.type || 'وثيقة قانونية');
    const facts = String(req.body.facts || '');
    const prompt = `قم بصياغة ${type} احترافية بناءً على الوقائع التالية:\n${facts}`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { systemInstruction },
    });
    return res.status(200).json({ text: response.text || '' });
  } catch (error) {
    console.error("AI Error:", error);
    return res.status(502).json({ error: 'AI upstream error' });
  }
});

app.post('/api/ai/analyze', aiRateLimiter, async (req, res) => {
  if (!ai) { return res.status(500).json({ error: 'Server AI key is not configured' }); }
  try {
    const content = String(req.body.content || '');
    const prompt = `حلل النص القانوني التالي وفق الأنظمة السعودية وحدد الملخص والدفوع والمخاطر:\n${content}`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { systemInstruction },
    });
    return res.status(200).json({ text: response.text || '' });
  } catch (error) {
    console.error("AI Error:", error);
    return res.status(502).json({ error: 'AI upstream error' });
  }
});

// Serve frontend static files
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.warn("⚠️ Warning: 'dist' folder not found. Frontend will not be served.");
  app.get('/', (req, res) => res.send('API is running. Frontend build (dist) not found.'));
}

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  if (!GEMINI_API_KEY) {
    console.warn('⚠️ Warning: GEMINI_API_KEY is not set. AI features will not work.');
  }
});
