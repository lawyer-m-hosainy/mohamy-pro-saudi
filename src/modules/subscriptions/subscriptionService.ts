/**
 * Subscription Management Service
 * Defines 3 subscription tiers with quota limits.
 * Provides a Facade for future Moyasar/Stripe integration.
 */

export type PlanTier = 'basic' | 'advanced' | 'enterprise';

export interface SubscriptionPlan {
  tier: PlanTier;
  nameAr: string;
  nameEn: string;
  priceMonthly: number; // SAR
  priceYearly: number; // SAR
  maxUsers: number;
  maxCases: number;
  maxStorage: string; // e.g. "5GB"
  features: string[];
}

export interface TenantSubscription {
  tenantId: string;
  plan: PlanTier;
  status: 'active' | 'trial' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  currentUsers: number;
  currentCases: number;
}

// ── Plan Definitions ────────────────────────────────────────────────
export const PLANS: Record<PlanTier, SubscriptionPlan> = {
  basic: {
    tier: 'basic',
    nameAr: 'الأساسية',
    nameEn: 'Basic',
    priceMonthly: 299,
    priceYearly: 2990,
    maxUsers: 5,
    maxCases: 50,
    maxStorage: '5GB',
    features: [
      'إدارة العملاء والقضايا',
      'الفواتير الضريبية (ZATCA)',
      'التقويم والمواعيد',
      'مساعد الذكاء الاصطناعي (محدود)',
    ]
  },
  advanced: {
    tier: 'advanced',
    nameAr: 'المتقدمة',
    nameEn: 'Advanced',
    priceMonthly: 699,
    priceYearly: 6990,
    maxUsers: 20,
    maxCases: 500,
    maxStorage: '50GB',
    features: [
      'كل ميزات الأساسية',
      'إدارة العقود (CLM)',
      'نظام التحصيل',
      'فحص تعارض المصالح',
      'تتبع الوقت والفوترة',
      'تقارير متقدمة',
      'الإشعارات البريدية',
    ]
  },
  enterprise: {
    tier: 'enterprise',
    nameAr: 'المؤسسات',
    nameEn: 'Enterprise',
    priceMonthly: 1499,
    priceYearly: 14990,
    maxUsers: -1, // Unlimited
    maxCases: -1, // Unlimited
    maxStorage: '500GB',
    features: [
      'كل ميزات المتقدمة',
      'إدارة الامتثال (GRC)',
      'لوحة الشريك والتقارير التنفيذية',
      'بوابة العميل',
      'الملكية الفكرية',
      'المسارات المتخصصة',
      'الدعم الفني ذو الأولوية',
      'عدد غير محدود من المستخدمين والقضايا',
    ]
  }
};

// ── Quota Enforcement ───────────────────────────────────────────────
export function checkQuota(
  subscription: TenantSubscription,
  resource: 'users' | 'cases'
): { allowed: boolean; current: number; max: number } {
  const plan = PLANS[subscription.plan];
  const max = resource === 'users' ? plan.maxUsers : plan.maxCases;
  const current = resource === 'users' ? subscription.currentUsers : subscription.currentCases;

  // -1 means unlimited
  if (max === -1) return { allowed: true, current, max };

  return {
    allowed: current < max,
    current,
    max
  };
}

// ── Moyasar Payment Facade ──────────────────────────────────────────
// The card itself is tokenized client-side with Moyasar.js (never sent to
// our backend) into a `source` object; this just hands that token to our
// server, which holds the actual secret key (see POST /api/payments/initiate
// in server.ts). There is deliberately no client-side "verifyPayment" —
// the previous version of this file had one that unconditionally returned
// `success: true` with no server round-trip at all, meaning any signed-in
// user could grant themselves an Enterprise plan for free. Subscription
// status is only ever written by the Moyasar webhook (server.ts), after
// Moyasar itself confirms the charge.
export async function initializePayment(
  tenantId: string,
  plan: PlanTier,
  billing: 'monthly' | 'yearly',
  source: { type: string; [key: string]: unknown },
  accessToken: string
): Promise<{ id: string; status: string; transactionUrl: string | null }> {
  const res = await fetch('/api/payments/initiate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'x-tenant-id': tenantId,
    },
    body: JSON.stringify({ plan, billing, source }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.error || 'تعذر بدء عملية الدفع');
  }
  return body;
}
