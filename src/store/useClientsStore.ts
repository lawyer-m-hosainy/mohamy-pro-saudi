import { create } from 'zustand';
import { Client, Lead, KeyAccount, Proposal } from '../types';
import { createTenantCrud } from '../services/genericCrud';

const leadsCrud = createTenantCrud<Lead>('leads');
const keyAccountsCrud = createTenantCrud<KeyAccount>('key_accounts');
const proposalsCrud = createTenantCrud<Proposal>('proposals');

interface ClientsState {
  clients: Client[];
  leads: Lead[];
  keyAccounts: KeyAccount[];
  proposals: Proposal[];
  loadCrmData: () => Promise<void>;
  setClients: (clients: Client[]) => void;
  addClient: (client: Client) => void;
  updateClient: (id: string, updatedData: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  setLeads: (leads: Lead[]) => void;
  addLead: (lead: Lead) => void;
  setKeyAccounts: (keyAccounts: KeyAccount[]) => void;
  addKeyAccount: (account: KeyAccount) => void;
  setProposals: (proposals: Proposal[]) => void;
  addProposal: (proposal: Proposal) => void;
  updateProposalStatus: (id: string, status: Proposal['status']) => void;
}

export const useClientsStore = create<ClientsState>((set, get) => ({
  clients: [],
  leads: [],
  keyAccounts: [],
  proposals: [],

  loadCrmData: async () => {
    const [leads, keyAccounts, proposals] = await Promise.all([
      leadsCrud.fetchAll(),
      keyAccountsCrud.fetchAll(),
      proposalsCrud.fetchAll(),
    ]);
    set({ leads, keyAccounts, proposals });
  },

  setClients: (clients) => set({ clients }),
  addClient: (client) => set((state) => ({ clients: [client, ...state.clients] })),
  updateClient: (id, updatedData) => set((state) => ({
    clients: state.clients.map(c => c.id === id ? { ...c, ...updatedData } : c)
  })),
  deleteClient: (id) => set((state) => ({
    clients: state.clients.filter(c => c.id !== id)
  })),
  setLeads: (leads) => set({ leads }),
  addLead: (lead) => {
    set((state) => ({ leads: [lead, ...state.leads] }));
    void leadsCrud.save(lead, false);
  },
  setKeyAccounts: (keyAccounts) => set({ keyAccounts }),
  addKeyAccount: (account) => {
    set((state) => ({ keyAccounts: [account, ...state.keyAccounts] }));
    void keyAccountsCrud.save(account, false);
  },
  setProposals: (proposals) => set({ proposals }),
  addProposal: (proposal) => {
    set((state) => ({ proposals: [proposal, ...state.proposals] }));
    void proposalsCrud.save(proposal, false);
  },
  updateProposalStatus: (id, status) => {
    set((state) => ({
      proposals: state.proposals.map(p => p.id === id ? { ...p, status } : p)
    }));
    const updated = get().proposals.find(p => p.id === id);
    if (updated) void proposalsCrud.save(updated, true);
  },
}));
