import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xuszhqyahucrhupppzil.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_FXKIpF5jTGVJ_3NcfXgLUw_q93Fg-_P';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase service role variables are missing');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

const camelMap: Record<string, string> = {
  userid: 'userId',
  productname: 'productName',
  ispremium: 'isPremium',
  updatedat: 'updatedAt',
  stockdata: 'stockData'
};

function toDB(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const res: any = {};
  for (const k in data) {
    // Ignore frontend-only fields that do not exist in the database schema
    if (k === 'premiumExpireDate' || k === 'fullName' || k === 'avatarUrl' || k === 'username') continue;
    // Postgres columns without quotes are treated as lowercase.
    res[k.toLowerCase()] = data[k];
  }
  return res;
}

function fromDB(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const res: any = {};
  for (const k in data) {
    if (camelMap[k]) res[camelMap[k]] = data[k];
    else res[k] = data[k];
  }
  return res;
}

class SupabaseDoc {
  public collection: string;
  public id: string;
  constructor(collection: string, id: string) {
    this.collection = collection;
    this.id = id;
  }
  async get() {
    const { data, error } = await supabaseAdmin.from(this.collection).select('*').eq('id', this.id).single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return { exists: false, data: () => null };
    const mapped = fromDB(data);
    return { exists: true, data: () => mapped };
  }
  async update(data: any) {
    const { error } = await supabaseAdmin.from(this.collection).update(toDB(data)).eq('id', this.id);
    if (error) throw error;
  }
  async delete() {
    const { error } = await supabaseAdmin.from(this.collection).delete().eq('id', this.id);
    if (error) throw error;
  }
  async set(data: any, options: any = {}) {
    if (options.merge) {
      const { data: existing, error: err } = await supabaseAdmin.from(this.collection).select('id').eq('id', this.id).single();
      if (existing) {
        const { error } = await supabaseAdmin.from(this.collection).update(toDB(data)).eq('id', this.id);
        if (error) throw error;
      } else {
        const { error } = await supabaseAdmin.from(this.collection).insert([toDB({ id: this.id, ...data })]);
        if (error) throw error;
      }
    } else {
      const { error } = await supabaseAdmin.from(this.collection).upsert([toDB({ id: this.id, ...data })]);
      if (error) throw error;
    }
  }
}

class SupabaseQuery {
  _where: any[] = [];
  _orderBy: any[] = [];
  _limit?: number;

  public collection: string;
  constructor(collection: string) {
    this.collection = collection;
  }

  where(field: string, op: string, value: any) {
    this._where.push({ field: field.toLowerCase(), op, value });
    return this;
  }
  orderBy(field: string, dir: string = 'asc') {
    this._orderBy.push({ field: field.toLowerCase(), dir });
    return this;
  }
  limit(n: number) {
    this._limit = n;
    return this;
  }
  async get() {
    let q: any = supabaseAdmin.from(this.collection).select('*');
    for (const w of this._where) {
      if (w.op === '==') q = q.eq(w.field, w.value);
      else if (w.op === '>') q = q.gt(w.field, w.value);
      else if (w.op === '<') q = q.lt(w.field, w.value);
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
      docs: (data || []).map((d: any) => {
        const mapped = fromDB(d);
        return {
          id: d.id || d.key || d.ip || d.username || 'unknown',
          data: () => mapped
        };
      }),
      forEach: function(cb: Function) {
        (data || []).forEach((d: any) => {
          const mapped = fromDB(d);
          cb({ id: d.id || d.key || d.ip || d.username, data: () => mapped });
        });
      }
    };
  }
}

class SupabaseCollection extends SupabaseQuery {
  doc(id: string) {
    return new SupabaseDoc(this.collection, id);
  }
  async add(data: any) {
    const { data: inserted, error } = await supabaseAdmin.from(this.collection).insert([toDB(data)]).select().single();
    if (error) throw error;
    return { id: inserted?.id };
  }
}

const db = {
  collection: (name: string) => new SupabaseCollection(name)
};

const auth = {
  verifyIdToken: async (token: string) => {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) throw error || new Error('User not found');
    return { ...user, uid: user.id };
  }
};

export const adminDb = {
  firestore: () => db,
  auth: () => auth
};
