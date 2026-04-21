import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ChatAssistant } from "../ai/ChatAssistant";

export function RootLayout() {
  return (
    <div className="flex min-h-screen bg-background font-sans text-slate-900" dir="rtl">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
      <ChatAssistant />
    </div>
  );
}
