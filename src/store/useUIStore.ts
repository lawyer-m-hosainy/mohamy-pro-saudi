import { create } from 'zustand';
import { OfficeSettings, Notification, WikiArticle, Workflow, AuditLog, ESignatureRequest } from '../types';
import { createTenantCrud } from '../services/genericCrud';
import { fetchOfficeSettings, saveOfficeSettings } from '../services/legalDataService';

const notificationsCrud = createTenantCrud<Notification>('notifications');
const wikiArticlesCrud = createTenantCrud<WikiArticle>('wiki_articles');
const workflowsCrud = createTenantCrud<Workflow>('workflows');
const auditLogsCrud = createTenantCrud<AuditLog>('audit_logs');
const eSignaturesCrud = createTenantCrud<ESignatureRequest>('esignature_requests');

interface UIState {
  officeSettings: OfficeSettings;
  notifications: Notification[];
  wikiArticles: WikiArticle[];
  workflows: Workflow[];
  auditLogs: AuditLog[];
  eSignatures: ESignatureRequest[];
  isSidebarOpen: boolean;

  toggleSidebar: () => void;
  closeSidebar: () => void;

  loadUIData: () => Promise<void>;

  setOfficeSettings: (settings: OfficeSettings) => void;
  setNotifications: (notifications: Notification[]) => void;
  markNotificationAsRead: (id: string) => void;
  setWikiArticles: (articles: WikiArticle[]) => void;
  addWikiArticle: (article: WikiArticle) => void;
  setWorkflows: (workflows: Workflow[]) => void;
  addAuditLog: (log: AuditLog) => void;
  setESignatures: (requests: ESignatureRequest[]) => void;
  addESignature: (request: ESignatureRequest) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  officeSettings: {
    name: "",
    vatNumber: "",
    address: "",
    phone: "",
    email: "",
    logo: ""
  },
  notifications: [],
  wikiArticles: [],
  workflows: [],
  auditLogs: [],
  eSignatures: [],
  isSidebarOpen: false,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),

  loadUIData: async () => {
    const [officeSettings, notifications, wikiArticles, workflows, auditLogs, eSignatures] = await Promise.all([
      fetchOfficeSettings(),
      notificationsCrud.fetchAll(),
      wikiArticlesCrud.fetchAll(),
      workflowsCrud.fetchAll(),
      auditLogsCrud.fetchAll(),
      eSignaturesCrud.fetchAll(),
    ]);
    set({
      ...(officeSettings ? { officeSettings } : {}),
      notifications, wikiArticles, workflows, auditLogs, eSignatures,
    });
  },

  setOfficeSettings: (officeSettings) => {
    set({ officeSettings });
    void saveOfficeSettings(officeSettings);
  },
  setNotifications: (notifications) => set({ notifications }),
  markNotificationAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
    }));
    const updated = get().notifications.find(n => n.id === id);
    if (updated) void notificationsCrud.save(updated, true);
  },
  setWikiArticles: (wikiArticles) => set({ wikiArticles }),
  addWikiArticle: (article) => {
    set((state) => ({ wikiArticles: [article, ...state.wikiArticles] }));
    void wikiArticlesCrud.save(article, false);
  },
  setWorkflows: (workflows) => set({ workflows }),
  addAuditLog: (log) => {
    set((state) => ({ auditLogs: [log, ...state.auditLogs] }));
    void auditLogsCrud.save(log, false);
  },
  setESignatures: (eSignatures) => set({ eSignatures }),
  addESignature: (request) => {
    set((state) => ({ eSignatures: [request, ...state.eSignatures] }));
    void eSignaturesCrud.save(request, false);
  },
}));
