const fs = require('fs');

let code = `
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

class SupabaseDoc {
  constructor(public collection: string, public id: string) {}
  async get() {
    const { data, error } = await supabase.from(this.collection).select('*').eq('id', this.id).single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return { exists: false, data: () => null };
    return { exists: true, data: () => data };
  }
  async update(data: any) {
    const { error } = await supabase.from(this.collection).update(data).eq('id', this.id);
    if (error) throw error;
  }
  async delete() {
    const { error } = await supabase.from(this.collection).delete().eq('id', this.id);
    if (error) throw error;
  }
  async set(data: any, options: any = {}) {
    if (options.merge) {
      // Upsert or try update then insert
      const { data: existing, error: err } = await supabase.from(this.collection).select('id').eq('id', this.id).single();
      if (existing) {
        const { error } = await supabase.from(this.collection).update(data).eq('id', this.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(this.collection).insert([{ id: this.id, ...data }]);
        if (error) throw error;
      }
    } else {
      const { error } = await supabase.from(this.collection).upsert([{ id: this.id, ...data }]);
      if (error) throw error;
    }
  }
}

class SupabaseQuery {
  _where: any[] = [];
  _orderBy: any[] = [];
  _limit?: number;

  constructor(public collection: string) {}

  where(field: string, op: string, value: any) {
    this._where.push({ field, op, value });
    return this;
  }
  orderBy(field: string, dir: string = 'asc') {
    this._orderBy.push({ field, dir });
    return this;
  }
  limit(n: number) {
    this._limit = n;
    return this;
  }
  async get() {
    let q = supabase.from(this.collection).select('*');
    for (const w of this._where) {
      if (w.op === '==') q = q.eq(w.field, w.value);
    }
    for (const o of this._orderBy) {
      q = q.order(o.field, { ascending: o.dir === 'asc' });
    }
    if (this._limit) {
      q = q.limit(this._limit);
    }
    const { data, error } = await q;
    if (error) throw error;
    return {
      docs: (data || []).map((d: any) => ({
        id: d.id || d.key || d.ip || d.username || 'unknown',
        data: () => d
      })),
      forEach: function(cb: Function) {
        (data || []).forEach((d: any) => cb({ id: d.id, data: () => d }));
      }
    };
  }
}

class SupabaseCollection extends SupabaseQuery {
  doc(id: string) {
    return new SupabaseDoc(this.collection, id);
  }
  async add(data: any) {
    const { data: inserted, error } = await supabase.from(this.collection).insert([data]).select().single();
    if (error) throw error;
    return { id: inserted.id };
  }
}

export function supabaseDb() {
  return {
    collection: (name: string) => new SupabaseCollection(name)
  };
}
`;

fs.writeFileSync('supabaseAdapter.ts', code);
`;

fs.writeFileSync('make_adapter.cjs', code);
