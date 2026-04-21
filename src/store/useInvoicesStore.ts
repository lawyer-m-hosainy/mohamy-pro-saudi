import { create } from 'zustand';
import { Invoice } from '../types';
import { fetchInvoices, saveInvoice, deleteInvoice } from '../services/legalDataService';
import { calculateVAT } from '../lib/finance';

interface InvoicesState {
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  loadInvoices: () => Promise<void>;
  addInvoice: (invoiceData: Omit<Invoice, 'vat' | 'total'>) => Promise<void>;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => Promise<void>;
  removeInvoice: (id: string) => Promise<void>;
}

export const useInvoicesStore = create<InvoicesState>((set, get) => ({
  invoices: [],
  isLoading: false,
  error: null,

  loadInvoices: async () => {
    set({ isLoading: true, error: null });
    try {
      const invoices = await fetchInvoices() || [];
      // Sort by descending date
      invoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      set({ invoices, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addInvoice: async (invoiceData) => {
    set({ isLoading: true, error: null });
    try {
      // Auto-calculate VAT
      const vat = calculateVAT(invoiceData.base);
      const total = invoiceData.base + vat;
      
      const newInvoice: Invoice = {
        ...invoiceData,
        vat,
        total
      };
      
      await saveInvoice(newInvoice);
      set(state => ({ invoices: [newInvoice, ...state.invoices], isLoading: false }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateInvoiceStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      const state = get();
      const invoice = state.invoices.find(i => i.id === id);
      if (!invoice) throw new Error("Invoice not found");
      
      const updatedInvoice = { ...invoice, status };
      await saveInvoice(updatedInvoice, true);
      
      set(state => ({
        invoices: state.invoices.map(i => i.id === id ? updatedInvoice : i),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  removeInvoice: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteInvoice(id);
      set(state => ({
        invoices: state.invoices.filter(i => i.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  }
}));
