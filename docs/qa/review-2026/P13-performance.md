# تقرير مراجعة الأداء وقابلية التوسع (P13)
**المرحلة:** P13 — Performance & Scalability Review  
**التاريخ:** 2026-07-03  
**النطاق:** `vite.config.ts`، `server.js`

## 1. غياب تقسيم الحزم (Chunk Splitting)
**الخطورة:** Medium  
**المشكلة:** إعدادات `vite.config.ts` أساسية جداً ولا تحتوي على أي تكوين لتقسيم الكود (`splitVendorChunkPlugin` أو `manualChunks`). بالنسبة لتطبيق ضخم يحتوي على لوحات تحكم ومخططات (`recharts`)، سيؤدي هذا إلى تحميل ملف JavaScript ضخم واحد عند فتح التطبيق، مما يبطئ زمن التحميل الأولي (FCP & TTI).
**التوصية:** تكوين `rollupOptions` في Vite لفصل المكتبات الكبيرة (مثل `react`, `recharts`, `lucide-react`) في حزم (chunks) منفصلة.

## 2. تطبيق Express يفتقر إلى التجميع (Clustering)
**الخطورة:** Low  
**المشكلة:** خادم `server.js` يعمل كعملية واحدة (Single Process) على خيط واحد (Single Thread). في بيئة إنتاجية تستقبل طلبات AI متزامنة واستعلامات قاعدة بيانات، قد يصبح هذا الخيط عنق زجاجة (Bottleneck).
**التوصية:** استخدام وحدة `cluster` في Node.js أو تشغيل التطبيق عبر مدير عمليات مثل `PM2` للاستفادة من كامل أنوية المعالج (Multi-core).
