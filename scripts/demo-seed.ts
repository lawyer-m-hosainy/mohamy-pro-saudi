import { createClient } from "@supabase/supabase-js";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DEMO_TENANT_ID = "demo-tenant";

const demoClients = [
  { id: "client-1", name: "أحمد محمد العمري", type: "فرد", phone: "+966501234567", tenant_id: DEMO_TENANT_ID },
  { id: "client-2", name: "شركة الأفق للتطوير العقاري", type: "منشأة", phone: "+966559876543", tenant_id: DEMO_TENANT_ID },
  { id: "client-3", name: "فاطمة خالد السعيد", type: "فرد", phone: "+966532468101", tenant_id: DEMO_TENANT_ID },
];

const demoCases = [
  {
    id: "case-1",
    client_id: "client-1",
    client_role: "مدّعي",
    title: "مطالبة مالية",
    court: "المحكمة التجارية",
    circuit: "الدائرة الثالثة",
    plaintiff: "أحمد محمد العمري",
    defendant: "مؤسسة البناء المتحد",
    status: "نشطة",
    type: "تجاري",
    workflow_stage: "circulation",
    tenant_id: DEMO_TENANT_ID,
  },
  {
    id: "case-2",
    client_id: "client-2",
    client_role: "مدّعى عليه",
    title: "نزاع عقاري",
    court: "المحكمة العامة",
    circuit: "الدائرة الأولى",
    plaintiff: "مؤسسة الإعمار",
    defendant: "شركة الأفق للتطوير العقاري",
    status: "تحت الدراسة",
    type: "عقاري",
    workflow_stage: "study",
    tenant_id: DEMO_TENANT_ID,
  },
  {
    id: "case-3",
    client_id: "client-3",
    client_role: "مدّعي",
    title: "قضية أحوال شخصية",
    court: "محكمة الأحوال الشخصية",
    circuit: "الدائرة الثانية",
    plaintiff: "فاطمة خالد السعيد",
    defendant: "طرف آخر",
    status: "نشطة",
    type: "أحوال شخصية",
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
