import { create } from 'zustand';
import { Client, Lead, KeyAccount, Proposal } from '../types';


interface ClientsState {
  clients: Client[];
  leads: Lead[];
  keyAccounts: KeyAccount[];
  proposals: Proposal[];
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

export const useClientsStore = create<ClientsState>((set) => ({
  clients: [],
  leads: [],
  keyAccounts: [],
  proposals: [],

  setClients: (clients) => set({ clients }),
  addClient: (client) => set((state) => ({ clients: [client, ...state.clients] })),
  updateClient: (id, updatedData) => set((state) => ({
    clients: state.clients.map(c => c.id === id ? { ...c, ...updatedData } : c)
  })),
  deleteClient: (id) => set((state) => ({
    clients: state.clients.filter(c => c.id !== id)
  })),
  setLeads: (leads) => set({ leads }),
  addLead: (lead) => set((state) => ({ leads: [lead, ...state.leads] })),
  setKeyAccounts: (keyAccounts) => set({ keyAccounts }),
  addKeyAccount: (account) => set((state) => ({ keyAccounts: [account, ...state.keyAccounts] })),
  setProposals: (proposals) => set({ proposals }),
  addProposal: (proposal) => set((state) => ({ proposals: [proposal, ...state.proposals] })),
  updateProposalStatus: (id, status) => set((state) => ({
    proposals: state.proposals.map(p => p.id === id ? { ...p, status } : p)
  })),
}));
