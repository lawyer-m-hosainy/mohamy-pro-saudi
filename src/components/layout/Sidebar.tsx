import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, Users, Scale, Calculator, Settings, Calendar, Wallet, 
  Users2, ListTodo, BarChart3, ShieldCheck, Library, FileEdit, Clock, 
  Fingerprint, Globe, Sparkles, Landmark, History, BookOpen, FileText, Briefcase, GraduationCap,
  Gavel, HandCoins, Zap, FileSignature, MessageSquare, Layers,
  PieChart as PieChartIcon, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";

const navItems = [
  { name: "لوحة القيادة", href: "/dashboard", icon: LayoutDashboard },
  { name: "العملاء", href: "/dashboard/clients", icon: Users, permission: "view_clients" },
  { name: "القضايا", href: "/dashboard/cases", icon: Scale, permission: "view_cases" },
  { name: "رول الجلسات", href: "/dashboard/roll", icon: Calendar, permission: "view_cases" },
  { name: "إدارة التنفيذ", href: "/dashboard/enforcement", icon: Gavel },
  { name: "تحصيل الديون", href: "/dashboard/collections", icon: HandCoins },
  { name: "تقويم الجلسات", href: "/dashboard/calendar", icon: Calendar },
  { name: "فحص التعارض", href: "/dashboard/conflict-check", icon: Zap },
  { name: "المهام", href: "/dashboard/tasks", icon: ListTodo },
  { name: "المالية والضريبة", href: "/dashboard/finance", icon: Calculator, permission: "finance_basic" },
  { name: "حسابات الأمانة", href: "/dashboard/trust-accounting", icon: Landmark },
  { name: "المصروفات", href: "/dashboard/expenses", icon: Wallet, permission: "finance_basic" },
  { name: "تتبع الوقت", href: "/dashboard/time-tracking", icon: Clock },
  { name: "فريق العمل", href: "/dashboard/team", icon: Users2, permission: "manage_team" },
  { name: "التحليلات", href: "/dashboard/analytics", icon: BarChart3, permission: "view_reports" },
  { name: "تقارير الشركاء", href: "/dashboard/partner-reports", icon: PieChartIcon, permission: "view_reports" },
  { name: "تطوير الأعمال", href: "/dashboard/bd", icon: Briefcase, permission: "view_reports" },
  { name: "المراجعة المهنية (QA)", href: "/dashboard/qa", icon: ShieldCheck, permission: "legal_qa" },
  { name: "أكاديمية التدريب", href: "/dashboard/training", icon: GraduationCap, permission: "training_portal" },
  { name: "الامتثال والحوكمة", href: "/dashboard/compliance", icon: ShieldCheck, permission: "compliance_view" },
  { name: "المكتبة القانونية", href: "/dashboard/library", icon: Library },
  { name: "إدارة المستندات", href: "/dashboard/documents", icon: FileText },
  { name: "صانع العقود الذكي", href: "/dashboard/contracts", icon: FileEdit },
  { name: "إدارة العقود (CLM)", href: "/dashboard/clm", icon: FileSignature },
  { name: "المحلل القانوني الذكي", href: "/dashboard/ai-analyzer", icon: Sparkles },
  { name: "بوابة الاستشارات", href: "/dashboard/advisory-desk", icon: MessageSquare },
  { name: "الملكية الفكرية", href: "/dashboard/ip-operations", icon: Fingerprint },
  { name: "المسارات المتخصصة", href: "/dashboard/specialized-tracks", icon: Layers },
  { name: "المعرفة القانونية", href: "/dashboard/wiki", icon: BookOpen },
  { name: "سجل العمليات", href: "/dashboard/audit-logs", icon: History, permission: "view_reports" },
  { name: "إدارة المنصة", href: "/dashboard/platform-admin", icon: Shield, permission: "platform_admin" },
];

export function Sidebar() {
  const hasPermission = useAuthStore(state => state.hasPermission);
  const isSidebarOpen = useUIStore(state => state.isSidebarOpen);
  const closeSidebar = useUIStore(state => state.closeSidebar);

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        />
      )}

      <aside className={cn(
        "bg-navy-900 dark:bg-black text-white flex flex-col h-[100dvh] fixed lg:sticky top-0 z-50 shadow-xl transition-transform duration-300 w-64 border-e border-navy-900/20 dark:border-white/10",
        isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0" 
      )}>
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-8 h-8 rounded bg-accent-500 flex items-center justify-center text-navy-900 font-bold">
          <Scale size={20} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">ليجل ERP</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.filter(item => !item.permission || hasPermission(item.permission)).map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={() => {
               if (window.innerWidth < 1024) closeSidebar();
            }}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                isActive 
                  ? "bg-primary-500 text-white shadow-sm" 
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <NavLink 
          to="/dashboard/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
              isActive 
                ? "bg-primary-500 text-white shadow-sm" 
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            )
          }
        >
          <Settings size={18} />
          الإعدادات
        </NavLink>
      </div>
    </aside>
    </>
  );
}
