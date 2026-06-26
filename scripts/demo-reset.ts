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

const DEMO_TENANT_ID = "demo-tenant";

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
