/**
 * Feature Flags Configuration
 * Controls which enterprise features are enabled in the platform.
 * Toggle flags here to activate/deactivate features without code changes.
 */

export interface FeatureFlag {
  key: string;
  label: string;
  enabled: boolean;
  description: string;
}

const featureFlags: Record<string, FeatureFlag> = {
  TENANT_ONBOARDING: {
    key: 'TENANT_ONBOARDING',
    label: 'تسجيل المكاتب',
    enabled: true,
    description: 'تفعيل صفحة تسجيل مكتب جديد والإعداد الأولي'
  },
  SUBSCRIPTION_MANAGEMENT: {
    key: 'SUBSCRIPTION_MANAGEMENT',
    label: 'إدارة الاشتراكات',
    enabled: true,
    description: 'تفعيل نظام الخطط والاشتراكات (Moyasar/Stripe)'
  },
  GLOBAL_ADMIN: {
    key: 'GLOBAL_ADMIN',
    label: 'لوحة السوبر أدمن',
    enabled: true,
    description: 'تفعيل لوحة إدارة المنصة الشاملة لجميع المكاتب'
  },
  EMAIL_NOTIFICATIONS: {
    key: 'EMAIL_NOTIFICATIONS',
    label: 'الإشعارات البريدية',
    // Was `true` with zero email provider wired anywhere in the codebase
    // (no SendGrid/Resend/nodemailer dependency, no send call) — a flag
    // that claims a feature works when it silently does nothing is worse
    // than one that's honestly off. POST /api/notifications/email now
    // exists (server.ts, via Resend) but nothing calls it yet; flip this
    // once session/invoice reminders are wired to call it.
    enabled: false,
    description: 'تفعيل إرسال إشعارات الجلسات والفواتير عبر البريد (Resend) — يتطلب RESEND_API_KEY وربط نقاط الإرسال'
  },
  MOYASAR_PAYMENTS: {
    key: 'MOYASAR_PAYMENTS',
    label: 'بوابة الدفع الإلكتروني',
    // The checkout UI (src/views/Billing.tsx) now exists — the remaining
    // gate is real credentials (MOYASAR_SECRET_KEY server-side,
    // VITE_MOYASAR_PUBLISHABLE_KEY client-side); the endpoint and the
    // checkout form both degrade to a clear "not configured yet" message
    // when those are unset, so it's safe to leave this on.
    enabled: true,
    description: 'الدفع الإلكتروني عبر Moyasar — يتطلب ضبط MOYASAR_SECRET_KEY و VITE_MOYASAR_PUBLISHABLE_KEY فعلياً ليعمل'
  }
};

/**
 * Check if a feature flag is enabled.
 */
export function isFeatureEnabled(key: string): boolean {
  return featureFlags[key]?.enabled ?? false;
}

/**
 * Get all feature flags for rendering in admin UI.
 */
export function getAllFeatureFlags(): FeatureFlag[] {
  return Object.values(featureFlags);
}

/**
 * Toggle a feature flag at runtime (useful for Super Admin).
 */
export function setFeatureFlag(key: string, enabled: boolean): void {
  if (featureFlags[key]) {
    featureFlags[key].enabled = enabled;
  }
}
