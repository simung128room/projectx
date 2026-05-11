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
  product_name: 'productName',
  productname: 'productName',
  is_premium: 'isPremium',
  ispremium: 'isPremium',
  updated_at: 'updatedAt',
  updatedat: 'updatedAt',
  created_at: 'createdAt',
  createdat: 'createdAt',
  stock_data: 'stockData',
  stockdata: 'stockData',
  image: 'imageUrl',
  username: 'username'
};

const forwardMap: Record<string, string> = {
  imageUrl: 'image',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  isPremium: 'is_premium',
  productName: 'product_name',
  stockData: 'stock_data',
  userId: 'user_id',
  username: 'username'
};

const missingColumns = new Set<string>();

function toDB(data: any, collection?: string): any {
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
  }

  // Encode category or product metadata directly into name
  if (_data.name !== undefined && (_data.title !== undefined || _data.subtitle !== undefined || _data.bannerUrl !== undefined || _data.stockData !== undefined || _data.soldCount !== undefined)) {
      if (typeof _data.name === 'string' && !_data.name.startsWith('{"n":')) {
          _data.name = JSON.stringify({
              n: _data.name,
              t: _data.title,
              s: _data.subtitle,
              b: _data.bannerUrl,
              sd: _data.stockData,
              sc: _data.soldCount
          });
      }
      delete _data.title;
      delete _data.subtitle;
      delete _data.bannerUrl;
      delete _data.stockData;
      delete _data.soldCount;
  }

  for (const k in _data) {
    let target = k;
    if (forwardMap[k]) target = forwardMap[k];
    else target = k.toLowerCase();

    // Skip known missing columns for this collection
    if (collection && missingColumns.has(`${collection}.${target}`)) continue;

    // Ignore frontend-only or missing schema fields
    if (k === 'premiumExpireDate' || k === 'fullName' || k === 'avatarUrl' || k === 'rank' || k === 'originalPrice' || k === 'isPopular') continue;
    if (k === 'method' || k === 'uid' || k === 'secretData' || k === 'billNumber' || k === 'is_special' || k === 'productId') continue;
    
    res[target] = _data[k];
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

  // Decode category or product metadata from name
  if (res.name && typeof res.name === 'string' && res.name.startsWith('{"n":')) {
      try {
          const meta = JSON.parse(res.name);
          res.name = meta.n;
          if (meta.t !== undefined) res.title = meta.t;
          if (meta.s !== undefined) res.subtitle = meta.s;
          if (meta.b !== undefined) res.bannerUrl = meta.b;
          if (meta.sd !== undefined) res.stockData = meta.sd;
          if (meta.sc !== undefined) res.soldCount = meta.sc;
      } catch (e) {}
  }

  return res;
}

function extractMissingColumn(errMsg: string): string | null {
  const m1 = errMsg.match(/Could not find the '([^']+)' column/);
  if (m1) return m1[1];
  const m2 = errMsg.match(/column '([^']+)'/);
  if (m2) return m2[1];
  return null;
}

class SupabaseDoc {
  public collection: string;
  public id: string;
  constructor(collection: string, id: string) {
    this.collection = collection;
    this.id = id;
  }
  pk() {
    return this.collection === 'blocked_ips' ? 'ip' : (this.collection === 'settings' ? 'key' : 'id');
  }

  async get() {
    try {
      const { data, error } = await supabaseAdmin.from(this.collection).select('*').eq(this.pk(), this.id).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return { exists: false, data: () => null };
      const mapped = fromDB(data);
      return { exists: true, data: () => mapped };
    } catch (err: any) {
      if (err.message && err.message.includes("Could not find the") && err.message.includes("column")) {
        console.warn(`Column error in fetch from ${this.collection}: ${err.message}. This usually means schema is out of sync.`);
      }
      throw err;
    }
  }
  async update(data: any) {
    while (true) {
      try {
        const { error } = await supabaseAdmin.from(this.collection).update(toDB(data, this.collection)).eq(this.pk(), this.id);
        if (error) throw error;
        break;
      } catch (err: any) {
        if (err.message && err.message.includes("Could not find the") && err.message.includes("column")) {
          const col = extractMissingColumn(err.message);
          if (col && !missingColumns.has(`${this.collection}.${col}`)) {
            console.warn(`Column ${col} missing in ${this.collection}, adding to blacklist and retrying...`);
            missingColumns.add(`${this.collection}.${col}`);
            continue;
          }
        }
        throw err;
      }
    }
  }
  async delete() {
    const { error } = await supabaseAdmin.from(this.collection).delete().eq(this.pk(), this.id);
    if (error) throw error;
  }
  async set(data: any, options: any = {}) {
    while (true) {
      try {
        if (options.merge) {
          const { data: existing, error: err } = await supabaseAdmin.from(this.collection).select(this.pk()).eq(this.pk(), this.id).single();
          if (existing) {
            const { error } = await supabaseAdmin.from(this.collection).update(toDB(data, this.collection)).eq(this.pk(), this.id);
            if (error) throw error;
          } else {
            const { error } = await supabaseAdmin.from(this.collection).insert([toDB({ [this.pk()]: this.id, ...data }, this.collection)]);
            if (error) throw error;
          }
        } else {
          const { error } = await supabaseAdmin.from(this.collection).upsert([toDB({ [this.pk()]: this.id, ...data }, this.collection)]);
          if (error) throw error;
        }
        break;
      } catch (err: any) {
        if (err.message && err.message.includes("Could not find the") && err.message.includes("column")) {
          const col = extractMissingColumn(err.message);
          if (col && !missingColumns.has(`${this.collection}.${col}`)) {
            console.warn(`Column ${col} missing in ${this.collection}, adding to blacklist and retrying...`);
            missingColumns.add(`${this.collection}.${col}`);
            continue;
          }
        }
        throw err;
      }
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
    let target = field;
    if (forwardMap[field]) target = forwardMap[field];
    else target = field.toLowerCase();
    
    this._where.push({ field: target, op, value });
    return this;
  }
  orderBy(field: string, dir: string = 'asc') {
    let target = field;
    if (forwardMap[field]) target = forwardMap[field];
    else target = field.toLowerCase();

    this._orderBy.push({ field: target, dir });
    return this;
  }
  limit(n: number) {
    this._limit = n;
    return this;
  }
  async get() {
    const executeQuery = async (where: any[], orderBy: any[]) => {
      let q: any = supabaseAdmin.from(this.collection).select('*');
      for (const w of where) {
        if (w.op === '==') q = q.eq(w.field, w.value);
        else if (w.op === '>') q = q.gt(w.field, w.value);
        else if (w.op === '<') q = q.lt(w.field, w.value);
      }
      for (const o of orderBy) {
        q = q.order(o.field, { ascending: o.dir === 'asc' });
      }
      if (this._limit) {
        q = q.limit(this._limit);
      }
      return await q;
    };

    let currentWhere = [...this._where];
    let currentOrderBy = [...this._orderBy];

    while (true) {
      try {
        const { data, error } = await executeQuery(currentWhere, currentOrderBy);
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
      } catch (err: any) {
        if (err.message && err.message.includes("Could not find the") && err.message.includes("column")) {
          const col = extractMissingColumn(err.message);
          if (col && !missingColumns.has(`${this.collection}.${col}`)) {
            console.warn(`Column ${col} missing in ${this.collection} during fetch, adding to blacklist and retrying...`);
            missingColumns.add(`${this.collection}.${col}`);
            currentWhere = currentWhere.filter(w => w.field !== col);
            currentOrderBy = currentOrderBy.filter(o => o.field !== col);
            continue;
          }
        }
        throw err;
      }
    }
  }
}

class SupabaseCollection extends SupabaseQuery {
  doc(id: string) {
    return new SupabaseDoc(this.collection, id);
  }
  async add(data: any) {
    const performAdd = async (payload: any) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (payload.id && !uuidRegex.test(payload.id)) {
        delete payload.id;
      }
      const { data: inserted, error } = await supabaseAdmin.from(this.collection).insert([payload]).select().single();
      if (error) throw error;
      return { id: inserted?.id || data.id };
    };

    try {
      return await performAdd(toDB({ ...data }, this.collection));
    } catch (err: any) {
      if (err.message && err.message.includes("Could not find the") && err.message.includes("column")) {
        const col = extractMissingColumn(err.message);
        if (col) {
          console.warn(`Column ${col} missing in ${this.collection}, adding to blacklist and retrying...`);
          missingColumns.add(`${this.collection}.${col}`);
          return await performAdd(toDB({ ...data }, this.collection));
        }
      }
      throw err;
    }
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
  },
  updateUser: async (uid: string, props: any) => {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(uid, props);
    if (error) throw error;
    return data;
  },
  deleteUser: async (uid: string) => {
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(uid);
    if (error) throw error;
    return data;
  }
};

export const adminDb = {
  firestore: () => db,
  auth: () => auth
};
