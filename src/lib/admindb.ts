import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const localDBPath = path.join(process.cwd(), '.data');
if (!fs.existsSync(localDBPath)) {
  fs.mkdirSync(localDBPath, { recursive: true });
}

function getLocalTable(collection: string) {
  const fp = path.join(localDBPath, `${collection}.json`);
  if (!fs.existsSync(fp)) return [];
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
}
function saveLocalTable(collection: string, data: any) {
  fs.writeFileSync(path.join(localDBPath, `${collection}.json`), JSON.stringify(data));
}

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
  updatedAt: 'updatedat',
  isPremium: 'ispremium',
  productName: 'productname',
  stockData: 'stockdata',
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
  if (_data.productName && typeof _data.productName === 'string' && (_data.secretData !== undefined || _data.billNumber !== undefined || _data.is_special !== undefined || _data.productId !== undefined || _data.discordClaimed !== undefined || _data.webClaimed !== undefined)) {
      if (!_data.productName.startsWith('{"n":')) {
          _data.productName = JSON.stringify({
              n: _data.productName,
              s: _data.secretData,
              b: _data.billNumber,
              i: _data.is_special,
              p: _data.productId,
              d: _data.discordClaimed,
              w: _data.webClaimed
          });
      } else {
          try {
             let meta = JSON.parse(_data.productName);
             if (_data.discordClaimed !== undefined) meta.d = _data.discordClaimed;
             if (_data.webClaimed !== undefined) meta.w = _data.webClaimed;
             if (_data.secretData !== undefined) meta.s = _data.secretData;
             if (_data.billNumber !== undefined) meta.b = _data.billNumber;
             if (_data.is_special !== undefined) meta.i = _data.is_special;
             if (_data.productId !== undefined) meta.p = _data.productId;
             _data.productName = JSON.stringify(meta);
          } catch(e) {}
      }
      delete _data.secretData;
      delete _data.billNumber;
      delete _data.is_special;
      delete _data.productId;
      delete _data.discordClaimed;
      delete _data.webClaimed;
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
          if (meta.d !== undefined) res.discordClaimed = meta.d;
          if (meta.w !== undefined) res.webClaimed = meta.w;
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
  const m3 = errMsg.match(/column ([^\s]+) does not exist/);
  if (m3) {
    let col = m3[1];
    if (col.includes('.')) col = col.split('.').pop() || col;
    return col;
  }
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
    if (this.collection === 'product_stock_chunks' || this.collection.includes('_chunks') || this.collection === 'idempotency_keys') {
        const table = getLocalTable(this.collection);
        const item = table.find((x: any) => x.id === this.id);
        if (!item) return { id: this.id, ref: this, exists: false, data: () => null };
        return { id: this.id, ref: this, exists: true, data: () => item };
    }
    try {
      const { data, error } = await supabaseAdmin.from(this.collection).select('*').eq(this.pk(), this.id).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return { id: this.id, ref: this, exists: false, data: () => null };
      const mapped = fromDB(data);
      return { id: this.id, ref: this, exists: true, data: () => mapped };
    } catch (err: any) {
      if (err.message && ((err.message.includes("Could not find the") && err.message.includes("column")) || (err.message.includes("column") && err.message.includes("does not exist")))) {
        console.warn(`Column error in fetch from ${this.collection}: ${err.message}. This usually means schema is out of sync.`);
      }
      if (err.message && err.message.includes("Could not find the table")) {
        return { exists: false, data: () => null };
      }
      throw err;
    }
  }
  async update(data: any) {
    if (this.collection === 'product_stock_chunks' || this.collection.includes('_chunks') || this.collection === 'idempotency_keys') {
        const table = getLocalTable(this.collection);
        const idx = table.findIndex((x: any) => x.id === this.id);
        if (idx !== -1) {
            table[idx] = { ...table[idx], ...data };
            saveLocalTable(this.collection, table);
        }
        return;
    }
    while (true) {
      try {
        const { error } = await supabaseAdmin.from(this.collection).update(toDB(data, this.collection)).eq(this.pk(), this.id);
        if (error) throw error;
        break;
      } catch (err: any) {
        if (err.message && ((err.message.includes("Could not find the") && err.message.includes("column")) || (err.message.includes("column") && err.message.includes("does not exist")))) {
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
    if (this.collection === 'product_stock_chunks' || this.collection.includes('_chunks') || this.collection === 'idempotency_keys') {
        const table = getLocalTable(this.collection);
        const newTable = table.filter((x: any) => x.id !== this.id);
        saveLocalTable(this.collection, newTable);
        return;
    }
    const { error } = await supabaseAdmin.from(this.collection).delete().eq(this.pk(), this.id);
    if (error) throw error;
  }
  async set(data: any, options: any = {}) {
    if (this.collection === 'product_stock_chunks' || this.collection.includes('_chunks') || this.collection === 'idempotency_keys') {
        const table = getLocalTable(this.collection);
        const idx = table.findIndex((x: any) => x.id === this.id);
        if (idx !== -1) {
            if (options.merge) table[idx] = { ...table[idx], ...data, id: this.id };
            else table[idx] = { ...data, id: this.id };
        } else {
            table.push({ ...data, id: this.id });
        }
        saveLocalTable(this.collection, table);
        return;
    }
    while (true) {
      try {
        const pk = this.pk();
        if (options.merge) {
          const { data: existing, error: err } = await supabaseAdmin.from(this.collection).select(pk).eq(pk, this.id).single();
          if (existing) {
            const { error } = await supabaseAdmin.from(this.collection).update(toDB(data, this.collection)).eq(pk, this.id);
            if (error) throw error;
          } else {
            const { error } = await supabaseAdmin.from(this.collection).insert([toDB({ [pk]: this.id, ...data }, this.collection)]);
            if (error) throw error;
          }
        } else {
          const { error } = await supabaseAdmin.from(this.collection).upsert([toDB({ [pk]: this.id, ...data }, this.collection)]);
          if (error) throw error;
        }
        break;
      } catch (err: any) {
        if (err.message && (err.message.includes("Could not find the table") || (err.message.includes("relation") && err.message.includes("does not exist")))) {
          console.warn(`Table ${this.collection} missing during set, operation skipped.`);
          return;
        }
        if (err.message && ((err.message.includes("Could not find the") && err.message.includes("column")) || (err.message.includes("column") && err.message.includes("does not exist")))) {
          const col = extractMissingColumn(err.message);
          if (col && col !== this.pk() && !missingColumns.has(`${this.collection}.${col}`)) {
            console.warn(`Column ${col} missing in ${this.collection}, adding to blacklist and retrying...`);
            missingColumns.add(`${this.collection}.${col}`);
            continue;
          }
        }
        console.error(`[SupabaseDoc] Set error in ${this.collection}:`, err.message || err);
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
  _selectFields: string | null = null;

  select(...fields: string[]) {
    this._selectFields = fields.join(',');
    return this;
  }
  async get() {
    if (this.collection === 'product_stock_chunks' || this.collection.includes('_chunks') || this.collection === 'idempotency_keys') {
      let data = getLocalTable(this.collection);
      for (const w of this._where) {
        if (w.op === '==') data = data.filter((d: any) => {
            const key = Object.keys(d).find((k) => k.toLowerCase() === w.field.toLowerCase()) || w.field;
            return d[key] === w.value;
        });
        else if (w.op === '>') data = data.filter((d: any) => {
            const key = Object.keys(d).find((k) => k.toLowerCase() === w.field.toLowerCase()) || w.field;
            return d[key] > w.value;
        });
        else if (w.op === '<') data = data.filter((d: any) => {
            const key = Object.keys(d).find((k) => k.toLowerCase() === w.field.toLowerCase()) || w.field;
            return d[key] < w.value;
        });
      }
      for (const o of this._orderBy) {
        data.sort((a: any, b: any) => {
            const keyA = Object.keys(a).find((k) => k.toLowerCase() === o.field.toLowerCase()) || o.field;
            const keyB = Object.keys(b).find((k) => k.toLowerCase() === o.field.toLowerCase()) || o.field;
            return o.dir === 'asc' ? (a[keyA] > b[keyB] ? 1 : -1) : (a[keyA] < b[keyB] ? 1 : -1);
        });
      }
      if (this._limit) data = data.slice(0, this._limit);
      return {
        docs: data.map((d: any) => ({
           id: d.id,
           ref: new SupabaseDoc(this.collection, d.id),
           data: () => d
        })),
        empty: data.length === 0,
        forEach: (cb: any) => data.forEach((d: any) => cb({ id: d.id, ref: new SupabaseDoc(this.collection, d.id), data: () => d }))
      };
    }
    const executeQuery = async (where: any[], orderBy: any[]) => {
      let q: any = supabaseAdmin.from(this.collection).select(this._selectFields ? this._selectFields : '*');
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
            const docId = d.id || d.key || d.ip || d.username || 'unknown';
            return {
              id: docId,
              ref: new SupabaseDoc(this.collection, docId),
              data: () => mapped
            };
          }),
          empty: data ? data.length === 0 : true,
          forEach: function(cb: Function) {
            (data || []).forEach((d: any) => {
              const mapped = fromDB(d);
              const docId = d.id || d.key || d.ip || d.username;
              cb({ id: docId, ref: new SupabaseDoc(this.collection, docId), data: () => mapped });
            });
          }
        };
      } catch (err: any) {
        if (err.message && ((err.message.includes("Could not find the") && err.message.includes("column")) || (err.message.includes("column") && err.message.includes("does not exist")))) {
          const col = extractMissingColumn(err.message);
          let handled = false;
          if (col && this._selectFields && this._selectFields.includes(col)) {
             this._selectFields = this._selectFields.split(',').filter(f => f.trim() !== col).join(',');
             handled = true;
          }
          if (col && !missingColumns.has(`${this.collection}.${col}`)) {
            console.warn(`Column ${col} missing in ${this.collection} during fetch, adding to blacklist and retrying...`);
            missingColumns.add(`${this.collection}.${col}`);
            currentWhere = currentWhere.filter(w => w.field !== col);
            currentOrderBy = currentOrderBy.filter(o => o.field !== col);
            handled = true;
          }
          if (handled) {
            console.log("RETRYING missing column", col);
            continue;
          }
        }
        if (err.message && err.message.includes("Could not find the table")) {
          console.warn(`Table ${this.collection} missing, returning empty result.`);
          return { docs: [], empty: true, forEach: (cb: any) => {} };
        }
        throw err;
      }
    }
  }
}

class SupabaseCollection extends SupabaseQuery {
  doc(id?: string) {
    const genId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return new SupabaseDoc(this.collection, id || genId());
  }
  async add(data: any) {
    if (this.collection === 'product_stock_chunks' || this.collection.includes('_chunks') || this.collection === 'idempotency_keys') {
        const docId = data.id || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const table = getLocalTable(this.collection);
        table.push({ ...data, id: docId });
        saveLocalTable(this.collection, table);
        return { id: docId };
    }
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
      if (err.message && ((err.message.includes("Could not find the") && err.message.includes("column")) || (err.message.includes("column") && err.message.includes("does not exist")))) {
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
  collection: (name: string) => new SupabaseCollection(name),
  runTransaction: async (updateFunction: (t: any) => Promise<any>) => {
    const t = {
      get: async (docRef: any) => await docRef.get(),
      update: async (docRef: any, data: any) => await docRef.update(data),
      set: async (docRef: any, data: any) => await docRef.set(data),
      delete: async (docRef: any) => await docRef.delete()
    };
    return await updateFunction(t);
  }
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
