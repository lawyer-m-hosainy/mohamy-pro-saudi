import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { getCurrentTenantId } from "@/lib/tenant";
import {
  PLANS,
  PlanTier,
  TenantSubscription,
  fetchSubscription,
  initializePayment,
} from "@/modules/subscriptions/subscriptionService";

const MOYASAR_PUBLISHABLE_KEY = (import.meta as any).env?.VITE_MOYASAR_PUBLISHABLE_KEY as string | undefined;

async function tokenizeCard(card: {
  name: string;
  number: string;
  month: string;
  year: string;
  cvc: string;
}): Promise<{ id: string; transactionUrl: string | null }> {
  const res = await fetch("https://api.moyasar.com/v1/tokens", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${MOYASAR_PUBLISHABLE_KEY}:`)}`,
    },
    body: JSON.stringify({
      source: {
        type: "creditcard",
        name: card.name,
        number: card.number.replace(/\s+/g, ""),
        month: card.month,
        year: card.year,
        cvc: card.cvc,
      },
      // 3-D Secure is confirmed at payment-creation time (our own
      // /api/payments/initiate), not here — this call only turns the raw
      // card into a reusable token so it never reaches our own server.
      save_only: true,
      callback_url: `${window.location.origin}/dashboard/settings/billing`,
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.message || body?.errors?.[0] || "تعذر التحقق من بيانات البطاقة");
  }
  return { id: body.id, transactionUrl: body.source?.transaction_url ?? null };
}

export default function Billing() {
  const [searchParams] = useSearchParams();
  const [subscription, setSubscription] = useState<TenantSubscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>("basic");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [card, setCard] = useState({ name: "", number: "", month: "", year: "", cvc: "" });
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    fetchSubscription().then((sub) => {
      setSubscription(sub);
      setLoadingSubscription(false);
    });
  }, []);

  // Moyasar redirects back here after a 3-D Secure challenge with ?id=...&status=...
  const returnStatus = searchParams.get("status");
  useEffect(() => {
    if (!returnStatus) return;
    if (returnStatus === "paid") {
      toast.success("تم الدفع بنجاح، سيتم تفعيل الخطة خلال لحظات.");
      // Subscription activation happens via the Moyasar webhook, not this
      // redirect — poll briefly since the webhook may land a moment later.
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts += 1;
        const sub = await fetchSubscription();
        if (sub?.status === "active" || attempts >= 5) {
          setSubscription(sub);
          clearInterval(interval);
        }
      }, 2000);
      return () => clearInterval(interval);
    } else if (returnStatus === "failed") {
      toast.error("فشلت عملية الدفع. يرجى المحاولة مرة أخرى.");
    }
  }, [returnStatus]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!MOYASAR_PUBLISHABLE_KEY) {
      toast.error("بوابة الدفع غير مفعّلة بعد. يرجى التواصل مع الدعم.");
      return;
    }
    if (!card.name || card.number.replace(/\s+/g, "").length < 12 || !card.month || !card.year || !card.cvc) {
      toast.error("يرجى تعبئة بيانات البطاقة كاملة");
      return;
    }

    setIsPaying(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("يرجى إعادة تسجيل الدخول");
        return;
      }

      const { id: tokenId, transactionUrl: tokenizeRedirect } = await tokenizeCard(card);
      if (tokenizeRedirect) {
        window.location.href = tokenizeRedirect;
        return;
      }

      const payment = await initializePayment(
        getCurrentTenantId(),
        selectedPlan,
        billingCycle,
        { type: "token", token: tokenId },
        session.access_token
      );

      if (payment.transactionUrl) {
        window.location.href = payment.transactionUrl;
        return;
      }

      toast.success("تم إرسال طلب الدفع. سيتم تفعيل الخطة عند تأكيد الدفع.");
    } catch (error) {
      console.error("Payment failed:", error);
      toast.error(error instanceof Error ? error.message : "تعذر إتمام عملية الدفع");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">الفوترة والاشتراك</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">إدارة خطة اشتراك مكتبك وطريقة الدفع.</p>
      </div>

      {!MOYASAR_PUBLISHABLE_KEY && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            بوابة الدفع غير مُفعّلة بعد على هذه البيئة (يتطلب ضبط VITE_MOYASAR_PUBLISHABLE_KEY و MOYASAR_SECRET_KEY).
            يمكنك استعراض الخطط أدناه، لكن الدفع الفعلي معطّل حالياً.
          </p>
        </div>
      )}

      <Card className="border-none shadow-sm dark:bg-navy-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold">الخطة الحالية</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSubscription ? (
            <Loader2 className="animate-spin text-slate-400" size={20} />
          ) : subscription ? (
            <div className="flex items-center gap-3">
              <Badge className={cn(
                "text-white",
                subscription.status === "active" ? "bg-emerald-500" : subscription.status === "trial" ? "bg-amber-500" : "bg-slate-400"
              )}>
                {subscription.status === "active" ? "نشط" : subscription.status === "trial" ? "تجريبي" : subscription.status === "expired" ? "منتهي" : "ملغى"}
              </Badge>
              <span className="font-bold text-navy-900 dark:text-white">{PLANS[subscription.plan]?.nameAr}</span>
              {subscription.endDate && (
                <span className="text-sm text-slate-500">ينتهي في {new Date(subscription.endDate).toLocaleDateString("ar-SA")}</span>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">لا يوجد اشتراك نشط بعد. اختر خطة أدناه للبدء.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm dark:bg-navy-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold">اختر خطة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button type="button" variant={billingCycle === "monthly" ? "default" : "outline"} size="sm" onClick={() => setBillingCycle("monthly")}>شهري</Button>
            <Button type="button" variant={billingCycle === "yearly" ? "default" : "outline"} size="sm" onClick={() => setBillingCycle("yearly")}>سنوي (وفّر أكثر)</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(PLANS).map((plan) => (
              <button
                key={plan.tier}
                type="button"
                onClick={() => setSelectedPlan(plan.tier)}
                className={cn(
                  "p-4 rounded-xl border-2 text-start transition-all",
                  selectedPlan === plan.tier
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-slate-200 dark:border-white/10 hover:border-primary-300"
                )}
              >
                <span className="font-bold text-navy-900 dark:text-white">{plan.nameAr}</span>
                <p className="text-xl font-bold text-primary-600 dark:text-primary-400 mt-1">
                  {billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly}
                  <span className="text-xs font-normal text-slate-400"> ر.س/{billingCycle === "monthly" ? "شهر" : "سنة"}</span>
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm dark:bg-navy-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <CreditCard size={18} />
            بيانات البطاقة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePay} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="card-name">الاسم على البطاقة</Label>
              <Input id="card-name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="ALI AHMED" dir="ltr" className="dark:bg-white/5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-number">رقم البطاقة</Label>
              <Input id="card-number" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="4111 1111 1111 1111" dir="ltr" maxLength={19} className="dark:bg-white/5" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="card-month">الشهر</Label>
                <Input id="card-month" value={card.month} onChange={(e) => setCard({ ...card, month: e.target.value })} placeholder="MM" dir="ltr" maxLength={2} className="dark:bg-white/5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-year">السنة</Label>
                <Input id="card-year" value={card.year} onChange={(e) => setCard({ ...card, year: e.target.value })} placeholder="YY" dir="ltr" maxLength={2} className="dark:bg-white/5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-cvc">CVC</Label>
                <Input id="card-cvc" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} placeholder="123" dir="ltr" maxLength={4} className="dark:bg-white/5" />
              </div>
            </div>
            <Button type="submit" disabled={isPaying || !MOYASAR_PUBLISHABLE_KEY} className="w-full bg-primary-500 hover:bg-primary-600 text-white gap-2">
              {isPaying ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
              اشترك في خطة {PLANS[selectedPlan].nameAr}
            </Button>
            <p className="text-[11px] text-slate-400 text-center">
              بياناتك تُرسل مباشرة إلى بوابة الدفع Moyasar ولا تمر عبر خوادمنا.
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
