import { createClient } from "@supabase/supabase-js";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Must match DEMO_TENANT_ID in src/lib/tenant.ts exactly — the `tenant_id`
// columns in schema.sql are `uuid`, so the old value here ("demo-tenant")
// would fail every insert with a Postgres type error.
const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000000";

// clients.id/cases.id are uuid columns too (previously "client-1" etc,
// which fails the same way) — using fixed, readable UUIDs so re-running
// this script upserts the same rows instead of duplicating them.
const CLIENT_1 = "10000000-0000-0000-0000-000000000001";
const CLIENT_2 = "10000000-0000-0000-0000-000000000002";
const CLIENT_3 = "10000000-0000-0000-0000-000000000003";

const demoClients = [
  { id: CLIENT_1, name: "أحمد محمد العمري", type: "فرد", phone: "+966501234567", tenant_id: DEMO_TENANT_ID },
  { id: CLIENT_2, name: "شركة الأفق للتطوير العقاري", type: "منشأة", phone: "+966559876543", tenant_id: DEMO_TENANT_ID },
  { id: CLIENT_3, name: "فاطمة خالد السعيد", type: "فرد", phone: "+966532468101", tenant_id: DEMO_TENANT_ID },
];

// client_role/status/type must match schema.sql's check constraints
// exactly (previously used values like "نشطة" and "عقاري" that aren't in
// the allowed list, and "مدّعي" with a diacritic that doesn't match
// "مدعي" — every insert here would have been rejected by the DB).
const demoCases = [
  {
    id: "20000000-0000-0000-0000-000000000001",
    client_id: CLIENT_1,
    client_role: "مدعي",
    title: "مطالبة مالية",
    court: "المحكمة التجارية",
    circuit: "الدائرة الثالثة",
    plaintiff: "أحمد محمد العمري",
    defendant: "مؤسسة البناء المتحد",
    status: "متداولة",
    type: "تجاري",
    power_of_attorney_ref: "POA-DEMO-001",
    workflow_stage: "circulation",
    tenant_id: DEMO_TENANT_ID,
  },
  {
    id: "20000000-0000-0000-0000-000000000002",
    client_id: CLIENT_2,
    client_role: "مدعى عليه",
    title: "نزاع عقاري",
    court: "المحكمة العامة",
    circuit: "الدائرة الأولى",
    plaintiff: "مؤسسة الإعمار",
    defendant: "شركة الأفق للتطوير العقاري",
    status: "تحت الدراسة",
    type: "عام",
    power_of_attorney_ref: "POA-DEMO-002",
    workflow_stage: "study",
    tenant_id: DEMO_TENANT_ID,
  },
  {
    id: "20000000-0000-0000-0000-000000000003",
    client_id: CLIENT_3,
    client_role: "مدعي",
    title: "قضية أحوال شخصية",
    court: "محكمة الأحوال الشخصية",
    circuit: "الدائرة الثانية",
    plaintiff: "فاطمة خالد السعيد",
    defendant: "طرف آخر",
    status: "متداولة",
    type: "أحوال شخصية",
    power_of_attorney_ref: "POA-DEMO-003",
    workflow_stage: "hearing",
    tenant_id: DEMO_TENANT_ID,
  },
];

async function seed() {
  console.log("🌱 Seeding demo data into Supabase...\n");

  // Upsert clients
  console.log("📋 Inserting clients...");
  const { error: clientsError } = await supabase.from("clients").upsert(demoClients);
  if (clientsError) {
    console.error("  ❌ Clients error:", clientsError.message);
  } else {
    console.log(`  ✅ ${demoClients.length} clients inserted.`);
  }

  // Upsert cases
  console.log("📂 Inserting cases...");
  const { error: casesError } = await supabase.from("cases").upsert(demoCases);
  if (casesError) {
    console.error("  ❌ Cases error:", casesError.message);
  } else {
    console.log(`  ✅ ${demoCases.length} cases inserted.`);
  }

  console.log("\n🎉 Demo seed complete!");
}

seed().catch(console.error);
