import { readFile } from "node:fs/promises";
import path from "node:path";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";

const DEMO_TENANT_ID = "demo-tenant";

async function loadFirebaseConfig() {
  const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
  const raw = await readFile(configPath, "utf8");
  return JSON.parse(raw);
}

function buildDemoClients() {
  return [
    { id: "1", tenantId: DEMO_TENANT_ID, type: "منشأة", name: "شركة الراجحي العقارية", commercialRegistration: "1010123456", vatNumber: "300012345600003", phone: "+966501234567" },
    { id: "2", tenantId: DEMO_TENANT_ID, type: "فرد", name: "محمد بن سلمان العتيبي", nationalId: "1098765432", phone: "+966551234567" },
    { id: "3", tenantId: DEMO_TENANT_ID, type: "منشأة", name: "مؤسسة الحلول الرقمية", commercialRegistration: "1010987654", vatNumber: "300098765400003", phone: "+966541234567" },
  ];
}

function buildDemoCases() {
  return [
    {
      id: "C-1001",
      tenantId: DEMO_TENANT_ID,
      workflowStage: "hearing",
      court: "المحكمة التجارية",
      type: "تجاري",
      plaintiff: "شركة الراجحي العقارية",
      defendant: "شركة النهضة للمقاولات",
      memorandums: ["مذكرة جوابية أولى", "لائحة اعتراضية"],
      powerOfAttorneyRef: "441234567",
      status: "نشطة",
      najizReferenceStatus: "مربوط بناجز",
      createdAt: "2024-01-15",
    },
    {
      id: "C-1002",
      tenantId: DEMO_TENANT_ID,
      workflowStage: "intake",
      court: "المحكمة العامة",
      type: "عام",
      plaintiff: "محمد بن سلمان العتيبي",
      defendant: "فهد بن عبدالعزيز الجبر",
      memorandums: ["لائحة دعوى"],
      powerOfAttorneyRef: "449876543",
      status: "تحت الدراسة",
      najizReferenceStatus: "غير مربوط",
      createdAt: "2024-02-10",
    },
  ];
}

async function seed() {
  const email = process.env.DEMO_ADMIN_EMAIL;
  const password = process.env.DEMO_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Missing DEMO_ADMIN_EMAIL or DEMO_ADMIN_PASSWORD environment variables.");
  }

  const cfg = await loadFirebaseConfig();
  const app = initializeApp(cfg);
  const auth = getAuth(app);
  const db = getFirestore(app, cfg.firestoreDatabaseId);

  await signInWithEmailAndPassword(auth, email, password);

  const clients = buildDemoClients();
  const cases = buildDemoCases();

  for (const c of clients) {
    await setDoc(doc(db, "clients", c.id), c, { merge: true });
  }

  for (const c of cases) {
    await setDoc(doc(db, "cases", c.id), c, { merge: true });
  }

  console.log(`Seed complete: ${clients.length} clients, ${cases.length} cases.`);
}

seed().catch((err) => {
  console.error("Demo seed failed:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
