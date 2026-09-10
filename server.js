import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import * as Sentry from '@sentry/node';
import compression from 'compression';
import { pinoHttp } from 'pino-http';
import pino from 'pino';
// Load environment variables
dotenv.config();
// Initialize Logger
const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    formatters: {
        level: (label) => {
            return { level: label.toUpperCase() };
        },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
});
// Initialize Supabase for token verification
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Optional: no centralized error tracking existed anywhere in the backend
// before this (P11-observability.md, High) — errors only reached stdout,
// which most hosting platforms don't retain for long. Skipped entirely
// when SENTRY_DSN isn't set.
if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV || 'development', tracesSampleRate: 0.1 });
}
function captureError(error, context) {
    if (process.env.SENTRY_DSN) {
        Sentry.captureException(error, context ? { extra: context } : undefined);
    }
}
process.on('unhandledRejection', (reason) => captureError(reason, { source: 'unhandledRejection' }));
process.on('uncaughtException', (error) => captureError(error, { source: 'uncaughtException' }));
const app = express();
const PORT = process.env.PORT || 3000;
// Structured Logging Middleware
app.use(pinoHttp({ logger }));
// Compression
app.use(compression());
// Security and utility middlewares
const isProduction = process.env.NODE_ENV === 'production';
// 'unsafe-inline'/'unsafe-eval' in scriptSrc make CSP close to a no-op
// against XSS (P2-security.md, Medium). Vite's dev server needs eval for
// HMR, so they're kept in development only; production gets a real policy.
// styleSrc keeps 'unsafe-inline' — several UI libraries in this app (Radix,
// Motion) set the style="" attribute directly, which CSP treats as a
// separate, much lower-risk surface than inline <script>.
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: isProduction ? ["'self'"] : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:", "https://*.supabase.co", "https://picsum.photos"],
            connectSrc: [
                "'self'",
                "https://*.supabase.co",
                "wss://*.supabase.co"
            ]
        }
    },
    xFrameOptions: { action: "deny" },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));
// localhost origins must never be reachable in production even as a
// fallback default (P2-security.md, Medium) — ALLOWED_ORIGINS is required
// there; only development gets a same-origin/localhost default.
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : (isProduction
        ? ['https://malaf.site', 'https://www.malaf.site']
        : ['http://localhost:5173', 'http://localhost:3000']);
app.use(cors({
    origin: allowedOrigins
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Rate Limiter for AI Endpoints (10 requests per minute).
// Keyed by tenantId (set by the auth middleware below) rather than raw IP:
// IP-based limiting either punishes every user behind the same office
// NAT/proxy together, or resets for free the moment a client's IP changes
// (P4-api.md, Low).
const aiRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: 'تم تجاوز الحد الأقصى للطلبات. يرجى الانتظار دقيقة.' },
    standardHeaders: true,
    legacyHeaders: false,
    // express-rate-limit v8 requires the ipKeyGenerator helper for any IP
    // fallback so IPv6 addresses are normalized (otherwise a client can
    // bypass the limit by requesting from different representations of the
    // same IPv6 address) — plain `req.ip` here throws a ValidationError.
    keyGenerator: (req) => req.tenantId || ipKeyGenerator(req.ip),
});
// Health check endpoint: previously returned "ok" the instant Express was
// up, with zero regard for whether its actual dependency (Supabase) was
// reachable — load balancers and uptime monitors would report healthy
// during a full database outage (P11-observability.md, High).
app.get('/api/health', async (req, res) => {
    const checks = { server: 'ok' };
    try {
        const { error } = await supabase.from('users').select('id', { head: true, count: 'exact' }).limit(1);
        checks.database = error ? 'error' : 'ok';
    }
    catch {
        checks.database = 'error';
    }
    const isHealthy = Object.values(checks).every(v => v === 'ok');
    res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'ok' : 'degraded',
        service: 'mohamay-pro-saudi-production',
        checks,
        timestamp: new Date().toISOString(),
    });
});
// AI Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;
const systemInstruction = 'أنت مساعد قانوني سعودي. الإجابة استرشادية ويجب مراجعتها من محامٍ مرخص.';
// AI Security Middleware
const sanitizeInput = (text) => {
    if (!text)
        return '';
    return text.toString().replace(/<[^>]*>?/gm, ''); // Remove HTML/Script tags
};
const aiSecurityMiddleware = (req, res, next) => {
    // Length Validation & Sanitization
    if (req.body.userMessage !== undefined) {
        const msg = String(req.body.userMessage);
        if (msg.length > 5000)
            return res.status(400).json({ error: 'يجب أن يكون طول الرسالة أقل من 5000 حرف' });
        req.body.userMessage = sanitizeInput(msg);
    }
    if (req.body.facts !== undefined) {
        const facts = String(req.body.facts);
        if (facts.length > 10000)
            return res.status(400).json({ error: 'يجب أن يكون طول الوقائع أقل من 10000 حرف' });
        req.body.facts = sanitizeInput(facts);
    }
    if (req.body.content !== undefined) {
        const content = String(req.body.content);
        if (content.length > 50000)
            return res.status(400).json({ error: 'يجب أن يكون طول المحتوى أقل من 50000 حرف' });
        req.body.content = sanitizeInput(content);
    }
    // Response Timeout (30 seconds)
    req.setTimeout(30000);
    res.setTimeout(30000, () => {
        if (!res.headersSent) {
            res.status(408).json({ error: 'انتهى وقت الطلب (Timeout)' });
        }
    });
    next();
};
app.use('/api/ai', async (req, res, next) => {
    // Auth Middleware to verify Supabase JWT
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'مطلوب مصادقة صالحة' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    try {
        const { data: { user }, error } = await supabase.auth.getUser(idToken);
        if (error || !user)
            throw new Error("Invalid token");
        req.user = user;
        req.tenantId = req.headers['x-tenant-id'] || 'default';
        next();
    }
    catch (error) {
        logger.error({ err: error }, 'Auth Token Error');
        // An invalid/expired token is an authentication failure (401), not
        // an authorization one (403 means "we know who you are, but you
        // can't do this") — REST convention P4-api.md flagged as swapped.
        return res.status(401).json({ error: 'التوكن غير صالح أو منتهي الصلاحية' });
    }
}, aiSecurityMiddleware);
// AI Endpoint Routing
app.post('/api/ai/legal-assistant', aiRateLimiter, async (req, res) => {
    if (!ai) {
        return res.status(500).json({ error: 'Server AI key is not configured' });
    }
    try {
        const userMessage = String(req.body.userMessage || '');
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userMessage,
            config: { systemInstruction },
        });
        return res.status(200).json({ text: response.text || '' });
    }
    catch (error) {
        logger.error({ err: error }, "AI Error");
        return res.status(502).json({ error: 'AI upstream error' });
    }
});
app.post('/api/ai/draft', aiRateLimiter, async (req, res) => {
    if (!ai) {
        return res.status(500).json({ error: 'Server AI key is not configured' });
    }
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
    }
    catch (error) {
        logger.error({ err: error }, "AI Error");
        return res.status(502).json({ error: 'AI upstream error' });
    }
});
app.post('/api/ai/analyze', aiRateLimiter, async (req, res) => {
    if (!ai) {
        return res.status(500).json({ error: 'Server AI key is not configured' });
    }
    try {
        const content = String(req.body.content || '');
        const prompt = `حلل النص القانوني التالي وفق الأنظمة السعودية وحدد الملخص والدفوع والمخاطر:\n${content}`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { systemInstruction },
        });
        return res.status(200).json({ text: response.text || '' });
    }
    catch (error) {
        logger.error({ err: error }, "AI Error");
        return res.status(502).json({ error: 'AI upstream error' });
    }
});
// =============================================================
// Payments (Moyasar) — replaces the previous client-side facade in
// src/modules/subscriptions/subscriptionService.ts, which called Moyasar
// directly from the browser (impossible without exposing the secret key)
// and had a verifyPayment() that unconditionally returned `success: true`
// with no server involved at all — any signed-in user could "activate"
// an Enterprise plan for free by just calling that function.
// Requires MOYASAR_SECRET_KEY (dashboard) and MOYASAR_WEBHOOK_SECRET
// (configured when you register the webhook URL in the Moyasar dashboard).
// Card collection itself must use Moyasar.js on the frontend to tokenize
// the card into a `source` token — this backend never sees raw card data.
// =============================================================
const MOYASAR_SECRET_KEY = process.env.MOYASAR_SECRET_KEY;
const MOYASAR_WEBHOOK_SECRET = process.env.MOYASAR_WEBHOOK_SECRET;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Service-role client: only used for the webhook handler below, which has
// no user session to authenticate as (Moyasar calls it directly) and must
// write to `subscriptions`, a table regular users can only read (see
// rls-policies.sql). Never reuse this client for anything request-scoped.
const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
    ? createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY)
    : null;
const PLAN_PRICING = {
    basic: { monthly: 299, yearly: 2990 },
    advanced: { monthly: 699, yearly: 6990 },
    enterprise: { monthly: 1499, yearly: 14990 },
};
app.post('/api/payments/initiate', async (req, res) => {
    if (!MOYASAR_SECRET_KEY) {
        return res.status(503).json({ error: 'بوابة الدفع غير مفعّلة بعد. يرجى ضبط MOYASAR_SECRET_KEY.' });
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'مطلوب مصادقة صالحة' });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.split('Bearer ')[1]);
    if (authError || !user) {
        return res.status(401).json({ error: 'التوكن غير صالح أو منتهي الصلاحية' });
    }
    const { plan, billing, source } = req.body || {};
    const pricing = PLAN_PRICING[plan];
    if (!pricing || (billing !== 'monthly' && billing !== 'yearly')) {
        return res.status(422).json({ error: 'خطة أو دورة فوترة غير صالحة' });
    }
    if (!source || typeof source !== 'object' || !source.type) {
        // `source` is the tokenized payment method from Moyasar.js — this
        // endpoint intentionally never accepts raw card numbers/CVV.
        return res.status(422).json({ error: 'مصدر الدفع (source) مفقود أو غير صالح' });
    }
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) {
        return res.status(422).json({ error: 'معرّف المكتب (tenant) مفقود' });
    }
    const amountHalalas = Math.round((billing === 'monthly' ? pricing.monthly : pricing.yearly) * 100);
    try {
        const moyasarRes = await fetch('https://api.moyasar.com/v1/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${MOYASAR_SECRET_KEY}:`).toString('base64')}`,
            },
            body: JSON.stringify({
                amount: amountHalalas,
                currency: 'SAR',
                description: `Malaf ${plan} (${billing})`,
                source,
                callback_url: `${process.env.APP_URL || ''}/dashboard/settings/billing`,
                metadata: { tenant_id: tenantId, plan, billing },
            }),
        });
        const payment = await moyasarRes.json();
        if (!moyasarRes.ok) {
            logger.error({ payment }, 'Moyasar payment initiation failed');
            return res.status(502).json({ error: 'تعذر بدء عملية الدفع' });
        }
        return res.status(200).json({ id: payment.id, status: payment.status, transactionUrl: payment.source?.transaction_url ?? null });
    }
    catch (error) {
        logger.error({ err: error }, 'Moyasar request failed');
        return res.status(502).json({ error: 'تعذر الاتصال ببوابة الدفع' });
    }
});
// Moyasar calls this directly (no user session) whenever a payment's
// status changes. This is the ONLY place subscription status is ever
// written — never in response to anything the client claims.
app.post('/api/payments/webhook', express.json(), async (req, res) => {
    if (!MOYASAR_WEBHOOK_SECRET || !supabaseAdmin) {
        logger.warn('Moyasar webhook called but MOYASAR_WEBHOOK_SECRET/SUPABASE_SERVICE_ROLE_KEY not configured');
        return res.status(503).json({ error: 'Webhook not configured' });
    }
    const providedSecret = req.headers['x-moyasar-secret'] || req.query.secret;
    const expected = Buffer.from(String(providedSecret || ''));
    const actual = Buffer.from(MOYASAR_WEBHOOK_SECRET);
    if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
        return res.status(401).json({ error: 'Invalid webhook secret' });
    }
    const { type, data: payment } = req.body || {};
    const tenantId = payment?.metadata?.tenant_id;
    if (!tenantId) {
        return res.status(422).json({ error: 'Missing tenant_id in payment metadata' });
    }
    if (type === 'payment_paid') {
        const plan = payment.metadata?.plan || 'basic';
        const billing = payment.metadata?.billing || 'monthly';
        // Defense in depth: /api/payments/initiate always computes the charged
        // amount itself from PLAN_PRICING (never trusts the client for it), so
        // this should never actually mismatch — but if a payment ever reached
        // Moyasar through any other path, silently activating whatever plan its
        // metadata claims regardless of what was paid would be the exact "free
        // Enterprise upgrade" hole this endpoint replaced (see the comment
        // above the Payments section). Refuse to activate rather than trust it.
        const pricing = PLAN_PRICING[plan];
        const expectedHalalas = pricing ? Math.round((billing === 'yearly' ? pricing.yearly : pricing.monthly) * 100) : null;
        if (!pricing || payment.amount !== expectedHalalas) {
            logger.error({ plan, billing, paid: payment.amount, expectedHalalas, paymentId: payment.id }, 'Moyasar webhook: paid amount does not match plan pricing, refusing to activate subscription');
            return res.status(422).json({ error: 'Amount does not match plan pricing' });
        }
        const endDate = new Date();
        if (billing === 'yearly')
            endDate.setFullYear(endDate.getFullYear() + 1);
        else
            endDate.setMonth(endDate.getMonth() + 1);
        const { error } = await supabaseAdmin.from('subscriptions').upsert({
            tenant_id: tenantId,
            plan,
            billing_cycle: billing,
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: endDate.toISOString(),
            moyasar_payment_id: payment.id,
            updated_at: new Date().toISOString(),
        });
        if (error) {
            logger.error({ err: error }, 'Failed to persist subscription after payment');
            return res.status(500).json({ error: 'Failed to update subscription' });
        }
    }
    else if (type === 'payment_failed') {
        await supabaseAdmin.from('subscriptions')
            .update({ status: 'expired', updated_at: new Date().toISOString() })
            .eq('tenant_id', tenantId)
            .eq('moyasar_payment_id', payment.id);
    }
    return res.status(200).json({ received: true });
});
// =============================================================
// Email notifications (Resend). EMAIL_NOTIFICATIONS was flagged `enabled:
// true` in src/config/features.ts with no email provider integrated
// anywhere in the codebase — this is the first real one. Nothing calls it
// yet (session reminders, invoice emails); wire call sites to this
// endpoint as they're built, then flip the feature flag on.
// =============================================================
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'notifications@malaf.site';
app.post('/api/notifications/email', async (req, res) => {
    if (!RESEND_API_KEY) {
        return res.status(503).json({ error: 'خدمة البريد الإلكتروني غير مفعّلة (RESEND_API_KEY غير مضبوط)' });
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'مطلوب مصادقة صالحة' });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.split('Bearer ')[1]);
    if (authError || !user) {
        return res.status(401).json({ error: 'التوكن غير صالح أو منتهي الصلاحية' });
    }
    const { to, subject, html } = req.body || {};
    if (!to || !subject || !html) {
        return res.status(422).json({ error: 'الحقول to و subject و html مطلوبة' });
    }
    try {
        const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({ from: RESEND_FROM_EMAIL, to, subject, html }),
        });
        if (!resendRes.ok) {
            const body = await resendRes.text();
            logger.error({ body }, 'Resend send failed');
            return res.status(502).json({ error: 'تعذر إرسال البريد الإلكتروني' });
        }
        const body = await resendRes.json();
        return res.status(200).json({ id: body.id });
    }
    catch (error) {
        logger.error({ err: error }, 'Resend request failed');
        return res.status(502).json({ error: 'تعذر الاتصال بخدمة البريد الإلكتروني' });
    }
});
// A request for a missing /api/* route used to fall through to the SPA
// catch-all below and get index.html back with a 200 — any client parsing
// the response as JSON would get a cryptic parse error instead of a clean
// 404 (P4-api.md, High). This must be registered after every real /api
// route and before the static/SPA handlers.
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'المسار غير موجود' });
});
// Serve frontend static files
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}
else {
    logger.warn("'dist' folder not found. Frontend will not be served.");
    app.get('/', (req, res) => res.send('API is running. Frontend build (dist) not found.'));
}
// Start Server
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        logger.info(`🚀 Server is running on port ${PORT}`);
        if (!GEMINI_API_KEY) {
            logger.warn('⚠️ Warning: GEMINI_API_KEY is not set. AI features will not work.');
        }
    });
}
export default app;
