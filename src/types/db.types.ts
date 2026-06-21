export interface DbDocument {
  id: string;
  _version?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown; // fallback สำหรับ dynamic fields
}

export interface DbQueryResult<T = DbDocument> {
  docs: Array<{
    id: string;
    ref: any;
    data: () => T;
  }>;
  empty: boolean;
  forEach: (callback: (doc: { id: string; ref: any; data: () => T }) => void) => void;
}

export interface TransactionContext {
  get: (ref: any) => Promise<{ exists: boolean; data: () => DbDocument }>;
  update: (ref: any, data: Partial<DbDocument>) => void;
  set: (ref: any, data: DbDocument) => void;
  delete: (ref: any) => void;
}
