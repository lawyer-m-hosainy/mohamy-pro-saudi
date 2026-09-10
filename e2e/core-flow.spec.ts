import { test, expect } from "@playwright/test";

/**
 * Core flow: login -> create a client -> create a case for that client ->
 * issue an invoice for that client. This exercises the real Supabase Auth
 * + RLS path end to end, not demo mode — demo mode never calls
 * supabase.auth.signIn (see src/views/Login.tsx), so every write it makes
 * is rejected by RLS (`tenant_id = get_my_tenant_id()`, which is null with
 * no authenticated session) and only *looks* like it worked because the
 * local Zustand state still updates optimistically. A real login is the
 * only way to actually verify persistence.
 *
 * Requires a pre-existing, already-confirmed Supabase Auth account (see
 * e2e/README.md for why sign-up isn't done here). Skips cleanly if
 * TEST_USER_EMAIL/TEST_USER_PASSWORD aren't set, so `npm run test:e2e`
 * is safe to run without them — it just reports the flow as skipped
 * instead of failing.
 */

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;

test.skip(
  !TEST_USER_EMAIL || !TEST_USER_PASSWORD,
  "TEST_USER_EMAIL/TEST_USER_PASSWORD not set — see e2e/README.md"
);

test("login, create a client, open a case for them, and issue an invoice", async ({ page }) => {
  const stamp = Date.now();
  const clientName = `عميل اختبار E2E ${stamp}`;
  const caseRef = `E2E-${stamp}`;

  // --- Login ---
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill(TEST_USER_EMAIL!);
  await page.getByLabel("كلمة المرور").fill(TEST_USER_PASSWORD!);
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

  // --- Create a client ---
  await page.goto("/dashboard/clients");
  await page.getByRole("button", { name: "إضافة عميل جديد" }).click();
  await page.locator("#name").fill(clientName);
  await page.locator("#phone").fill("+966500000000");
  await page.getByRole("button", { name: "حفظ العميل" }).click();
  await expect(page.getByText(clientName).first()).toBeVisible({ timeout: 10_000 });

  // --- Create a case for that client ---
  await page.goto("/dashboard/cases");
  await page.getByRole("button", { name: "قضية جديدة" }).click();
  await page.getByPlaceholder("مثلاً: 45-123-ت").fill(caseRef);
  await page.getByPlaceholder("اسم المدعي").fill(clientName);
  await page.getByPlaceholder("اسم المدعى عليه").fill("الطرف الآخر (اختبار)");
  await page.getByRole("button", { name: "حفظ القضية" }).click();
  await expect(page.getByText(caseRef).first()).toBeVisible({ timeout: 10_000 });

  // --- Issue an invoice for that client ---
  await page.goto("/dashboard/finance");
  await page.getByRole("button", { name: "إنشاء فاتورة ضريبية" }).click();
  await page.locator("#clientId").selectOption({ label: clientName });
  await page.locator("#base").fill("1000");
  await page.getByRole("button", { name: "حفظ وحساب الضريبة آلياً" }).click();
  await expect(page.getByText(clientName).first()).toBeVisible({ timeout: 10_000 });
});
