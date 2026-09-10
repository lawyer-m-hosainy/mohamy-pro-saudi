# ⚖️ ملف (malaf.site) — المرآة الشاملة للمنصة

> **الغرض من هذه الوثيقة:** هذا الملف هو **المرجع الوحيد والشامل** لمنصة "ملف" (malaf.site). تم تصميمه ليكون بمثابة **مرآة حقيقية كاملة** للمشروع بكل أقسامه وملفاته ووظائفه وأزراره ومنطقه البرمجي. يمكن تقديم هذه الوثيقة وحدها لأي نموذج ذكاء اصطناعي ليتمكن من: بناء سوبر برومبتات مراجعة شاملة لكل قسم — مراجعة كل زر ووظيفة — اكتشاف الثغرات — اقتراح التطوير — كتابة اختبارات — وفهم البنية الكاملة.

---

## 📋 جدول المحتويات

1. [الهوية والرؤية](#-الهوية-والرؤية)
2. [التقنيات المستخدمة](#-التقنيات-المستخدمة-tech-stack)
3. [هيكل المشروع البرمجي](#-هيكل-المشروع-البرمجي)
4. [البنية المعمارية](#-البنية-المعمارية-architecture)
5. [خريطة الصفحات والمسارات الكاملة](#-خريطة-الصفحات-والمسارات-الكاملة)
6. [الأقسام الوظيفية التفصيلية (39 قسم)](#-الأقسام-الوظيفية-التفصيلية)
7. [نظام الذكاء الاصطناعي](#-نظام-الذكاء-الاصطناعي)
8. [نظام الأمان والتشفير](#-نظام-الأمان-والتشفير)
9. [نظام الأدوار والصلاحيات (RBAC)](#-نظام-الأدوار-والصلاحيات-rbac)
10. [نظام Multi-Tenancy](#-نظام-multi-tenancy)
11. [نظام الاشتراكات والتسعير](#-نظام-الاشتراكات-والتسعير)
12. [Feature Flags](#-feature-flags)
13. [قاعدة البيانات والجداول](#-قاعدة-البيانات-والجداول)
14. [سياسات RLS الأمنية](#-سياسات-rls-الأمنية)
15. [الخادم الخلفي (Backend API)](#-الخادم-الخلفي-backend-api)
16. [إدارة الحالة (State Management)](#-إدارة-الحالة-state-management)
17. [نظام التحقق من المدخلات](#-نظام-التحقق-من-المدخلات-validation)
18. [نظام رفع الملفات](#-نظام-رفع-الملفات)
19. [نظام المراقبة والتسجيل](#-نظام-المراقبة-والتسجيل-observability)
20. [أنواع البيانات (Type System)](#-أنواع-البيانات-type-system)
21. [طبقة Domain Logic](#-طبقة-domain-logic)
22. [الاختبارات](#-الاختبارات)
23. [التشغيل والنشر](#-التشغيل-والنشر)
24. [متغيرات البيئة](#-متغيرات-البيئة)
25. [خارطة الطريق](#-خارطة-الطريق)

---

## 🏛️ الهوية والرؤية

| البند | التفاصيل |
|---|---|
| **اسم المنصة** | ملف (malaf.site) / ليجل ERP |
| **النوع** | منصة SaaS لإدارة مكاتب المحاماة |
| **السوق المستهدف** | المملكة العربية السعودية (KSA) |
| **اللغة الأساسية** | العربية (RTL) مع دعم إنجليزي للمصطلحات التقنية |
| **النموذج التجاري** | اشتراك شهري/سنوي بثلاث خطط (Basic / Advanced / Enterprise) |
| **الرؤية** | رقمنة قطاع المحاماة السعودي بالكامل — لوحة تحكم واحدة تربط المحامي بموكليه وتنظم الشؤون المالية والقضائية |
| **النطاق** | `malaf.site` / `www.malaf.site` |
| **الاستضافة** | Render (Backend) + Vercel (Frontend) |

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

### Frontend
| التقنية | الإصدار | الغرض |
|---|---|---|
| **React** | 19.x | مكتبة واجهة المستخدم |
| **Vite** | 6.x | بناء وتطوير سريع |
| **TypeScript** | 5.8.x | أمان الأنواع |
| **Tailwind CSS** | 4.x | التنسيق والتصميم |
| **shadcn/ui** | 4.x | مكتبة مكونات UI (Radix UI) |
| **Zustand** | 5.x | إدارة حالة التطبيق |
| **React Router DOM** | 7.x | التوجيه والملاحة |
| **Recharts** | 3.x | الرسوم البيانية والتحليلات |
| **Motion (Framer Motion)** | 12.x | الحركات والأنيميشن |
| **Lucide React** | 0.546.x | الأيقونات |
| **date-fns** | 4.x | معالجة التواريخ |
| **next-themes** | 0.4.x | الوضع الليلي/النهاري |
| **Crypto-JS** | 4.x | تشفير AES-256 للبيانات الحساسة |
| **Zod** | 4.x | تحقق من المدخلات |
| **qrcode.react** | 4.x | QR Code لفواتير ZATCA |
| **jsPDF + html2canvas** | 4.x / 1.x | تصدير PDF |
| **Sonner** | 2.x | إشعارات Toast |

### Backend
| التقنية | الغرض |
|---|---|
| **Express.js** | خادم API |
| **Helmet** | حماية HTTP Headers |
| **CORS** | التحكم بالأصول المسموحة |
| **express-rate-limit** | تحديد معدل الطلبات (10/دقيقة لـ AI) |
| **Pino + pino-http** | تسجيل هيكلي (Structured Logging) |
| **compression** | ضغط الاستجابات |
| **@google/genai** | Gemini 2.5 Flash API |
| **dotenv** | متغيرات البيئة |

### قاعدة البيانات والتخزين
| التقنية | الغرض |
|---|---|
| **Supabase** | Auth + PostgreSQL + Storage |
| **PostgreSQL** | قاعدة بيانات علائقية مع RLS |
| **Supabase Storage** | تخزين الملفات (bucket: `documents`) |

### أدوات التطوير والاختبار
| التقنية | الغرض |
|---|---|
| **Vitest** | اختبارات الوحدات |
| **@testing-library/react** | اختبارات المكونات |
| **jsdom** | محاكاة DOM للاختبارات |
| **tsx** | تشغيل سكريبتات TypeScript |

---

## 📂 هيكل المشروع البرمجي

```
malaf-saudi/
├── 📄 index.html                     ← نقطة الدخول HTML
├── 📄 server.js                      ← الخادم الخلفي (Express + Gemini AI)
├── 📄 server.ts                      ← النسخة TypeScript من الخادم
├── 📄 package.json                   ← التبعيات والأوامر
├── 📄 vite.config.ts                 ← إعدادات Vite
├── 📄 vitest.config.ts               ← إعدادات الاختبارات
├── 📄 tsconfig.json                  ← إعدادات TypeScript
├── 📄 schema.sql                     ← مخطط قاعدة البيانات
├── 📄 rls-policies.sql               ← سياسات أمان الصفوف (RLS)
├── 📄 render.yaml                    ← إعدادات نشر Render
├── 📄 vercel.json                    ← إعدادات نشر Vercel
├── 📄 Dockerfile                     ← بناء Docker
├── 📄 .env.example                   ← نموذج متغيرات البيئة
├── 📁 api/                           ← Vercel Serverless Functions
│   └── index.ts
├── 📁 scripts/                       ← سكريبتات الأدوات
│   ├── demo-seed.ts                  ← بذر بيانات العرض
│   └── demo-reset.ts                 ← إعادة ضبط بيانات العرض
├── 📁 public/                        ← الملفات الثابتة
├── 📁 dist/                          ← نسخة الإنتاج المبنية
├── 📁 docs/                          ← الوثائق التفصيلية
│   ├── execution/                    ← وثائق التنفيذ
│   ├── marketing/                    ← وثائق التسويق
│   ├── ops/                          ← وثائق العمليات
│   ├── qa/                           ← وثائق ضمان الجودة
│   ├── security/                     ← وثائق الأمان
│   └── strategy/                     ← وثائق الاستراتيجية
├── 📁 src/                           ← الكود المصدري
│   ├── 📄 App.tsx                    ← المكون الجذري + التوجيه الكامل
│   ├── 📄 main.tsx                   ← نقطة الدخول React
│   ├── 📄 index.css                  ← الأنماط العامة
│   ├── 📁 views/                     ← صفحات التطبيق (39 صفحة)
│   │   ├── 📁 cases-components/      ← مكونات فرعية للقضايا
│   │   │   └── useCaseActions.ts     ← Hook لإجراءات القضايا
│   │   └── 📁 enforcement-components/← مكونات فرعية للتنفيذ
│   ├── 📁 components/                ← المكونات المشتركة
│   │   ├── 📄 AuthProvider.tsx       ← مزود المصادقة
│   │   ├── 📄 ErrorBoundary.tsx      ← معالج الأخطاء العام
│   │   ├── 📄 ProtectedRoute.tsx     ← حماية المسارات
│   │   ├── 📁 ai/                    ← مكونات الذكاء الاصطناعي
│   │   │   └── ChatAssistant.tsx     ← المساعد الذكي المحادثي
│   │   ├── 📁 layout/               ← مكونات التخطيط
│   │   │   ├── RootLayout.tsx        ← التخطيط الجذري
│   │   │   ├── Sidebar.tsx           ← الشريط الجانبي (44 عنصر قائمة)
│   │   │   └── Topbar.tsx            ← الشريط العلوي (بحث + إشعارات + حساب)
│   │   └── 📁 ui/                    ← مكونات shadcn/ui
│   ├── 📁 store/                     ← إدارة الحالة (Zustand)
│   │   ├── index.ts                  ← التصدير المركزي
│   │   ├── useAdvisoryStore.ts       ← حالة الاستشارات
│   │   ├── useAnalyticsStore.ts      ← حالة التحليلات
│   │   ├── useAppStore.ts            ← حالة التطبيق العامة
│   │   ├── useAuthStore.ts           ← حالة المصادقة + الصلاحيات
│   │   ├── useCasesStore.ts          ← حالة القضايا
│   │   ├── useCLMStore.ts            ← حالة إدارة العقود
│   │   ├── useClientsStore.ts        ← حالة العملاء
│   │   ├── useComplianceStore.ts     ← حالة الامتثال والحوكمة
│   │   ├── useEnforcementStore.ts    ← حالة التنفيذ
│   │   ├── useFinanceStore.ts        ← حالة المالية
│   │   ├── useInvoicesStore.ts       ← حالة الفواتير
│   │   ├── useIPStore.ts             ← حالة الملكية الفكرية
│   │   ├── useTeamStore.ts           ← حالة الفريق والمهام
│   │   └── useUIStore.ts             ← حالة الواجهة (sidebar + إشعارات)
│   ├── 📁 services/                  ← خدمات البيانات
│   │   ├── legalDataService.ts       ← CRUD للعملاء/القضايا/الفواتير (Supabase)
│   │   ├── fileService.ts            ← رفع الملفات (Supabase Storage)
│   │   └── 📁 ai/                    ← خدمة الذكاء الاصطناعي
│   │       ├── index.ts              ← الواجهة العامة (Facade Pattern)
│   │       ├── apiClient.ts          ← اتصال بالخادم مع Bearer Token
│   │       └── mockResponses.ts      ← ردود احتياطية ذكية (Fallback)
│   ├── 📁 domain/                    ← منطق الأعمال النقي (Domain Layer)
│   │   ├── caseDomain.ts             ← قواعد أعمال القضايا
│   │   ├── clientDomain.ts           ← قواعد أعمال العملاء
│   │   ├── financeDomain.ts          ← قواعد أعمال المالية (VAT 15%)
│   │   ├── legalWorkflow.ts          ← مراحل سير العمل القانوني
│   │   └── schemas.ts               ← مخططات Zod للتحقق
│   ├── 📁 types/                     ← تعريفات الأنواع (TypeScript Interfaces)
│   │   ├── common.ts                 ← أنواع مشتركة (UserProfile, AuditLog, etc.)
│   │   ├── case.ts                   ← أنواع القضايا والجلسات
│   │   ├── client.ts                 ← أنواع العملاء وفحص التعارض
│   │   ├── finance.ts                ← أنواع المالية والفواتير
│   │   ├── enforcement.ts            ← أنواع التنفيذ والحجز
│   │   ├── clm.ts                    ← أنواع إدارة العقود
│   │   ├── compliance.ts             ← أنواع الامتثال والحوكمة
│   │   ├── ip.ts                     ← أنواع الملكية الفكرية
│   │   └── team.ts                   ← أنواع الفريق
│   ├── 📁 security/                  ← طبقة الأمان
│   │   └── rbac.ts                   ← نظام الأدوار (RBAC)
│   ├── 📁 repositories/             ← طبقة الوصول للبيانات
│   │   └── casesRepository.ts        ← Repository Pattern للقضايا
│   ├── 📁 hooks/                     ← Custom Hooks
│   │   └── useClientsLogic.ts        ← منطق إدارة العملاء
│   ├── 📁 lib/                       ← مكتبات مساعدة
│   │   ├── encryption.ts             ← تشفير/فك تشفير AES-256
│   │   ├── tenant.ts                 ← إدارة tenant_id
│   │   ├── taxQR.ts                  ← توليد QR Code لفواتير ZATCA
│   │   ├── finance.ts                ← حسابات مالية
│   │   ├── invoice.ts                ← منطق الفواتير
│   │   ├── error.ts                  ← معالجة الأخطاء
│   │   ├── schemas.ts                ← مخططات Zod إضافية
│   │   ├── validation.ts             ← تحقق عام
│   │   ├── utils.ts                  ← أدوات مساعدة (cn)
│   │   └── 📁 supabase/             ← عميل Supabase
│   ├── 📁 config/                    ← الإعدادات
│   │   └── features.ts               ← Feature Flags
│   ├── 📁 application/              ← طبقة Use Cases
│   ├── 📁 mocks/                     ← بيانات تجريبية
│   ├── 📁 observability/            ← المراقبة
│   │   ├── health.ts                 ← فحص صحة التطبيق
│   │   └── logger.ts                 ← تسجيل الأحداث مع REDACTION
│   ├── 📁 modules/                   ← وحدات المؤسسة
│   │   ├── 📁 admin/                ← لوحة السوبر أدمن
│   │   │   └── GlobalAdmin.tsx
│   │   ├── 📁 onboarding/          ← تسجيل المكاتب
│   │   │   └── OnboardingFlow.tsx
│   │   └── 📁 subscriptions/       ← إدارة الاشتراكات
│   │       └── subscriptionService.ts
│   └── 📁 test/                      ← ملفات الاختبار
```

---

## 🏗️ البنية المعمارية (Architecture)

### النمط المعماري
المشروع يتبع بنية **Layered Architecture** مع فصل واضح بين الطبقات:

```
┌─────────────────────────────────────────────────┐
│                   Views (UI)                     │ ← 39 صفحة React
│              src/views/*.tsx                      │
├─────────────────────────────────────────────────┤
│              Components (UI)                     │ ← مكونات مشتركة
│         src/components/**/*.tsx                   │
├─────────────────────────────────────────────────┤
│            State (Zustand Stores)                │ ← 14 store
│            src/store/use*Store.ts                 │
├─────────────────────────────────────────────────┤
│           Application (Use Cases)                │ ← سيناريوهات الاستخدام
│           src/application/**                     │
├─────────────────────────────────────────────────┤
│             Domain (Business Logic)              │ ← قواعد أعمال نقية
│            src/domain/*.ts                       │
├─────────────────────────────────────────────────┤
│           Services (Data Access)                 │ ← Supabase CRUD
│           src/services/*.ts                      │
├─────────────────────────────────────────────────┤
│          Repositories (Abstraction)              │ ← Repository Pattern
│         src/repositories/*.ts                    │
├─────────────────────────────────────────────────┤
│       Infrastructure (Supabase/Storage/AI)       │ ← البنية التحتية
│       src/lib/supabase/ + src/services/ai/       │
└─────────────────────────────────────────────────┘
```

### أنماط التصميم المستخدمة
| النمط | الموقع | الوصف |
|---|---|---|
| **Facade Pattern** | `src/services/ai/index.ts` | واجهة موحدة لـ AI: يحاول الخادم أولاً ← fallback محلي |
| **Repository Pattern** | `src/repositories/casesRepository.ts` | تجريد الوصول لبيانات القضايا |
| **Store Pattern** | `src/store/*` | Zustand stores لكل domain |
| **Provider Pattern** | `AuthProvider.tsx` | حقن سياق المصادقة |
| **Protected Route** | `ProtectedRoute.tsx` | حماية المسارات المصادق عليها |
| **Permission Gate** | `App.tsx → PermissionGate` | حماية المسارات بالصلاحيات |
| **Lazy Loading** | `App.tsx` | تحميل كسول لكل الصفحات (39 صفحة) |
| **Error Boundary** | `ErrorBoundary.tsx` | معالجة أخطاء React |

### تدفق البيانات
```
User Action → View → Zustand Store → Service (legalDataService) → Supabase API → PostgreSQL
                                                                      ↕
                                                              Encryption (AES-256)
                                                              Tenant Isolation (RLS)
```

---

## 🗺️ خريطة الصفحات والمسارات الكاملة

### المسارات العامة (بدون مصادقة)
| المسار | المكون | الوصف |
|---|---|---|
| `/` | `Landing.tsx` | صفحة الهبوط التسويقية |
| `/login` | `Login.tsx` | تسجيل الدخول (Supabase Auth) |
| `/onboarding` | `OnboardingFlow.tsx` | تسجيل مكتب محاماة جديد |
| `/client-portal` | `ClientPortal.tsx` | بوابة العميل لتتبع قضاياه |

### المسارات المحمية (تتطلب مصادقة - داخل `/dashboard`)
| المسار | المكون | الصلاحية المطلوبة | الوصف |
|---|---|---|---|
| `/dashboard` | `Dashboard.tsx` | — | لوحة القيادة الرئيسية |
| `/dashboard/clients` | `Clients.tsx` | `view_clients` | إدارة العملاء |
| `/dashboard/cases` | `Cases.tsx` | `view_cases` | إدارة القضايا |
| `/dashboard/roll` | `SessionsRoll.tsx` | `view_cases` | رول الجلسات |
| `/dashboard/calendar` | `Calendar.tsx` | — | تقويم الجلسات والمواعيد |
| `/dashboard/enforcement` | `Enforcement.tsx` | — | إدارة التنفيذ المالي |
| `/dashboard/collections` | `Collections.tsx` | — | تحصيل الديون |
| `/dashboard/conflict-check` | `ConflictCheck.tsx` | — | فحص تعارض المصالح |
| `/dashboard/tasks` | `Tasks.tsx` | — | إدارة المهام |
| `/dashboard/finance` | `Finance.tsx` | `finance_basic` | المالية والفواتير الضريبية |
| `/dashboard/trust-accounting` | `TrustAccounting.tsx` | — | حسابات الأمانة |
| `/dashboard/expenses` | `Expenses.tsx` | `finance_basic` | المصروفات |
| `/dashboard/time-tracking` | `TimeTracking.tsx` | — | تتبع الوقت |
| `/dashboard/team` | `Team.tsx` | `manage_team` | إدارة فريق العمل |
| `/dashboard/analytics` | `Analytics.tsx` | `view_reports` | التحليلات والإحصائيات |
| `/dashboard/partner-reports` | `PartnerReporting.tsx` | `view_reports` | تقارير الشركاء |
| `/dashboard/bd` | `BDDashboard.tsx` | `view_reports` | لوحة تطوير الأعمال |
| `/dashboard/qa` | `LegalQA.tsx` | `legal_qa` | المراجعة المهنية (QA) |
| `/dashboard/training` | `TrainingPortal.tsx` | `training_portal` | أكاديمية التدريب |
| `/dashboard/compliance` | `Compliance.tsx` | `compliance_view` | الامتثال والحوكمة |
| `/dashboard/library` | `LegalLibrary.tsx` | — | المكتبة القانونية |
| `/dashboard/documents` | `Documents.tsx` | — | إدارة المستندات |
| `/dashboard/contracts` | `Contracts.tsx` | — | صانع العقود الذكي (AI) |
| `/dashboard/clm` | `CLM.tsx` | — | إدارة دورة حياة العقود |
| `/dashboard/ai-analyzer` | `AIDocumentAnalyzer.tsx` | — | المحلل القانوني الذكي (AI) |
| `/dashboard/advisory-desk` | `AdvisoryDesk.tsx` | — | بوابة الاستشارات |
| `/dashboard/ip-operations` | `IPOperations.tsx` | — | عمليات الملكية الفكرية |
| `/dashboard/specialized-tracks` | `SpecializedTracks.tsx` | — | المسارات المتخصصة |
| `/dashboard/wiki` | `InternalWiki.tsx` | — | قاعدة المعرفة القانونية |
| `/dashboard/audit-logs` | `AuditLogs.tsx` | `view_reports` | سجل العمليات والتدقيق |
| `/dashboard/grc` | `GRC.tsx` | — | الحوكمة والمخاطر |
| `/dashboard/ip-management` | `IPManagement.tsx` | — | إدارة الملكية الفكرية (قديم) |
| `/dashboard/client-portal` | `PortalManagement.tsx` | — | إدارة بوابة العملاء |
| `/dashboard/platform-admin` | `GlobalAdmin.tsx` | `platform_admin` | لوحة السوبر أدمن |
| `/dashboard/settings` | `Settings.tsx` | — | إعدادات المكتب |

---

## 📦 الأقسام الوظيفية التفصيلية

### القسم 1: صفحة الهبوط (Landing Page)
- **الملف:** `src/views/Landing.tsx` (21,958 bytes)
- **الوصف:** صفحة تسويقية عامة تعرض ميزات المنصة
- **العناصر:** Hero section + قائمة ميزات + خطط تسعير + CTA buttons
- **الأزرار:** "ابدأ مجاناً" → `/onboarding` | "سجل دخول" → `/login`

### القسم 2: تسجيل الدخول (Login)
- **الملف:** `src/views/Login.tsx` (16,191 bytes)
- **الوصف:** نظام مصادقة عبر Supabase Auth
- **الوظائف:** تسجيل دخول بالبريد/كلمة المرور | وضع ديمو للاستعراض | تسجيل حساب جديد
- **المنطق:** بعد المصادقة ← يتم جلب `tenant_id` من جدول `users` ← تخزينه في `useAuthStore`
- **الأزرار:** "تسجيل الدخول" | "دخول تجريبي (ديمو)" | "إنشاء حساب"
- **حالة الديمو:** `useAuthStore.isDemoMode = true` → يعمل بدون Supabase

### القسم 3: تسجيل المكاتب (Onboarding)
- **الملف:** `src/modules/onboarding/OnboardingFlow.tsx` (12,555 bytes)
- **الوصف:** تدفق تسجيل مكتب محاماة جديد متعدد الخطوات
- **الخطوات:** اسم المكتب → بيانات الاتصال → اختيار الخطة → الإنشاء
- **Feature Flag:** `TENANT_ONBOARDING` (مفعّل)

### القسم 4: لوحة القيادة (Dashboard)
- **الملف:** `src/views/Dashboard.tsx` (18,967 bytes)
- **الوصف:** الصفحة الرئيسية بعد تسجيل الدخول
- **البطاقات الإحصائية (KPI Cards):**
  - إجمالي القضايا (من `useCasesStore`)
  - إجمالي العملاء (من `useClientsStore`)
  - الفواتير (من `useInvoicesStore`)
  - أعضاء الفريق (من `useTeamStore`)
- **الرسوم البيانية:**
  - `BarChart` — عدد القضايا حسب النوع (تجاري/عمالي/جزائي/أحوال شخصية/عام/إداري)
  - `PieChart` — توزيع القضايا بالألوان
- **ميزة صانع العقود السريع:** زر "صانع العقود الذكي" → Dialog → Textarea لكتابة الوقائع → استدعاء `draftLegalDocument()` → عرض المسودة
- **الألوان المرمزة للقضايا:**
  - تجاري: `primary-500` | عمالي: `accent-500` | جزائي: `navy-300` | أحوال شخصية: `primary-300` | عام: `indigo-500` | إداري: `amber-500`

### القسم 5: إدارة العملاء (Clients)
- **الملف:** `src/views/Clients.tsx` (18,424 bytes)
- **Store:** `useClientsStore.ts`
- **النوع:** `Client` (`src/types/client.ts`)
- **الحقول:**
  - `type`: "فرد" | "منشأة"
  - `name`: اسم العميل (min 2 chars)
  - `nationalId`: الهوية الوطنية/الإقامة (مشفّر AES-256) — للأفراد
  - `commercialRegistration`: السجل التجاري (مشفّر AES-256) — للمنشآت
  - `vatNumber`: الرقم الضريبي (15 رقم حسب ZATCA) (مشفّر AES-256)
  - `phone`: رقم الجوال (قناع سعودي: `+9665XXXXXXXX`)
  - `parentEntityId`: الشركة الأم (Relationship Mapping)
  - `subsidiaries[]`: الشركات التابعة
  - `shareholders[]`: المساهمون (اسم + نسبة)
  - `boardMembers[]`: أعضاء مجلس الإدارة
  - `relatedEntities[]`: كيانات ذات علاقة
- **العمليات:** إضافة عميل | تعديل عميل | بحث | تصفية حسب النوع | Pagination
- **التشفير:** `nationalId`, `commercialRegistration`, `vatNumber` ← يتم تشفيرها عبر `encryptField()` قبل الحفظ وفكها عبر `decryptField()` عند الجلب
- **التحقق (Zod):** `ClientSchema` في `src/domain/schemas.ts`

### القسم 6: إدارة القضايا (Cases)
- **الملف:** `src/views/Cases.tsx` (17,489 bytes)
- **Store:** `useCasesStore.ts`
- **النوع:** `Case` (`src/types/case.ts`)
- **الحقول:**
  - `clientId`: ربط إلزامي بالموكل
  - `clientRole`: "مدعي" | "مدعى عليه"
  - `workflowStage`: "intake" | "pleadings" | "hearing" | "judgment" | "closed"
  - `court` (CourtType): 10 أنواع محاكم (محكمة النقض | الاستئناف | الابتدائية | الجنح | الجنايات | الإدارية | الأسرة | الاقتصادية | العمال | هيئة التحكيم)
  - `circuit`: الدائرة
  - `title`: مسمى القضية
  - `automatedNumber`: الرقم الآلي
  - `circulationCode`: كود التداول (T-XXXX)
  - `archiveCode`: كود الحفظ (H-XXXX)
  - `type`: "تجاري" | "عمالي" | "عام" | "جزائي" | "أحوال شخصية" | "إداري"
  - `plaintiff`: المدعي
  - `defendant`: المدعى عليه
  - `memorandums[]`: مذكرات ولوائح (ليس "صحائف")
  - `documents[]`: مستندات مرفقة
  - `powerOfAttorneyRef`: رقم الوكالة (ليس "توكيل")
  - `status`: "متداولة" | "مغلقة" | "تحت الدراسة" | "محفوظة"
  - `externalPlatformRef`: ربط بمنظومة التقاضي الإلكتروني
- **العمليات:** إضافة قضية | تعديل | بحث | تصفية | رفع مستندات | ربط بمنصة ناجز
- **مكونات فرعية:**
  - `useCaseActions.ts` — Hook يوفر: `handleLinkToNajiz()`, `handleFileUpload()`
- **التحقق (Zod):** `CaseSchema` في `src/domain/schemas.ts`

### القسم 7: رول الجلسات (Sessions Roll)
- **الملف:** `src/views/SessionsRoll.tsx` (6,135 bytes)
- **النوع:** `Session` (`src/types/case.ts`)
- **الوصف:** عرض جدولي/زمني لجميع جلسات المحكمة القادمة
- **الحقول:** التاريخ | الوقت | المحكمة | اسم القضية | الملاحظات | الحالة (قادمة/منتهية/مؤجلة)

### القسم 8: تقويم الجلسات (Calendar)
- **الملف:** `src/views/Calendar.tsx` (14,272 bytes)
- **الوصف:** تقويم تفاعلي يعرض الجلسات والمواعيد والمهام
- **المكتبة:** `react-day-picker`

### القسم 9: إدارة التنفيذ المالي (Enforcement)
- **الملف:** `src/views/Enforcement.tsx` (15,616 bytes)
- **Store:** `useEnforcementStore.ts` (8,197 bytes)
- **النوع:** `EnforcementCase` (`src/types/enforcement.ts`)
- **الحقول:**
  - `fileNumber`: رقم ملف التنفيذ الداخلي (ENF-2026-0001)
  - `source`: "قضية_مكتب" | "حكم_خارجي"
  - `executionType`: "حكم قضائي" | "شيك" | "كمبيالة" | "عقد موثق" | "محضر صلح" | "أخرى"
  - `judgmentNumber`: رقم الحكم
  - `judgmentDate`: تاريخ صدور الحكم
  - `judgmentCourt`: المحكمة المُصدِرة
  - `debtorName`: اسم المدين
  - `amountClaimed`: المبلغ المطالب به
  - `amountCollected`: المبلغ المحصل
  - `status`: "مفتوح" | "تحت إجراء 46" | "حجز/منع" | "محصل جزئي" | "مغلق"
  - `stageDeadline`: موعد نهائي للمرحلة
  - `linkedCaseId`: ربط تلقائي بالقضية الأصلية
  - `actions[]`: إجراءات التنفيذ (إجراء نظامي/اتصال/مذكرة/تحصيل/أخرى)
  - `orders[]`: أوامر التنفيذ (إشعار 46 / أمر حجز / منع سفر / إفراج / أخرى)
  - `assets[]`: أصول المدين (حساب بنكي/عقار/مركبة/أخرى) مع قيمة تقديرية وحالة تجميد

### القسم 10: تحصيل الديون (Collections)
- **الملف:** `src/views/Collections.tsx` (11,433 bytes)
- **النوع:** `ReceivableAccount` + `CollectionAction` + `PaymentPlan` (`src/types/finance.ts`)
- **الوصف:** نظام متابعة المستحقات المالية
- **الحالات:** مفتوح | متأخر | تحت التحصيل | مسوى | مغلق
- **الإجراءات:** إصدار مطالبة | إنذار قانوني | جدولة سداد | تسوية | متابعة
- **خطط السداد:** أقساط بمواعيد + تتبع الدفع

### القسم 11: فحص تعارض المصالح (Conflict Check)
- **الملف:** `src/views/ConflictCheck.tsx` (19,125 bytes)
- **النوع:** `ConflictCheckRecord` (`src/types/client.ts`)
- **الوصف:** فحص شامل لتعارض المصالح عبر العملاء والقضايا والأطراف
- **أنواع التعارض:**
  - `DirectConflict`: تعارض مباشر
  - `IndirectConflict`: تعارض غير مباشر
  - `Clear`: لا يوجد تعارض
  - `Waived`: تم التنازل عن التعارض
- **أنواع العلاقات المفحوصة:** Client | AdverseParty | Subsidiary | Shareholder | BoardMember
- **الشدة:** High | Medium | Low

### القسم 12: المهام (Tasks)
- **الملف:** `src/views/Tasks.tsx` (14,630 bytes)
- **Store:** `useTeamStore.ts`
- **الوصف:** نظام إدارة المهام مع إسناد للأعضاء ومواعيد نهائية

### القسم 13: المالية والفواتير الضريبية (Finance)
- **الملف:** `src/views/Finance.tsx` (17,568 bytes)
- **Store:** `useFinanceStore.ts` + `useInvoicesStore.ts`
- **النوع:** `Invoice` (`src/types/finance.ts`)
- **الوصف:** إصدار فواتير ضريبية متوافقة مع ZATCA
- **حقول الفاتورة:** `clientId` | `clientName` | `base` | `vat` (15% تلقائياً) | `total` | `status` | `date`
- **التحقق (Zod):** `InvoiceSchema` — يتحقق أن VAT = 15% من القيمة الأساسية وأن الإجمالي = الأساسي + الضريبة
- **QR Code:** يتم توليد QR بصيغة TLV (Tag-Length-Value) عبر `generateZatcaTLV()` تتضمن: اسم البائع | الرقم الضريبي | الطابع الزمني | المبلغ الإجمالي | مبلغ الضريبة
- **التصدير:** PDF عبر `jsPDF` + `html2canvas`
- **الحالات:** مدفوعة | غير مدفوعة | مسودة

### القسم 14: حسابات الأمانة (Trust Accounting)
- **الملف:** `src/views/TrustAccounting.tsx` (10,955 bytes)
- **النوع:** `TrustAccount` (`src/types/finance.ts`)
- **الوصف:** إدارة أمانات العملاء ومقدمات الأتعاب
- **أنواع الحساب:** أمانة | مقدم أتعاب | مبلغ تنفيذ
- **الحالات:** نشط | تم الصرف | مسترد

### القسم 15: المصروفات (Expenses)
- **الملف:** `src/views/Expenses.tsx` (11,888 bytes)
- **النوع:** `Expense` (`src/types/finance.ts`)
- **الفئات:** رسوم قضائية | أتعاب خبراء | تنقلات | أخرى
- **الحالات:** تم السداد | معلق | مسترد من العميل

### القسم 16: تتبع الوقت (Time Tracking)
- **الملف:** `src/views/TimeTracking.tsx` (18,609 bytes)
- **النوع:** `TimeEntry` (`src/types/finance.ts`)
- **الوصف:** تسجيل ساعات العمل لكل محامي على كل قضية
- **الحقول:** المحامي | القضية | الوصف | المدة (بالدقائق) | التاريخ | حالة الفوترة
- **نماذج التسعير:** ساعة | مقطوع | شهري | مرحلي

### القسم 17: إدارة الفريق (Team)
- **الملف:** `src/views/Team.tsx` (19,542 bytes)
- **Store:** `useTeamStore.ts`
- **الوصف:** إدارة أعضاء المكتب والأدوار والصلاحيات

### القسم 18: التحليلات (Analytics)
- **الملف:** `src/views/Analytics.tsx` (13,362 bytes)
- **Store:** `useAnalyticsStore.ts` (4,547 bytes)
- **الوصف:** لوحة تحليلات شاملة مع رسوم بيانية
- **الصلاحية:** `view_reports`
- **المكتبة:** Recharts (BarChart, PieChart)

### القسم 19: تقارير الشركاء (Partner Reporting)
- **الملف:** `src/views/PartnerReporting.tsx` (14,085 bytes)
- **الصلاحية:** `view_reports`
- **الوصف:** تقارير تنفيذية مخصصة للشركاء المؤسسين

### القسم 20: لوحة تطوير الأعمال (Business Development)
- **الملف:** `src/views/BDDashboard.tsx` (16,925 bytes)
- **الصلاحية:** `view_reports`
- **الأنواع المرتبطة:**
  - `Lead`: العملاء المحتملون (مصادر: موقع إلكتروني | توصية | وسائل تواصل | أخرى)
  - `KeyAccount`: الحسابات الاستراتيجية (قيمة | صناعة | إيراد مستهدف | Pipeline)
  - `Proposal`: العروض (مسودة → مرسلة → قيد التفاوض → مقبولة/مرفوضة)
  - `RFPSubmission`: المناقصات

### القسم 21: المراجعة المهنية - QA (Legal QA)
- **الملف:** `src/views/LegalQA.tsx` (20,402 bytes)
- **الصلاحية:** `legal_qa`
- **النوع:** `QAReview` (`src/types/common.ts`)
- **الوصف:** نظام مراجعة جودة المستندات القانونية
- **الحقول:**
  - `checklist[]`: قائمة متطلبات (requirement + isMet + comment)
  - `status`: Pending | Approved | Rejected | RequiresChanges
  - `partnerOverride`: إمكانية تجاوز الشريك للقرار
  - `overallComment`: تعليق عام

### القسم 22: أكاديمية التدريب (Training Portal)
- **الملف:** `src/views/TrainingPortal.tsx` (16,073 bytes)
- **الصلاحية:** `training_portal`
- **الأنواع:**
  - `TrainingPathway`: مسار تدريبي (وحدات + تقدم + مُرشد + تواريخ)
  - `KSAAssessment`: اختبارات تقييم (أسئلة متعددة الخيارات + درجة النجاح)

### القسم 23: الامتثال والحوكمة (Compliance)
- **الملف:** `src/views/Compliance.tsx` (13,127 bytes)
- **Store:** `useComplianceStore.ts` (12,080 bytes — أكبر store)
- **الصلاحية:** `compliance_view`
- **الأنواع (`src/types/compliance.ts`):**
  - `ComplianceRecord`: سجل تجاري | ترخيص استثمار | شهادة زكاة (مع تنبيهات انتهاء)
  - `RiskRegister`: سجل المخاطر (تشغيلي/قانوني/تقني/مالي/امتثال) مع خطط معالجة
  - `Control`: ضوابط رقابية (وقائي/كاشف/تصحيحي) بتردد (يومي/أسبوعي/شهري/ربع سنوي)
  - `ComplianceIssue`: مشكلات امتثال مع أدلة (evidenceUrls)
  - `RegulatoryObligation`: التزامات تنظيمية مع الجهة الرقابية

### القسم 24: GRC (الحوكمة والمخاطر والامتثال)
- **الملف:** `src/views/GRC.tsx` (8,829 bytes)
- **الوصف:** عرض موحد لمكونات الحوكمة والمخاطر والامتثال

### القسم 25: المكتبة القانونية (Legal Library)
- **الملف:** `src/views/LegalLibrary.tsx` (10,726 bytes)
- **النوع:** `LegalPrecedent` (`src/types/clm.ts`)
- **الوصف:** مكتبة السوابق القضائية والأبحاث القانونية

### القسم 26: إدارة المستندات (Documents)
- **الملف:** `src/views/Documents.tsx` (15,740 bytes)
- **الوصف:** نظام مركزي لإدارة المستندات
- **أنواع المستندات:** مذكرة | لائحة | حكم | أخرى
- **رفع الملفات:** عبر `fileService.ts` إلى Supabase Storage
  - **الحد الأقصى:** 10MB
  - **الأنواع المسموحة:** PDF, DOC, DOCX, TXT
  - **المسار:** `{tenantId}/cases/{caseId}/{timestamp}_{filename}`
  - **Timeout:** 15 ثانية

### القسم 27: صانع العقود الذكي (AI Contracts)
- **الملف:** `src/views/Contracts.tsx` (7,948 bytes)
- **الوصف:** توليد مسودات عقود بالذكاء الاصطناعي
- **المحرك:** `draftLegalDocument(type, facts)` → Gemini API أو Mock Fallback
- **القوالب:** `ContractTemplate` (تجاري | عمالي | عقاري | أحوال شخصية)

### القسم 28: إدارة دورة حياة العقود - CLM (Contract Lifecycle Management)
- **الملف:** `src/views/CLM.tsx` (15,586 bytes)
- **Store:** `useCLMStore.ts` (4,806 bytes)
- **النوع:** `ContractRequest` (`src/types/clm.ts`)
- **مراحل دورة الحياة:**
  1. `طلب` → 2. `تفاوض` → 3. `مراجعة` → 4. `اعتماد` → 5. `توقيع` → 6. `متابعة التزامات` → 7. `تجديد/إنهاء`
- **الميزات:**
  - `ContractVersion[]`: تتبع الإصدارات مع ملخص التغييرات
  - `ApprovalStep[]`: سلسلة اعتماد متعددة المستويات
  - `ContractObligation[]`: التزامات تعاقدية مع مواعيد ومسؤولين

### القسم 29: التوقيع الإلكتروني (E-Signatures)
- **الملف:** `src/views/ESignatures.tsx` (10,572 bytes)
- **النوع:** `ESignatureRequest` (`src/types/clm.ts`)
- **الحالات:** بانتظار التوقيع | تم التوقيع | منتهي الصلاحية

### القسم 30: المحلل القانوني الذكي (AI Document Analyzer)
- **الملف:** `src/views/AIDocumentAnalyzer.tsx` (5,239 bytes)
- **المحرك:** `analyzeLegalDocument(content)` → Gemini API أو Mock
- **المخرجات:** نقاط القوة | المخاطر | التوصيات | الملخص | الدفوع

### القسم 31: بوابة الاستشارات (Advisory Desk)
- **الملف:** `src/views/AdvisoryDesk.tsx` (10,337 bytes)
- **Store:** `useAdvisoryStore.ts`
- **النوع:** `AdvisoryRequest` (`src/types/common.ts`)
- **مراحل الطلب:** جديد → قيد المراجعة → مسودة رأي → اعتماد شريك → مغلق
- **الأولويات:** منخفض | متوسط | عالي
- **SLA:** `slaDueAt` — موعد نهائي لكل طلب
- **الآراء:** `AdvisoryOpinion[]` — آراء متعددة من المستشارين
- **الاعتمادات:** `ApprovalFlow[]` — سلسلة اعتماد (بانتظار/معتمد/مرفوض)

### القسم 32: الملكية الفكرية (IP Operations)
- **الملف:** `src/views/IPOperations.tsx` (12,023 bytes)
- **Store:** `useIPStore.ts` (5,014 bytes)
- **الأنواع (`src/types/ip.ts`):**
  - `IPRecord`: علامة تجارية | براءة اختراع | حق مؤلف
  - `IPFiling`: طلبات التسجيل لدى الجهات
  - `IPRenewal`: تجديدات مع تنبيهات
  - `IPOpposition`: اعتراضات ضد أطراف أخرى
  - `IPEnforcementAction`: إنفاذ الحقوق (إنذار/دعوى/تسوية/تنفيذ حكم)

### القسم 33: المسارات المتخصصة (Specialized Tracks)
- **الملف:** `src/views/SpecializedTracks.tsx` (11,141 bytes)
- **النوع:** `SpecializedTrack` (`src/types/case.ts`)
- **الوصف:** مسارات إجرائية مخصصة حسب نوع القضية
- **أنواع المسارات:** عمالي | جزائي
- **الميزات:**
  - `checklist[]`: قائمة مهام خاصة بالمسار
  - `documentTemplates[]`: نماذج مستندات (مذكرة/صحيفة/لائحة/اعتراض)
  - `steps[]`: خطوات سير العمل مع مواعيد
  - `slaDueAt`: SLA للمسار
  - الحالة: نشط | متأخر | مغلق

### القسم 34: قاعدة المعرفة القانونية (Internal Wiki)
- **الملف:** `src/views/InternalWiki.tsx` (12,232 bytes)
- **النوع:** `WikiArticle` + `KnowledgeAsset` (`src/types/clm.ts` + `common.ts`)
- **فئات Wiki:** أبحاث | إجراءات | نماذج | أنظمة
- **فئات Knowledge:** Research | Precedent | Procedure | Template
- **الميزات:** تاغات | نسخ | مؤلف | تحقق | ربط بقضايا

### القسم 35: سجل العمليات والتدقيق (Audit Logs)
- **الملف:** `src/views/AuditLogs.tsx` (5,390 bytes)
- **النوع:** `AuditLog` (`src/types/common.ts`)
- **الحقول:** المستخدم | الإجراء | الوحدة | التفاصيل | الطابع الزمني | عنوان IP

### القسم 36: بوابة العميل (Client Portal)
- **الملف:** `src/views/ClientPortal.tsx` (18,378 bytes)
- **الوصف:** واجهة مستقلة للعملاء لتتبع سير قضاياهم
- **المسار:** `/client-portal` (بدون مصادقة Dashboard)

### القسم 37: إدارة بوابة العملاء (Portal Management)
- **الملف:** `src/views/PortalManagement.tsx` (17,891 bytes)
- **الوصف:** إدارة ما يظهر في بوابة العميل من جانب المحامي

### القسم 38: CRM
- **الملف:** `src/views/CRM.tsx` (6,664 bytes)
- **الوصف:** إدارة علاقات العملاء

### القسم 39: لوحة السوبر أدمن (Global Admin)
- **الملف:** `src/modules/admin/GlobalAdmin.tsx` (11,214 bytes)
- **الصلاحية:** `platform_admin`
- **الوصف:** لوحة إدارة المنصة الشاملة لجميع المكاتب (Super Admin)
- **Feature Flag:** `GLOBAL_ADMIN` (مفعّل)

### القسم 40: الإعدادات (Settings)
- **الملف:** `src/views/Settings.tsx` (10,255 bytes)
- **النوع:** `OfficeSettings` (`src/types/common.ts`)
- **الحقول:** اسم المكتب | الرقم الضريبي | العنوان | الهاتف | البريد | الشعار

---

## 🤖 نظام الذكاء الاصطناعي

### الهيكل
```
src/services/ai/
├── index.ts          ← الواجهة العامة (Facade)
├── apiClient.ts      ← اتصال بالخادم الخلفي
└── mockResponses.ts  ← ردود احتياطية محلية
```

### كيف يعمل النظام
```
1. المستخدم يطلب خدمة AI (استشارة / مسودة عقد / تحليل مستند)
2. النظام يحاول الاتصال بالخادم الخلفي (server.js → Gemini 2.5 Flash)
3. إذا نجح → يعيد رد Gemini الحقيقي
4. إذا فشل (لا خادم / لا مفتاح API / خطأ شبكة) → يعيد رداً محلياً ذكياً من mockResponses.ts
5. المستخدم لا يلاحظ أي فرق — النظام يعمل دائماً
```

### الوظائف الثلاث

| الوظيفة | الاستدعاء | Endpoint | الوصف |
|---|---|---|---|
| **المستشار القانوني** | `getLegalAssistantResponse(message, history)` | `POST /api/ai/legal-assistant` | استشارة قانونية حوارية |
| **صانع العقود** | `draftLegalDocument(type, facts)` | `POST /api/ai/draft` | توليد مسودة عقد |
| **محلل المستندات** | `analyzeLegalDocument(content)` | `POST /api/ai/analyze` | تحليل نص قانوني |

### أمان الـ AI (Backend Middleware)
- **Rate Limiting:** 10 طلبات/دقيقة لكل مستخدم
- **حد الطول:** userMessage ≤ 5000 حرف | facts ≤ 10000 حرف | content ≤ 50000 حرف
- **تنظيف المدخلات:** إزالة HTML/Script tags عبر `sanitizeInput()`
- **Timeout:** 30 ثانية لكل طلب
- **المصادقة:** JWT Bearer Token عبر `authMiddleware`
- **System Prompt:** `"أنت مساعد قانوني سعودي. الإجابة استرشادية ويجب مراجعتها من محامٍ مرخص."`
- **النموذج:** `gemini-2.5-flash`

### المساعد الذكي المحادثي
- **الملف:** `src/components/ai/ChatAssistant.tsx` (8,252 bytes)
- **الوصف:** نافذة محادثة AI متاحة من أي مكان في التطبيق

---

## 🔐 نظام الأمان والتشفير

### تشفير البيانات الحساسة (AES-256)
- **الملف:** `src/lib/encryption.ts`
- **المكتبة:** `crypto-js`
- **المفتاح:** `VITE_ENCRYPTION_KEY` من متغيرات البيئة (fallback: `default-unsafe-dev-key-123456789`)
- **الحقول المشفرة:**
  - `nationalId` (الهوية الوطنية)
  - `commercialRegistration` (السجل التجاري)
  - `vatNumber` (الرقم الضريبي)
- **الوظائف:**
  - `encryptField(value)` → AES.encrypt → Base64 string
  - `decryptField(encrypted)` → AES.decrypt → النص الأصلي
- **التدفق:** البيانات تُشفّر في المتصفح **قبل** إرسالها إلى Supabase ← وتُفك عند الجلب

### أمان الخادم (server.js)
- **Helmet:** CSP + X-Frame-Options: DENY + HSTS (1 سنة + preload)
- **CORS:** أصول محددة فقط (localhost:5173, localhost:3000, malaf.site)
- **Rate Limiting:** 10 req/min لـ AI endpoints
- **Auth Middleware:** التحقق من JWT Token
- **Input Sanitization:** إزالة HTML tags

### Logger مع REDACTION
- **الملف:** `src/observability/logger.ts`
- **الحقول المخفية تلقائياً:** أي حقل يحتوي على: `token`, `password`, `secret`, `email`, `phone`, `nationalId`, `vat`, `commercialRegistration` → يظهر كـ `[REDACTED]`

---

## 👥 نظام الأدوار والصلاحيات (RBAC)

### الملف: `src/security/rbac.ts` + `src/store/useAuthStore.ts`

### الأدوار (UserRole)
| الدور العربي | System Role | الوصف |
|---|---|---|
| `مدير مكتب` | `admin` | صلاحيات كاملة (*) |
| `محامي شريك` | `lawyer` | صلاحيات كاملة (*) |
| `محامي` | `lawyer` | view_cases, edit_cases, view_clients, legal_qa, conflict_check |
| `محامي مستشار` | `lawyer` | view_cases, view_clients, legal_qa, conflict_check, view_reports |
| `محامي متدرب` | `lawyer` | view_cases, training_portal, view_wiki |
| `سكرتير` | `staff` | view_clients, edit_clients, view_cases, documents, finance_basic |

### الصلاحيات المتاحة
| الصلاحية | الأقسام المرتبطة |
|---|---|
| `view_clients` | العملاء |
| `edit_clients` | تعديل العملاء |
| `view_cases` | القضايا + رول الجلسات |
| `edit_cases` | تعديل القضايا |
| `finance_basic` | المالية + المصروفات |
| `manage_team` | إدارة الفريق |
| `view_reports` | التحليلات + تقارير الشركاء + تطوير الأعمال + سجل العمليات |
| `compliance_view` | الامتثال والحوكمة |
| `legal_qa` | المراجعة المهنية |
| `training_portal` | أكاديمية التدريب |
| `view_wiki` | قاعدة المعرفة |
| `conflict_check` | فحص تعارض المصالح |
| `documents` | المستندات |
| `platform_admin` | لوحة السوبر أدمن |

### آلية التطبيق
1. **Sidebar:** يُخفي العناصر التي لا يملك المستخدم صلاحيتها عبر `navItems.filter(item => !item.permission || hasPermission(item.permission))`
2. **PermissionGate (App.tsx):** يُعيد توجيه المستخدم إلى `/dashboard` إذا لم يملك الصلاحية
3. **hasPermission():** يفحص `rolePerms.includes('*') || rolePerms.includes(action)`

---

## 🏢 نظام Multi-Tenancy

### الملف: `src/lib/tenant.ts`

### آلية العمل
```
1. AuthProvider يقرأ tenant_id من جدول users في Supabase بعد تسجيل الدخول
2. يتم تخزينه في ذاكرة التطبيق عبر setTenantIdCache()
3. كل استعلام Supabase يستخدم getCurrentTenantId() لإضافة فلتر tenant_id
4. RLS Policies في PostgreSQL تمنع أي وصول لبيانات مكتب آخر
5. في وضع الديمو: DEMO_TENANT_ID = "demo-tenant"
```

### عزل البيانات
- كل جدول يحتوي على عمود `tenant_id`
- دالة PostgreSQL `get_my_tenant_id()` تجلب tenant_id من جدول users حسب `auth.uid()`
- كل policy تفحص `tenant_id = get_my_tenant_id()`

---

## 💳 نظام الاشتراكات والتسعير

### الملف: `src/modules/subscriptions/subscriptionService.ts`

### الخطط الثلاث
| الميزة | Basic (أساسية) | Advanced (متقدمة) | Enterprise (مؤسسات) |
|---|---|---|---|
| **السعر الشهري** | 299 ر.س | 699 ر.س | 1,499 ر.س |
| **السعر السنوي** | 2,990 ر.س | 6,990 ر.س | 14,990 ر.س |
| **عدد المستخدمين** | 5 | 20 | غير محدود |
| **عدد القضايا** | 50 | 500 | غير محدود |
| **التخزين** | 5GB | 50GB | 500GB |
| **الميزات** | إدارة عملاء + قضايا + فواتير ZATCA + تقويم + AI محدود | + CLM + تحصيل + فحص تعارض + تتبع وقت + تقارير + إشعارات | + GRC + تقارير شركاء + بوابة عميل + IP + مسارات متخصصة + دعم أولوية |

### التحقق من الحصص (Quota Enforcement)
```typescript
checkQuota(subscription, 'users') → { allowed: boolean, current: number, max: number }
checkQuota(subscription, 'cases') → { allowed: boolean, current: number, max: number }
// max = -1 يعني غير محدود (Enterprise)
```

### بوابة الدفع
- **Facade جاهز لـ:** Moyasar / Stripe
- **الحالة الحالية:** Mock (محاكاة)
- **الوظائف:** `initializePayment(tenantId, plan, billing)` | `verifyPayment(sessionId)`

---

## 🚩 Feature Flags

### الملف: `src/config/features.ts`

| المفتاح | الاسم العربي | الحالة | الوصف |
|---|---|---|---|
| `TENANT_ONBOARDING` | تسجيل المكاتب | ✅ مفعّل | صفحة تسجيل مكتب جديد |
| `SUBSCRIPTION_MANAGEMENT` | إدارة الاشتراكات | ✅ مفعّل | نظام الخطط (Moyasar/Stripe) |
| `GLOBAL_ADMIN` | لوحة السوبر أدمن | ✅ مفعّل | إدارة جميع المكاتب |
| `EMAIL_NOTIFICATIONS` | الإشعارات البريدية | ✅ مفعّل | إشعارات الجلسات والفواتير |
| `MOYASAR_PAYMENTS` | بوابة الدفع الإلكتروني | ❌ معطّل | Paymob / Fawry |

### الوظائف
- `isFeatureEnabled(key)` → `boolean`
- `getAllFeatureFlags()` → عرض في لوحة الأدمن
- `setFeatureFlag(key, enabled)` → تبديل في وقت التشغيل

---

## 🗄️ قاعدة البيانات والجداول

### الملف: `schema.sql`

### جدول المستخدمين (users)
| العمود | النوع | الوصف |
|---|---|---|
| `id` | UUID (PK) | معرف فريد |
| `auth_id` | UUID (FK → auth.users) | ربط بـ Supabase Auth |
| `email` | TEXT (UNIQUE, NOT NULL) | البريد الإلكتروني |
| `name` | TEXT (NOT NULL) | الاسم |
| `role` | TEXT (CHECK) | مدير مكتب / محامي شريك / محامي مستشار / محامي متدرب / مساعد إداري |
| `avatar_url` | TEXT | رابط الصورة |
| `tenant_id` | UUID | معرف المكتب |
| `created_at` | TIMESTAMPTZ | وقت الإنشاء |

### جدول العملاء (clients)
| العمود | النوع | الوصف |
|---|---|---|
| `id` | UUID (PK) | معرف فريد |
| `tenant_id` | UUID | معرف المكتب |
| `type` | TEXT (CHECK: فرد/منشأة) | نوع العميل |
| `name` | TEXT (NOT NULL) | الاسم |
| `national_id` | TEXT | الهوية (مشفّر AES-256) |
| `commercial_registration` | TEXT | السجل التجاري (مشفّر) |
| `vat_number` | TEXT | الرقم الضريبي (مشفّر) |
| `phone` | TEXT | رقم الجوال |
| `created_at` | TIMESTAMPTZ | وقت الإنشاء |

### جدول القضايا (cases)
| العمود | النوع | الوصف |
|---|---|---|
| `id` | UUID (PK) | معرف فريد |
| `tenant_id` | UUID | معرف المكتب |
| `client_id` | UUID (FK → clients, CASCADE) | ربط بالموكل |
| `client_role` | TEXT (CHECK: مدعي/مدعى عليه) | صفة الموكل |
| `workflow_stage` | TEXT | مرحلة سير العمل |
| `court` | TEXT (NOT NULL) | المحكمة |
| `circuit` | TEXT | الدائرة |
| `title` | TEXT | مسمى القضية |
| `automated_number` | TEXT | الرقم الآلي |
| `circulation_code` | TEXT | كود التداول |
| `archive_code` | TEXT | كود الحفظ |
| `type` | TEXT (CHECK, NOT NULL) | تجاري/عمالي/عام/جزائي/أحوال شخصية/إداري |
| `plaintiff` | TEXT (NOT NULL) | المدعي |
| `defendant` | TEXT (NOT NULL) | المدعى عليه |
| `power_of_attorney_ref` | TEXT | رقم الوكالة |
| `status` | TEXT (CHECK, NOT NULL) | متداولة/مغلقة/تحت الدراسة/محفوظة |
| `external_platform_ref` | TEXT | ربط بمنصة التقاضي |
| `created_at` | TIMESTAMPTZ | وقت الإنشاء |

---

## 🔒 سياسات RLS الأمنية

### الملف: `rls-policies.sql`

### الدالة المساعدة
```sql
get_my_tenant_id() → يجلب tenant_id من جدول users حيث auth_id = auth.uid()
```

### سياسات جدول users
| السياسة | العملية | الشرط |
|---|---|---|
| `users_select_same_tenant` | SELECT | `tenant_id = get_my_tenant_id()` |
| `users_update_own_profile` | UPDATE | `auth_id = auth.uid()` |
| `users_insert_same_tenant` | INSERT | `tenant_id = get_my_tenant_id()` |
| `users_insert_own_profile` | INSERT | `auth_id = auth.uid()` (للتسجيل الأول) |

### سياسات جدول clients
| السياسة | العملية | الشرط |
|---|---|---|
| `clients_select_same_tenant` | SELECT | `tenant_id = get_my_tenant_id()` |
| `clients_insert_same_tenant` | INSERT | `tenant_id = get_my_tenant_id()` |
| `clients_update_same_tenant` | UPDATE | `tenant_id = get_my_tenant_id()` |
| `clients_delete_same_tenant` | DELETE | `tenant_id = get_my_tenant_id()` |

### سياسات جدول cases
| السياسة | العملية | الشرط |
|---|---|---|
| `cases_select_same_tenant` | SELECT | `tenant_id = get_my_tenant_id()` |
| `cases_insert_same_tenant` | INSERT | `tenant_id = get_my_tenant_id()` |
| `cases_update_same_tenant` | UPDATE | `tenant_id = get_my_tenant_id()` |
| `cases_delete_same_tenant` | DELETE | `tenant_id = get_my_tenant_id()` |

---

## 🖥️ الخادم الخلفي (Backend API)

### الملف: `server.js` (321 سطر)

### نقاط النهاية (Endpoints)

| Method | Endpoint | Auth | Rate Limit | الوصف |
|---|---|---|---|---|
| `GET` | `/api/health` | ❌ | ❌ | فحص صحة الخادم |
| `POST` | `/api/ai/legal-assistant` | ✅ JWT | 10/min | المستشار القانوني AI |
| `POST` | `/api/ai/draft` | ✅ JWT | 10/min | صانع العقود AI |
| `POST` | `/api/ai/analyze` | ✅ JWT | 10/min | محلل المستندات AI |
| `POST` | `/api/cases` | ✅ JWT | ❌ | إنشاء قضية (RBAC: ليس client) |
| `PUT` | `/api/cases/:id` | ✅ JWT | ❌ | تعديل قضية (tenant check) |
| `DELETE` | `/api/cases/:id` | ✅ JWT | ❌ | حذف قضية (tenant check) |

### Middleware Stack
```
Request → pinoHttp(logger) → compression → helmet(CSP) → cors → express.json
    → [AI routes]: authMiddleware → aiSecurityMiddleware → aiRateLimiter → handler
    → [Case routes]: authMiddleware → handler
```

### Static File Serving
- إذا وُجد مجلد `dist/` ← يقدم الـ Frontend كـ SPA
- `app.get('*')` → `index.html` (SPA fallback)

---

## 🧠 إدارة الحالة (State Management)

### المكتبة: Zustand 5.x

### الـ Stores الأربعة عشر

| Store | الملف | الحجم | الوصف الرئيسي |
|---|---|---|---|
| `useAuthStore` | `useAuthStore.ts` | 1.4KB | المستخدم + isDemoMode + hasPermission() |
| `useClientsStore` | `useClientsStore.ts` | 2.6KB | قائمة العملاء + CRUD |
| `useCasesStore` | `useCasesStore.ts` | 2.4KB | قائمة القضايا + المواعيد النهائية |
| `useTeamStore` | `useTeamStore.ts` | 2.2KB | أعضاء الفريق + المهام |
| `useFinanceStore` | `useFinanceStore.ts` | 5.2KB | حسابات الأمانة + المالية |
| `useInvoicesStore` | `useInvoicesStore.ts` | 2.6KB | الفواتير + loadInvoices() |
| `useEnforcementStore` | `useEnforcementStore.ts` | 8.2KB | ملفات التنفيذ + الأوامر + الأصول |
| `useComplianceStore` | `useComplianceStore.ts` | 12.1KB | أكبر store — المخاطر + الضوابط + الامتثال |
| `useCLMStore` | `useCLMStore.ts` | 4.8KB | طلبات العقود + الإصدارات + الاعتمادات |
| `useIPStore` | `useIPStore.ts` | 5.0KB | الملكية الفكرية + التسجيلات + التجديدات |
| `useAnalyticsStore` | `useAnalyticsStore.ts` | 4.5KB | بيانات التحليلات والإحصائيات |
| `useAdvisoryStore` | `useAdvisoryStore.ts` | 1.6KB | طلبات الاستشارات |
| `useAppStore` | `useAppStore.ts` | 2.3KB | حالة التطبيق العامة |
| `useUIStore` | `useUIStore.ts` | 3.7KB | Sidebar state + الإشعارات + markAsRead |

### تدفق Bootstrap (App.tsx)
```
App mounts → useEffect → Promise.all([
  fetchClients(),     ← Supabase
  fetchCases(),       ← Supabase
  fetchTrustAccounts(), ← Supabase
  fetchEnforcement(), ← Supabase
  fetchTasks(),       ← Supabase
  fetchTeam()         ← Supabase
]) → تحديث الـ Stores → loadInvoices()
```

---

## ✅ نظام التحقق من المدخلات (Validation)

### الملف: `src/domain/schemas.ts` (Zod 4.x)

### ClientSchema
```
- type: enum ['فرد', 'منشأة']
- name: string.min(2) ← "الاسم يجب أن يكون حرفين على الأقل"
- phone: regex /^\+9665[0-9]{8}$/ ← "رقم الجوال بالصيغة السعودية +9665XXXXXXXX"
- nationalId: optional
- commercialRegistration: optional
- vatNumber: optional
```

### CaseSchema
```
- clientId: string.min(1) ← "يجب اختيار الموكل وربطه بالقضية"
- court: enum [10 محاكم]
- plaintiff: string.min(1)
- defendant: string.min(1)
- status: enum ['نشطة', 'تحت الدراسة', 'مغلقة']
```

### InvoiceSchema
```
- subtotal: number.positive()
- vatAmount: number.nonnegative() ← يجب = subtotal * 0.15 (±0.01)
- total: number.positive() ← يجب = subtotal + vatAmount (±0.01)
```

---

## 📤 نظام رفع الملفات

### الملف: `src/services/fileService.ts`

### القيود
| القيد | القيمة |
|---|---|
| الحد الأقصى للحجم | 10 MB |
| الأنواع المسموحة (MIME) | `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain` |
| الامتدادات المسموحة | `.pdf`, `.doc`, `.docx`, `.txt` |
| Bucket | `documents` |
| Timeout | 15,000 ms |

### مسار التخزين
```
{tenantId}/cases/{caseId}/{timestamp}_{sanitized_filename}
```

### التدقيق
- كل عملية رفع تُسجل في جدول `audit_logs` (tenant_id, user_id, action, file_name, file_size, file_type, storage_path)
- التسجيل non-blocking (فشل التدقيق لا يُفشل الرفع)

### أكواد الأخطاء
- `FILE_TOO_LARGE` ← "حجم الملف كبير جدًا (الحد الأقصى 10MB)"
- `FILE_TYPE_NOT_ALLOWED` ← "نوع الملف غير مسموح. المسموح: PDF, DOC, DOCX, TXT"
- `UPLOAD_TIMEOUT` ← "انتهت مهلة رفع الملف. يرجى التحقق من الاتصال."

---

## 📊 نظام المراقبة والتسجيل (Observability)

### Logger (Frontend)
- **الملف:** `src/observability/logger.ts`
- **المستويات:** info | warn | error
- **REDACTION تلقائي** للحقول الحساسة: token, password, secret, email, phone, nationalId, vat, commercialRegistration
- **الشكل:** `{ level, event, requestId, context, timestamp }`

### Health Check (Frontend)
- **الملف:** `src/observability/health.ts`
- **يعمل:** كل 60 ثانية في بيئة الإنتاج
- **يُسجل:** `healthcheck_ok` أو `healthcheck_failed`

### Logger (Backend)
- **المكتبة:** Pino + pino-http
- **المستوى:** يُحدد عبر `LOG_LEVEL` env var
- **الشكل:** JSON structured logs مع ISO timestamp

### Health Endpoint (Backend)
```
GET /api/health → { status: "ok", service: "mohamay-pro-saudi-production", timestamp: "..." }
```

---

## 📝 أنواع البيانات (Type System)

### ملخص جميع الأنواع

| الملف | الأنواع المعرّفة |
|---|---|
| `types/common.ts` | `UserRole`, `UserProfile`, `Document`, `Notification`, `OfficeSettings`, `AuditLog`, `Workflow`, `AdvisoryRequest`, `AdvisoryOpinion`, `ApprovalFlow`, `QAReview`, `KnowledgeAsset`, `TrainingPathway`, `KSAAssessment` |
| `types/case.ts` | `CourtType`, `Case`, `Session`, `Deadline`, `SpecializedWorkflowStep`, `SpecializedTrack` |
| `types/client.ts` | `Client`, `ConflictCheckRecord`, `ConflictCheck`, `Lead`, `KeyAccount` |
| `types/finance.ts` | `Expense`, `TimeEntry`, `TrustAccount`, `PricingStructure`, `PricingModel`, `CollectionAction`, `PaymentPlan`, `ReceivableAccount`, `Invoice` |
| `types/enforcement.ts` | `DebtorAsset`, `EnforcementOrder`, `EnforcementAction`, `EnforcementSource`, `ExecutionDocType`, `EnforcementCase` |
| `types/clm.ts` | `LegalPrecedent`, `ContractTemplate`, `Proposal`, `RFPSubmission`, `ESignatureRequest`, `WikiArticle`, `ContractVersion`, `ApprovalStep`, `ContractObligation`, `ContractRequest` |
| `types/compliance.ts` | `ComplianceRecord`, `RiskRegister`, `Control`, `ComplianceIssue`, `RegulatoryObligation` |
| `types/ip.ts` | `IPRecord`, `IPFiling`, `IPRenewal`, `IPOpposition`, `IPEnforcementAction` |
| `types/team.ts` | (Team Member types) |

---

## 🧩 طبقة Domain Logic

### الملف: `src/domain/`

| الملف | الوصف |
|---|---|
| `caseDomain.ts` | قواعد أعمال القضايا (تحقق من الروابط الإلزامية، منطق الأرشفة) |
| `clientDomain.ts` | قواعد أعمال العملاء (تحقق من نوع العميل + الحقول المطلوبة) |
| `financeDomain.ts` | حسابات مالية (VAT 15% + التحقق من المطابقة) |
| `legalWorkflow.ts` | تحويل حالة القضية إلى مرحلة Workflow: `mapCaseStatusToStage()` |
| `schemas.ts` | Zod schemas للتحقق (Client + Case + Invoice) |

---

## 🧪 الاختبارات

### الأداة: Vitest + @testing-library/react

### ملفات الاختبار
| الملف | يختبر |
|---|---|
| `src/caseDomain.test.ts` | قواعد أعمال القضايا |
| `src/clientDomain.test.ts` | قواعد أعمال العملاء |
| `src/financeDomain.test.ts` | قواعد أعمال المالية (VAT) |
| `src/domain/__tests__/` | اختبارات Domain Layer |
| `src/store/__tests__/` | اختبارات Zustand Stores |
| `src/security/__tests__/` | اختبارات RBAC |
| `src/lib/__tests__/` | اختبارات المكتبات المساعدة |

### الأوامر
```bash
npm test              # تشغيل الاختبارات مرة واحدة
npm run test:watch    # وضع المراقبة
npm run test:coverage # تغطية الاختبارات
```

### اختبارات E2E (Playwright)
مسار: تسجيل الدخول ← إنشاء عميل ← فتح قضية ← إصدار فاتورة — `e2e/core-flow.spec.ts`.
تختبر مسار Supabase Auth + RLS الحقيقي (وليس وضع المعاينة التجريبية، الذي لا
يُنشئ جلسة مصادقة حقيقية فيفشل كل حفظ بصمت بسبب RLS). تتطلب حساب اختبار
حقيقي مُفعّل مسبقاً — راجع `e2e/README.md` للإعداد. تُستثنى تلقائياً (skip)
بدون `TEST_USER_EMAIL`/`TEST_USER_PASSWORD`، وغير مفعّلة في CI افتراضياً
(`.github/workflows/e2e.yml`, يعمل يدوياً عبر workflow_dispatch أو بعد ضبط
الأسرار المطلوبة).
```bash
npm run test:e2e
```

---

## 🚀 التشغيل والنشر

### التطوير المحلي
```bash
npm install            # تنصيب الحزم
npm run dev            # تشغيل Frontend (Vite → port 3000)
node server.js         # تشغيل Backend (Express → port 3000) — في نافذة منفصلة
```

### البناء
```bash
npm run build          # بناء Frontend → dist/
npm run build:server   # بناء Backend TypeScript
npm run build:all      # بناء الكل
```

### البيانات التجريبية
```bash
npm run demo:seed      # بذر بيانات العرض
npm run demo:reset     # إعادة ضبط بيانات العرض
```

### النشر (Render)
- **ملف:** `render.yaml`
- يبني الـ Frontend → يُقدمه عبر Express static

### النشر (Vercel)
- **ملف:** `vercel.json`
- Serverless Functions في `api/`

### Docker
- **ملف:** `Dockerfile`

---

## 🔑 متغيرات البيئة

| المتغير | الوصف | مطلوب |
|---|---|---|
| `VITE_SUPABASE_URL` | رابط مشروع Supabase | ✅ |
| `VITE_SUPABASE_ANON_KEY` | مفتاح Supabase العام | ✅ |
| `VITE_ENCRYPTION_KEY` | مفتاح تشفير AES-256 | ✅ |
| `GEMINI_API_KEY` | مفتاح Google Gemini API | ❌ (يعمل بدونه مع Fallback) |
| `PORT` | منفذ الخادم (افتراضي: 3000) | ❌ |
| `LOG_LEVEL` | مستوى التسجيل (افتراضي: info) | ❌ |
| `ALLOWED_ORIGINS` | أصول CORS (مفصولة بفاصلة) | ❌ |

---

## 📈 خارطة الطريق

- [x] إطلاق النسخة التجريبية MVP
- [x] تفعيل نظام التشفير وعزل المكاتب
- [x] الانتقال من Firebase إلى Supabase (PostgreSQL)
- [x] إطلاق بوابة خاصة بالعملاء (Client Portal)
- [x] نظام الامتثال والحوكمة (GRC)
- [x] إدارة دورة حياة العقود (CLM)
- [x] نظام التنفيذ المالي وتحصيل الديون
- [x] الملكية الفكرية والمسارات المتخصصة
- [x] أكاديمية التدريب والمراجعة المهنية (QA)
- [x] إكمال مخطط قاعدة البيانات الكامل (~38 جدول) وسياسات RLS لكل الأقسام
- [x] ربط fetchTrustAccounts/fetchEnforcement/fetchTasks/fetchTeam بجداول Supabase فعلية
- [x] بنية خلفية حقيقية لبوابة الدفع Moyasar (تحتاج مفاتيح Moyasar فعلية لتفعيلها)
- [x] بنية خلفية حقيقية للإشعارات البريدية عبر Resend (تحتاج مفتاح فعلي + ربط نقاط الإرسال)
- [x] تكامل Sentry اختياري (Frontend + Backend) لتتبع الأخطاء
- [x] نسخ احتياطي دوري لقاعدة البيانات (GitHub Action + سكربت pg_dump)
- [ ] إطلاق تطبيق الجوال (React Native)
- [ ] الربط الفعلي مع بوابة ناجز (Najiz API)
- [ ] تفعيل بوابة الدفع الإلكتروني فعلياً (الواجهة والبنية الخلفية جاهزتان؛ يتطلب حساب Moyasar تجاري فعلي + المفاتيح)
- [ ] تفعيل الإشعارات البريدية فعلياً (يتطلب حساب Resend + ربط نقاط الإرسال بالفواتير/الجلسات)

---

## ✅ قائمة التحقق قبل الإطلاق التجاري (Go-Live Checklist)

> آخر مراجعة تقنية شاملة: `docs/qa/review-2026/` (17 مرحلة). تم إغلاق كل
> نتائج **Critical** القابلة للإصلاح في الكود مباشرة كما هو موثق أدناه.
> الفقرات المتبقية تتطلب قرارات/حسابات تجارية لا يمكن لأي وكيل تقني إنجازها
> نيابة عن المكتب.

### تم إنجازه في هذه المراجعة
- بناء كامل قاعدة البيانات (schema.sql + rls-policies.sql) لكل الأقسام الموثقة في هذا الملف، مع فهارس وحذف منطقي (Soft Delete) للسجلات القانونية/المالية.
- إغلاق ثغرة انتحال tenant_id، وتفعيل fail-closed في `getCurrentTenantId()` بدل الرجوع الصامت لـ demo-tenant.
- إصلاح مفتاح التشفير الافتراضي غير الآمن (يرمي خطأ في الإنتاج إن لم يُضبط).
- حجب عودي (Recursive Redaction) للبيانات الحساسة في السجلات (Logs).
- أعمدة Hash للبحث في الحقول المشفرة (الهوية الوطنية، السجل التجاري، الرقم الضريبي).
- ربط fetchTrustAccounts/fetchEnforcement/fetchTasks/fetchTeam بجداول Supabase حقيقية.
- إصلاح بوابة الدفع: لم تعد تُصدّق أي عملية دفع من طرف العميل — التحقق الوحيد عبر Webhook من Moyasar نفسه.
- health check حقيقي يفحص اتصال قاعدة البيانات فعلاً، بدل إرجاع "ok" دائماً.
- تفعيل `npm test` في CI (لم يكن يعمل أصلاً)، وإصلاح فحص الأنواع (`npm run lint`) الذي كان معطّلاً بعشرات الأخطاء غير الملحوظة — من ضمنها منطق انتقال حالة القضايا (`legalWorkflow.ts`) الذي كان يقارن بقيمة "نشطة" غير موجودة أصلاً في نوع `Case.status`، ما يعني تعطّل صامت لمنطق سير عمل القضايا.
- إصلاح صفحتي Analytics وCompliance اللتين كانتا تنهاران فوراً (ReferenceError) عند فتحهما.
- رسم الرسوم البيانية المفقودة في لوحة القيادة، وتسجيل مسار CRM اليتيم.
- تصحيح رموز HTTP (401 بدل 403)، وCSP/CORS أكثر صرامة في الإنتاج، وربط تحديد المعدل (Rate Limit) بالمكتب بدل IP، وإرجاع 404 JSON صحيح لمسارات API غير الموجودة.

### تم إنجازه في مراجعة متابعة لاحقة (نفس الفرع)
- ربط 9 مخازن بيانات إضافية كانت تعمل في ذاكرة المتصفح فقط (Compliance/GRC، CLM، IP، Advisory، CRM، مقتطفات القضايا، واجهة المستخدم) بجداول Supabase حقيقية عبر مساعد CRUD مشترك (`src/services/genericCrud.ts`)، وأُزيلت كل بيانات Mock الثابتة المتبقية.
- تخزين ملفات حقيقي: أُنشئت حاوية Supabase Storage الخاصة بالمستندات (لم تكن موجودة أصلاً رغم أن كود الرفع كان يشير إليها) بسياسات RLS معزولة بالمكتب، وأُعيد ربط صفحة المستندات لرفع/تنزيل حقيقي بدل بيانات وهمية وتنزيل نص تجريبي.
- حذف القضايا يحذفها فعلياً من قاعدة البيانات (Soft Delete) بدل حذفها من الذاكرة المحلية فقط.
- إعدادات المكتب تُحفظ في جدول `office_settings` بدل `localStorage` فقط، فتُزامن بين الأجهزة وأعضاء الفريق.
- أُزيل الرد الاحتياطي الوهمي لخدمة الذكاء الاصطناعي (كان يعرض نصاً قانونياً ثابتاً غير مرتبط بسؤال المستخدم عند تعطل الخادم، بلا أي إشارة أنه غير حقيقي) — الآن يظهر خطأ واضح بدلاً من ذلك.
- معالج الإعداد الأولي (`OnboardingFlow.tsx`) يحفظ بيانات المكتب فعلياً ويُنشئ دعوات فريق حقيقية بدل الاكتفاء بإشعار وهمي.
- إضافة `PermissionGate` لأكثر من 12 صفحة حساسة كانت متاحة لأي مستخدم مسجّل دخول (الحسابات الضمانية، التنفيذ، التحصيل، الامتثال، إدارة العقود، الملكية الفكرية، بوابة الاستشارات، الإعدادات، إدارة بوابة العميل...)، مع توسيع مصفوفة الصلاحيات (`useAuthStore.ts`) بصلاحيتين جديدتين (`manage_operations`, `manage_office`).
- صفحتا الشروط والأحكام وسياسة الخصوصية (`/terms`, `/privacy`) مع مربع موافقة إلزامي عند التسجيل — كانتا روابط `#` فارغة.
- واجهة تحصيل دفع Moyasar فعلية (`src/views/Billing.tsx`) تُكمل البنية الخلفية الموجودة مسبقاً، مع إغلاق ثغرة كانت تسمح للـ Webhook بتفعيل أي خطة بصرف النظر عن المبلغ المدفوع فعلياً.
- إضافة اختبارات E2E حقيقية بـ Playwright (`e2e/`) لمسار: تسجيل الدخول ← إنشاء عميل ← فتح قضية ← إصدار فاتورة.

### يتطلب إجراءً من فريقكم قبل الإطلاق
| البند | الحالة | الإجراء المطلوب |
|---|---|---|
| قاعدة بيانات الإنتاج | جاهزة كملفات SQL | تشغيل `schema.sql` ثم `rls-policies.sql` على مشروع Supabase الفعلي |
| بوابة الدفع Moyasar | البنية الخلفية + واجهة تحصيل البطاقة جاهزتان (`server.ts` + `src/views/Billing.tsx`) | إنشاء حساب Moyasar تجاري، وضبط `MOYASAR_SECRET_KEY`/`MOYASAR_WEBHOOK_SECRET` (خادم) و`VITE_MOYASAR_PUBLISHABLE_KEY` (عميل) |
| الإشعارات البريدية | نقطة `/api/notifications/email` جاهزة (Resend) | إنشاء حساب Resend، ضبط `RESEND_API_KEY`، وربط نقاط الإرسال الفعلية (تذكير جلسة، فاتورة جديدة...) |
| تتبع الأخطاء | مُدمج ومُعطّل افتراضياً | ضبط `SENTRY_DSN`/`VITE_SENTRY_DSN` |
| النسخ الاحتياطي | Workflow جاهز (`.github/workflows/backup.yml`) | ضبط الأسرار `DATABASE_URL`, `BACKUP_S3_BUCKET`, `AWS_*` في إعدادات المستودع |
| اختبارات E2E | موجودة (`e2e/core-flow.spec.ts`, Playwright) | إنشاء حساب اختبار مؤكَّد على مشروع Supabase الفعلي وضبط `TEST_USER_EMAIL`/`TEST_USER_PASSWORD` — راجع `e2e/README.md` |
| الربط مع ناجز | غير موجود | يتطلب اتفاقية/API رسمية مع وزارة العدل |
| التطبيق الجوال | غير موجود | خارج نطاق هذا الإصدار (React Native) |
| مراجعة قانونية/امتثال PDPL | لم تُجرَ | يُنصح بمراجعة قانونية مستقلة قبل معالجة بيانات عملاء حقيقيين |

---

## 🔍 ملاحظات مهمة للمراجعة

### مصطلحات قانونية سعودية ملزمة
- **وكالة** وليس "توكيل" → حقل `powerOfAttorneyRef`
- **مذكرة/لائحة** وليس "صحيفة" → حقل `memorandums[]`
- **رقم الجوال السعودي:** `+9665XXXXXXXX` (8 أرقام بعد 9665)
- **الرقم الضريبي:** 15 رقم (معيار ZATCA)
- **ضريبة القيمة المضافة:** 15% ثابتة

### الأنماط المعمارية
- **Lazy Loading:** كل الصفحات الـ 39 محملة كسولاً عبر `React.lazy()`
- **Facade Pattern:** خدمة AI (`src/services/ai/index.ts`) تخفي تفاصيل الاتصال بالخادم؛ لا يوجد رد وهمي احتياطي — فشل الاتصال يظهر كخطأ واضح للمستخدم بدل نص قانوني ثابت يبدو حقيقياً
- **Repository Pattern:** تجريد الوصول لبيانات القضايا
- **Feature Flags:** تفعيل/تعطيل ميزات بدون تغيير كود
- **Error Boundary:** معالجة أخطاء شاملة على مستوى التطبيق

### نقاط يجب الانتباه لها عند المراجعة
> الأقسام 1-2-3-5-6 أدناه كانت موثقة كمشاكل مفتوحة وتم إغلاقها في مراجعة
> الجاهزية للإطلاق (راجع "قائمة التحقق قبل الإطلاق" أعلاه) — أُبقيت هنا مع
> توضيح الحالة الحالية بدل حذفها، حتى يبقى السياق التاريخي واضحاً لمن يراجع
> الكود لاحقاً.

1. ~~**server.js** يستخدم Firebase Admin~~ ← تم: `server.ts`/`server.js` يستخدمان `supabase.auth.getUser()` حصراً.
2. ~~بعض الـ endpoints تستخدم `admin.firestore()`~~ ← تم: لا يوجد أي استخدام لـ Firestore في الكود الحالي.
3. **الحقول المشفرة** تُخزن كـ AES في PostgreSQL ← تم إضافة أعمدة `*_hash` (HMAC-SHA256) للبحث الدقيق، عبر `hashForSearch()` في `src/lib/encryption.ts` و`findClientByIdentifier()` في `legalDataService.ts`.
4. **MOYASAR_PAYMENTS** معطّل ← البنية الخلفية الحقيقية جاهزة (`POST /api/payments/initiate` + `POST /api/payments/webhook` في `server.ts`)، لكنها تبقى معطّلة حتى ضبط `MOYASAR_SECRET_KEY` فعلياً — راجع "قائمة التحقق قبل الإطلاق".
5. ~~بعض fetch functions تعيد مصفوفة فارغة~~ ← تم: `fetchTrustAccounts`/`fetchEnforcement`/`fetchTasks`/`fetchTeam` تستعلم من جداول Supabase فعلية.
6. ~~الـ CRM view غير مسجل~~ ← تم: مسجّل على `/dashboard/crm` ومضاف لقائمة التنقل الجانبية.

---

*تم بناء وتصميم هذا النظام ليكون نقطة تحول في سوق التقنية القانونية في المملكة العربية السعودية.*
*آخر تحديث: أغسطس 2026 (مراجعة جاهزية الإطلاق التجاري)*
