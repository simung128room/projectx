import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase service role variables are missing');
}

export const supabaseAdmin = createClient(supabaseUrl || '', supabaseKey || '', {
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
  stockdata: 'stockData',
  image: 'imageUrl'
};

const forwardMap: Record<string, string> = {
  imageUrl: 'image'
};

function toDB(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const res: any = {};
  
  // Copy data to avoid mutating the original
  const _data = { ...data };

  // Encode purchases metadata into productname
  if (_data.productName && typeof _data.productName === 'string' && (_data.secretData !== undefined || _data.billNumber !== undefined || _data.is_special !== undefined || _data.productId !== undefined)) {
      if (!_data.productName.startsWith('{"n":')) {
          _data.productName = JSON.stringify({
              n: _data.productName,
              s: _data.secretData,
              b: _data.billNumber,
              i: _data.is_special,
              p: _data.productId
          });
      }
      delete _data.secretData;
      delete _data.billNumber;
      delete _data.is_special;
      delete _data.productId;
  }

  // Encode topups metadata into username
  if (_data.amount !== undefined && (_data.method !== undefined || _data.uid !== undefined) && !_data.productName) {
      const usernameBase = _data.username || _data.userId || 'Unknown';
      if (typeof usernameBase === 'string' && !usernameBase.startsWith('{"u":')) {
          _data.username = JSON.stringify({
              u: usernameBase,
              uid: _data.uid,
              m: _data.method
          });
      }
      delete _data.method;
      delete _data.uid;
      // also ensure we don't accidentally pass them
  }

  for (const k in _data) {
    // Ignore frontend-only or missing schema fields
    if (k === 'premiumExpireDate' || k === 'fullName' || k === 'avatarUrl' || k === 'rank' || k === 'originalPrice' || k === 'soldCount' || k === 'isPopular') continue;
    
    // Explicitly ignore missing schema fields so postgres doesn't crash
    if (k === 'method' || k === 'uid' || k === 'secretData' || k === 'billNumber' || k === 'is_special' || k === 'productId') continue;
    
    // Convert known keys
    if (forwardMap[k]) {
      res[forwardMap[k]] = _data[k];
    } else {
      // Postgres columns without quotes are treated as lowercase.
      res[k.toLowerCase()] = _data[k];
    }
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

  // Decode purchases metadata from productName
  if (res.productName && typeof res.productName === 'string' && res.productName.startsWith('{"n":')) {
      try {
          const meta = JSON.parse(res.productName);
          res.productName = meta.n;
          if (meta.s !== undefined) res.secretData = meta.s;
          if (meta.b !== undefined) res.billNumber = meta.b;
          if (meta.i !== undefined) res.is_special = meta.i;
          if (meta.p !== undefined) res.productId = meta.p;
      } catch (e) {}
  }

  // Decode topups metadata from username
  if (res.username && typeof res.username === 'string' && res.username.startsWith('{"u":')) {
      try {
          const meta = JSON.parse(res.username);
          res.username = meta.u;
          if (meta.uid !== undefined) res.uid = meta.uid;
          if (meta.m !== undefined) res.method = meta.m;
      } catch (e) {}
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
      empty: data ? data.length === 0 : true,
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
    const payload = toDB({ ...data });
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (payload.id && !uuidRegex.test(payload.id)) {
      delete payload.id;
    }
    const { data: inserted, error } = await supabaseAdmin.from(this.collection).insert([payload]).select().single();
    if (error) throw error;
    return { id: inserted?.id || data.id };
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
