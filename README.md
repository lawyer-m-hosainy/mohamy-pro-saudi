# 🏛️ محامي برو — Mohamy Pro

> منصة SaaS متكاملة لإدارة مكاتب المحاماة السعودية

[![CI](https://github.com/YOUR_USERNAME/mohamy-pro-saudi/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/mohamy-pro-saudi/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)

## المزايا الرئيسية

| المديول | الوصف |
|---|---|
| **إدارة القضايا** | تتبع القضايا، المذكرات، الربط بناجز |
| **إدارة العملاء** | أفراد ومنشآت مع تحقق من الهوية الوطنية والسجل التجاري |
| **إدارة التنفيذ** | متابعة طلبات التنفيذ وإجراءات 46 |
| **تحصيل الديون** | خطط سداد وإنذارات قانونية |
| **فحص التعارض** | كشف التعارض المباشر وغير المباشر |
| **الذكاء الاصطناعي** | مستشار قانوني + صياغة تلقائية + تحليل وثائق |
| **إدارة العقود (CLM)** | دورة حياة العقد من المسودة إلى الاعتماد |
| **الملكية الفكرية** | تسجيل، تجديد، معارضة، إنفاذ |
| **المالية والضريبة** | فواتير ZATCA، ضريبة القيمة المضافة 15% |
| **التحليلات** | تقارير أداء شاملة للشركاء والمكتب |

## المكدس التقني

- **Frontend**: React 19 + TypeScript 5.8 + Vite 6
- **State**: Zustand 5
- **UI**: Tailwind CSS 4 + shadcn/ui + Radix
- **Auth**: Firebase Auth
- **Database**: Firestore  
- **AI**: Google Gemini 2.5 Flash
- **Charts**: Recharts 3

## البدء السريع

```bash
# تثبيت التبعيات
npm install

# تشغيل التطوير المحلي
npm run dev

# Type check
npm run lint

# بناء الإنتاج
npm run build
```

## متغيرات البيئة

```env
GEMINI_API_KEY=your_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_key
```

## البنية المعمارية

```
src/
├── application/     # Use Cases (أعمال التطبيق)
├── domain/          # Business Rules (القواعد القانونية)
├── repositories/    # Data Access Pattern  
├── services/        # External Services (Firebase, Gemini)
├── security/        # RBAC + Auth
├── observability/   # Logger + Health Check
├── store/           # Zustand State Management
├── views/           # 38 Page Components
├── components/      # Shared UI Components
├── lib/             # Utilities (Firebase, ZATCA, Tenant)
├── mocks/           # Demo Data
└── types/           # TypeScript Definitions
```

## الأمان

- ✅ Firebase Auth مع RBAC
- ✅ Firestore Rules مع Tenant Isolation
- ✅ Storage Rules مع حدود حجم ونوع
- ✅ AI API Rate Limiting (10 req/min)
- ✅ File Upload Validation (MIME + Extension)
- ✅ Structured Logging مع حماية البيانات الحساسة

## النشر

```bash
# Docker
docker build -t mohamy-pro .
docker run -p 4173:4173 mohamy-pro

# Render
# يتم النشر تلقائياً عند الدفع إلى main
```

## الترخيص

حقوق النشر محفوظة © 2026
