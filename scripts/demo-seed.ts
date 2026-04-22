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
    { id: "4", tenantId: DEMO_TENANT_ID, type: "فرد", name: "خالد بن عبدالله السبيعي", nationalId: "1022334455", phone: "+966505566778" },
    { id: "5", tenantId: DEMO_TENANT_ID, type: "منشأة", name: "شركة الأفق للمقاولات", commercialRegistration: "1010667788", vatNumber: "300066778800003", phone: "+966511223344" },
    { id: "6", tenantId: DEMO_TENANT_ID, type: "فرد", name: "نورة بنت فهد القحطاني", nationalId: "1033445566", phone: "+966566778899" },
    { id: "7", tenantId: DEMO_TENANT_ID, type: "منشأة", name: "مجموعة الشايع للتجارة", commercialRegistration: "1010778899", vatNumber: "300077889900003", phone: "+966588990011" },
    { id: "8", tenantId: DEMO_TENANT_ID, type: "فرد", name: "علي بن حسن الزهراني", nationalId: "1044556677", phone: "+966509988776" },
    { id: "9", tenantId: DEMO_TENANT_ID, type: "منشأة", name: "شركة الطاقة المتكاملة", commercialRegistration: "1010889900", vatNumber: "3000889900003", phone: "+966577889900" },
    { id: "10", tenantId: DEMO_TENANT_ID, type: "فرد", name: "أحمد بن محمود الحربي", nationalId: "1055667788", phone: "+966533445566" },
  ];
}

function buildDemoCases() {
  const cases = [];
  for (let i = 1; i <= 8; i++) {
    cases.push({
      id: `C-200${i}`,
      tenantId: DEMO_TENANT_ID,
      workflowStage: i % 2 === 0 ? "hearing" : "intake",
      court: i % 3 === 0 ? "المحكمة العامة" : "المحكمة التجارية",
      type: i % 2 === 0 ? "تجاري" : "عام",
      plaintiff: i % 2 === 0 ? "شركة الراجحي العقارية" : "محمد بن سلمان العتيبي",
      defendant: `الخصم رقم ${i}`,
      memorandums: [`مذكرة رقم ${i}`],
      powerOfAttorneyRef: `44${1000000 + i}`,
      status: i % 4 === 0 ? "مغلقة" : "نشطة",
      najizReferenceStatus: i % 2 === 0 ? "مربوط بناجز" : "غير مربوط",
      createdAt: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
    });
  }
  return cases;
}

function buildDemoInvoices() {
    const invoices = [];
    for (let i = 1; i <= 5; i++) {
        const base = 5000 * i;
        const vat = base * 0.15;
        invoices.push({
            id: `INV-2024-00${i}`,
            tenantId: DEMO_TENANT_ID,
            clientId: `${(i % 10) + 1}`,
            clientName: `عميل رقم ${(i % 10) + 1}`,
            base,
            vat,
            total: base + vat,
            status: i % 2 === 0 ? "مدفوعة" : "غير مدفوعة",
            date: new Date(Date.now() - i * 172800000).toISOString(),
        });
    }
    return invoices;
}

function buildDemoTeam() {
    return [
        { id: "T1", tenantId: DEMO_TENANT_ID, name: "د. عبدالمحسن القحطاني", role: "شريك مؤسس", email: "dr.qahtani@mohamy-pro.sa", avatar: "https://picsum.photos/seed/dr/200" },
        { id: "T2", tenantId: DEMO_TENANT_ID, name: "أ. سارة الشمري", role: "محامية استئناف", email: "s.shammari@mohamy-pro.sa", avatar: "https://picsum.photos/seed/sara/200" },
        { id: "T3", tenantId: DEMO_TENANT_ID, name: "أ. فيصل المطيري", role: "مستشار قانوني", email: "f.mutairi@mohamy-pro.sa", avatar: "https://picsum.photos/seed/faisal/200" },
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

  console.log("Authenticating demo admin...");
  await signInWithEmailAndPassword(auth, email, password);

  const clients = buildDemoClients();
  const cases = buildDemoCases();
  const invoices = buildDemoInvoices();
  const team = buildDemoTeam();

  console.log("Seeding clients...");
  for (const c of clients) {
    await setDoc(doc(db, "clients", c.id), c, { merge: true });
  }

  console.log("Seeding cases...");
  for (const c of cases) {
    await setDoc(doc(db, "cases", c.id), c, { merge: true });
  }

  console.log("Seeding invoices...");
  for (const inv of invoices) {
    await setDoc(doc(db, "invoices", inv.id), inv, { merge: true });
  }

  console.log("Seeding team members...");
  for (const t of team) {
    await setDoc(doc(db, "team", t.id), t, { merge: true });
  }

  console.log(`Seed complete: 
    - ${clients.length} clients
    - ${cases.length} cases
    - ${invoices.length} invoices
    - ${team.length} team members`);
}

seed().catch((err) => {
  console.error("Demo seed failed:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
