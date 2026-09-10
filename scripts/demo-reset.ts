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

// Must match DEMO_TENANT_ID in src/lib/tenant.ts and scripts/demo-seed.ts.
const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000000";

async function reset() {
  console.log("🧹 Resetting demo data from Supabase...\n");

  // Delete demo cases
  console.log("📂 Deleting demo cases...");
  const { error: casesError } = await supabase
    .from("cases")
    .delete()
    .eq("tenant_id", DEMO_TENANT_ID);
  if (casesError) {
    console.error("  ❌ Cases error:", casesError.message);
  } else {
    console.log("  ✅ Demo cases deleted.");
  }

  // Delete demo clients
  console.log("📋 Deleting demo clients...");
  const { error: clientsError } = await supabase
    .from("clients")
    .delete()
    .eq("tenant_id", DEMO_TENANT_ID);
  if (clientsError) {
    console.error("  ❌ Clients error:", clientsError.message);
  } else {
    console.log("  ✅ Demo clients deleted.");
  }

  console.log("\n🎉 Demo reset complete!");
}

reset().catch(console.error);
