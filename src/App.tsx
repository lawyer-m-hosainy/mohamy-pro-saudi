import React, { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RootLayout } from "./components/layout/RootLayout";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./components/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { fetchCases, fetchClients } from "@/services/legalDataService";
// import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useClientsStore } from "@/store/useClientsStore";
import { useCasesStore } from "@/store/useCasesStore";
import { useTeamStore } from "@/store/useTeamStore";
import { mockTasks, mockTeamMembers } from "@/mocks/data";
import { getCurrentTenantId } from "@/lib/tenant";
import { checkAppHealth } from "@/observability/health";
import { logEvent } from "@/observability/logger";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";

const Login = lazy(() => import("./views/Login"));
const Landing = lazy(() => import("./views/Landing"));
const Dashboard = lazy(() => import("./views/Dashboard"));
const Clients = lazy(() => import("./views/Clients"));
const Cases = lazy(() => import("./views/Cases"));
const Finance = lazy(() => import("./views/Finance"));
const Calendar = lazy(() => import("./views/Calendar"));
const Expenses = lazy(() => import("./views/Expenses"));
const Team = lazy(() => import("./views/Team"));
const Tasks = lazy(() => import("./views/Tasks"));
const Analytics = lazy(() => import("./views/Analytics"));
const Settings = lazy(() => import("./views/Settings"));
const Compliance = lazy(() => import("./views/Compliance"));
const LegalLibrary = lazy(() => import("./views/LegalLibrary"));
const Contracts = lazy(() => import("./views/Contracts"));
const Documents = lazy(() => import("./views/Documents"));
const IPManagement = lazy(() => import("./views/IPManagement"));
const TimeTracking = lazy(() => import("./views/TimeTracking"));
const ClientPortal = lazy(() => import("./views/ClientPortal"));
const PortalManagement = lazy(() => import("./views/PortalManagement"));
const ConflictCheck = lazy(() => import("./views/ConflictCheck"));
const TrustAccounting = lazy(() => import("./views/TrustAccounting"));
const Enforcement = lazy(() => import("./views/Enforcement"));
const AdvisoryDesk = lazy(() => import("./views/AdvisoryDesk"));
const GRC = lazy(() => import("./views/GRC"));
const Collections = lazy(() => import("./views/Collections"));
const CLM = lazy(() => import("./views/CLM"));
const IPOperations = lazy(() => import("./views/IPOperations"));
const SpecializedTracks = lazy(() => import("./views/SpecializedTracks"));
const AuditLogs = lazy(() => import("./views/AuditLogs"));
const AIDocumentAnalyzer = lazy(() => import("./views/AIDocumentAnalyzer"));
const InternalWiki = lazy(() => import("./views/InternalWiki"));
const BDDashboard = lazy(() => import("./views/BDDashboard"));
const LegalQA = lazy(() => import("./views/LegalQA"));
const TrainingPortal = lazy(() => import("./views/TrainingPortal"));
const PartnerReporting = lazy(() => import("./views/PartnerReporting"));

// Enterprise Modules
const OnboardingFlow = lazy(() => import("./modules/onboarding/OnboardingFlow"));
const GlobalAdmin = lazy(() => import("./modules/admin/GlobalAdmin"));

function PermissionGate({ children, permission, fallback = <Navigate to="/dashboard" replace /> }: { children: React.ReactNode; permission: string; fallback?: React.ReactNode }) {
  const hasPermission = useAuthStore(state => state.hasPermission);
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}

export default function App() {
  const setClients = useClientsStore(state => state.setClients);
  const setCases = useCasesStore(state => state.setCases);

  /** Team tasks/members are not loaded from Firestore yet — seed demo data once so /dashboard/tasks is usable. */
  useEffect(() => {
    const { tasks, teamMembers, setTasks, setTeamMembers } = useTeamStore.getState();
    if (tasks.length === 0) {
      setTasks(mockTasks);
    }
    if (teamMembers.length === 0) {
      setTeamMembers(mockTeamMembers);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      try {
        const [remoteClients, remoteCases] = await Promise.all([fetchClients(), fetchCases()]);
        const tenantId = getCurrentTenantId();
        if (!mounted) return;
        if (remoteClients.length > 0) {
          setClients(remoteClients);
        } else {
          setClients(
            useClientsStore
              .getState()
              .clients.map((c) => ({ ...c, tenantId: c.tenantId || tenantId }))
          );
        }
        if (remoteCases.length > 0) {
          setCases(remoteCases);
        } else {
          // Keep demo behavior but ensure local data respects tenant-aware model.
          setCases(
            useCasesStore
              .getState()
              .cases.map((c) => ({ ...c, tenantId: c.tenantId || tenantId }))
          );
        }
      } catch {
        // Keep demo flow working with local mock data as fallback.
      }
    };

    void bootstrap();
    return () => {
      mounted = false;
    };
  }, [setClients, setCases]);

  useEffect(() => {
    const runHealthCheck = async () => {
      if (import.meta.env.DEV) return;
      try {
        await checkAppHealth();
        logEvent("info", { event: "healthcheck_ok" });
      } catch {
        logEvent("warn", { event: "healthcheck_failed" });
      }
    };

    void runHealthCheck();
    const id = window.setInterval(() => {
      void runHealthCheck();
    }, 60_000);

    return () => window.clearInterval(id);
  }, []);

  return (
    // @ts-ignore - next-themes version mismatch with React 19 types
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        {import.meta.env.PROD && (
          <div className="bg-primary-600 text-white text-[10px] py-1 text-center font-bold sticky top-0 z-[100] shadow-sm select-none">
            بيئة العرض التجريبي - محامي برو (لأغراض الاستعراض فقط)
          </div>
        )}
        <Toaster richColors position="top-center" />
        <BrowserRouter>
          <ErrorBoundary fallbackModule="التطبيق الرئيسي">
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/onboarding" element={<OnboardingFlow />} />
              <Route path="/client-portal" element={<ClientPortal />} />
              
              <Route path="/dashboard" element={<ProtectedRoute><RouteLayoutWrapper /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="clients" element={<Clients />} />
              <Route path="cases" element={<Cases />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="finance" element={<Finance />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="team" element={<Team />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="analytics" element={<PermissionGate permission="view_reports"><Analytics /></PermissionGate>} />
              <Route path="compliance" element={<PermissionGate permission="compliance_view"><Compliance /></PermissionGate>} />
              <Route path="library" element={<LegalLibrary />} />
              <Route path="contracts" element={<Contracts />} />
              <Route path="documents" element={<Documents />} />
              <Route path="ip-management" element={<IPManagement />} />
              <Route path="time-tracking" element={<TimeTracking />} />
              <Route path="client-portal" element={<PortalManagement />} />
              <Route path="conflict-check" element={<ConflictCheck />} />
              <Route path="trust-accounting" element={<TrustAccounting />} />
              <Route path="enforcement" element={<Enforcement />} />
              <Route path="advisory-desk" element={<AdvisoryDesk />} />
              <Route path="grc" element={<GRC />} />
              <Route path="collections" element={<Collections />} />
              <Route path="clm" element={<CLM />} />
              <Route path="ip-operations" element={<IPOperations />} />
              <Route path="specialized-tracks" element={<SpecializedTracks />} />
              <Route path="audit-logs" element={<PermissionGate permission="view_reports"><AuditLogs /></PermissionGate>} />
              <Route path="ai-analyzer" element={<AIDocumentAnalyzer />} />
              <Route path="wiki" element={<InternalWiki />} />
              <Route path="bd" element={<PermissionGate permission="view_reports"><BDDashboard /></PermissionGate>} />
              <Route path="qa" element={<PermissionGate permission="legal_qa"><LegalQA /></PermissionGate>} />
              <Route path="training" element={<PermissionGate permission="training_portal"><TrainingPortal /></PermissionGate>} />
              <Route path="partner-reports" element={<PermissionGate permission="view_reports"><PartnerReporting /></PermissionGate>} />
              <Route path="platform-admin" element={<PermissionGate permission="platform_admin"><GlobalAdmin /></PermissionGate>} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* Redirect old routes if needed */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
          </ErrorBoundary>
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

function RouteLayoutWrapper() {
  return <RootLayout />;
}

function RouteLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-900">
      <span className="text-sm text-slate-500 dark:text-slate-300">جاري تحميل الصفحة...</span>
    </div>
  );
}

