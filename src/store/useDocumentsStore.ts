import { create } from 'zustand';
import { Document } from '../types';
import { createTenantCrud } from '../services/genericCrud';

const documentsCrud = createTenantCrud<Document>('documents');

interface DocumentsState {
  documents: Document[];
  loadDocuments: () => Promise<void>;
  addDocument: (doc: Document) => void;
  removeDocument: (id: string) => void;
}

export const useDocumentsStore = create<DocumentsState>((set) => ({
  documents: [],

  loadDocuments: async () => {
    const documents = await documentsCrud.fetchAll();
    set({ documents });
  },

  addDocument: (doc) => {
    set((state) => ({ documents: [doc, ...state.documents] }));
    void documentsCrud.save(doc, false);
  },

  removeDocument: (id) => {
    set((state) => ({ documents: state.documents.filter((d) => d.id !== id) }));
    void documentsCrud.remove(id);
  },
}));
