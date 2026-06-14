import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

import os from 'os';
import crypto from 'crypto';
const localDBPath = os.tmpdir() + `/.data`;
if (!fs.existsSync(localDBPath)) {
  fs.mkdirSync(localDBPath, { recursive: true });
}

const localTableCache: Record<string, any[]> = {};
let writePromises: Record<string, Promise<void>> = {};

async function getLocalTable(collection: string) {
  if (localTableCache[collection]) return localTableCache[collection];
  const fp = path.join(localDBPath, `${collection}.json`);
  if (!fs.existsSync(fp)) {
    localTableCache[collection] = [];
    return localTableCache[collection];
  }
  const data = await fs.promises.readFile(fp, 'utf8');
  localTableCache[collection] = JSON.parse(data);
  return localTableCache[collection];
}

const writeSchedules: Record<string, NodeJS.Timeout> = {};

async function saveLocalTable(collection: string, data: any) {
  localTableCache[collection] = data; // Immediately available to local memory readers
  const fp = path.join(localDBPath, collection + '.json');
  const jsonStr = JSON.stringify(data);
  
  if (!writePromises[collection]) {
    writePromises[collection] = Promise.resolve();
  }
  
  writePromises[collection] = writePromises[collection].then(async () => {
    try {
      await fs.promises.writeFile(fp, jsonStr);
    } catch (err) {
      console.error(`Local file write error for ${collection}:`, err);
    }
  });
  
  await writePromises[collection];
}

const isServer = typeof window === 'undefined';
const supabaseUrl = isServer ? (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) : '';
const supabaseKey = isServer 
  ? (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim()
  : '';

// Ensure the key is an actual JWT/ASCII string and not Thai text to prevent Node Headers ByteString crash
const isValidKey = /^[A-Za-z0-9\-_.]+$/.test(supabaseKey);

const isSupabaseAdminConfigured = !!(supabaseUrl && supabaseUrl.startsWith('http') && supabaseKey && isValidKey);

if (!isSupabaseAdminConfigured) {
  console.warn('Supabase service role variables are missing, invalid, or contain non-ascii characters');
}

const safeUrl = isSupabaseAdminConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const safeKey = isSupabaseAdminConfigured ? supabaseKey : 'placeholder-key';

export const supabaseAdmin = createClient(safeUrl, safeKey, {
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
  image_url: 'imageUrl',
  username: 'username',
  original_price: 'originalPrice',
  is_popular: 'isPopular',
  sold_count: 'soldCount',
  banner_url: 'bannerUrl',
  secret_data: 'secretData',
  bill_number: 'billNumber',
  discord_claimed: 'discordClaimed',
  web_claimed: 'webClaimed',
  product_id: 'productId',
  is_deleted: 'isDeleted',
  isdeleted: 'isDeleted',
  category_id: 'categoryId',
  is_highlight: 'isHighlight',
  custom_page_id: 'customPageId',
  youtube_url: 'youtubeUrl',
  is_preorder: 'isPreOrder',
  preorder_options: 'preOrderOptions'
};

const forwardMap: Record<string, string> = {
  imageUrl: 'image_url',
  bannerUrl: 'banner_url',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  isPremium: 'is_premium',
  productName: 'product_name',
  stockData: 'stock_data',
  userId: 'user_id',
  originalPrice: 'original_price',
  isPopular: 'is_popular',
  soldCount: 'sold_count',
  secretData: 'secret_data',
  billNumber: 'bill_number',
  discordClaimed: 'discord_claimed',
  webClaimed: 'web_claimed',
  productId: 'product_id',
  isDeleted: 'is_deleted',
  categoryId: 'category_id',
  isHighlight: 'is_highlight',
  customPageId: 'custom_page_id',
  youtubeUrl: 'youtube_url',
  isPreOrder: 'is_preorder',
  preOrderOptions: 'preorder_options'
};

const missingColumns = new Set<string>();

function toDB(data: any, collection?: string): any {
  if (!data || typeof data !== 'object') return data;
  const res: any = {};
  
  // Copy data to avoid mutating the original
  const _data = { ...data };

  // Remove JSON encoding hack as requested, expect real DB columns


  for (const k in _data) {
    let target = k;
    if (forwardMap[k]) target = forwardMap[k];
    else target = k.toLowerCase();

    // Skip known missing columns for this collection
    if (collection && missingColumns.has(`${collection}.${target}`)) continue;

    // Ignore frontend-only
    if (k === 'premiumExpireDate' || k === 'fullName' || k === 'avatarUrl' || k === 'rank') continue;
    
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

  // Remove JSON decoding hack as well, expect real DB columns


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
    // Strip leading/trailing double quotes
    if (col.startsWith('"') && col.endsWith('"')) col = col.substring(1, col.length - 1);
    return col;
  }
  const m4 = errMsg.match(/column "([^"]+)"/);
  if (m4) return m4[1];
  return null;
}

const isVirtual = (collection: string) => collection === 'product_stock_chunks' || collection.includes('_chunks') || collection === 'idempotency_keys';
const isVirtualSlug = (slug: string) => slug && (slug.startsWith('v:') || slug.startsWith('_sys_virtual_db_col_::'));
const getVirtualSlug = (collection: string, id: string) => `_sys_virtual_db_col_::${collection}::${id}`;

class SupabaseDoc {
  public collection: string;
  public id: string;
  private _last_content_raw?: string;

  constructor(collection: string, id: string) {
    this.collection = collection;
    this.id = id;
  }
  pk() {
    return this.collection === 'blocked_ips' ? 'ip' : (this.collection === 'settings' ? 'key' : 'id');
  }

  async get() {
    if (isVirtual(this.collection)) {
        const slug = getVirtualSlug(this.collection, this.id);
        const legacySlug = `v:${this.collection}:${this.id}`;
        try {
            let { data, error } = await supabaseAdmin.from('custom_pages').select('content').eq('slug', slug).single();
            if (error || !data) {
                const legacyRes = await supabaseAdmin.from('custom_pages').select('content').eq('slug', legacySlug).single();
                if (!legacyRes.error && legacyRes.data) {
                    data = legacyRes.data;
                } else {
                    this._last_content_raw = undefined;
                    return { id: this.id, ref: this, exists: false, data: () => null };
                }
            }
            this._last_content_raw = data.content;
            const parsed = JSON.parse(data.content);
            return { id: this.id, ref: this, exists: true, data: () => parsed };
        } catch (e) {
            this._last_content_raw = undefined;
            return { id: this.id, ref: this, exists: false, data: () => null };
        }
    }
    let retries = 0;
    while(retries < 5) {
      retries++;
      try {
        const { data, error } = await supabaseAdmin.from(this.collection).select('*').eq(this.pk(), this.id).single();
        if (error && error.code !== 'PGRST116') {
          if (error.message && error.message.includes('invalid input syntax for type uuid')) {
             return { id: this.id, ref: this, exists: false, data: () => null };
          }
          throw error;
        }
        if (!data) return { id: this.id, ref: this, exists: false, data: () => null };
        const mapped = fromDB(data);
        return { id: this.id, ref: this, exists: true, data: () => mapped };
      } catch (err: any) {
        if (err.message && err.message.includes('invalid input syntax for type uuid')) {
          console.warn('Ignoring invalid UUID syntax error for ' + this.collection);
          return { docs: [], empty: true, forEach: () => {} };
        }
        if (err.message && ((err.message.includes("Could not find the") && err.message.includes("column")) || (err.message.includes("column") && err.message.includes("does not exist")))) {
          console.warn(`Column error in fetch from ${this.collection}: ${err.message}. Adding to blacklist and retrying...`);
          const col = extractMissingColumn(err.message);
          if (col) {
             missingColumns.add(`${this.collection}.${col}`);
             throw new Error(`Schema cache error on Supabase for table ${this.collection}: ${err.message}. Try reloading the database schema cache.`);
          }
        }
        if (err.message && err.message.includes("Could not find the table")) {
          return { exists: false, data: () => null };
        }
        throw err;
      }
    }
    return { exists: false, data: () => null };
  }
  async update(data: any) {
    if (isVirtual(this.collection)) {
        const slug = getVirtualSlug(this.collection, this.id);
        const legacySlug = `v:${this.collection}:${this.id}`;
        try {
            const { data: matchingRow } = await supabaseAdmin.from('custom_pages').select('id, slug, content').in('slug', [slug, legacySlug]).limit(1);
            
            const existingContent = matchingRow && matchingRow[0] && matchingRow[0].content ? JSON.parse(matchingRow[0].content) : {};
            const activeSlug = matchingRow && matchingRow[0] && matchingRow[0].slug ? matchingRow[0].slug : slug;
            const merged = { ...existingContent, ...data, id: this.id };
            
            const payload = {
                slug: activeSlug,
                title: this.collection,
                content: JSON.stringify(merged)
            };
            
            if (matchingRow && matchingRow[0]) {
                const expectedRaw = matchingRow[0].content;
                const { data: updated, error: err } = await supabaseAdmin.from('custom_pages')
                    .update(payload)
                    .eq('id', matchingRow[0].id)
                    .eq('content', expectedRaw)
                    .select();
                if (err) throw err;
                if (!updated || updated.length === 0) {
                    throw new Error('VERSION_CONFLICT');
                }
            } else {
                const { error: err } = await supabaseAdmin.from('custom_pages').insert([payload]);
                if (err) {
                    if (err.code === '23505') throw new Error('VERSION_CONFLICT');
                    throw err;
                }
            }
        } catch (e: any) {
            console.error(`Error updating virtual doc ${this.collection}/${this.id}:`, e);
            throw e;
        }
        return;
    }
    const mergedData = { ...data };
    let retries = 0;
    while (retries < 5) {
      retries++;
      try {
        const dbPayload = toDB(mergedData, this.collection);
        let updateQuery: any = supabaseAdmin.from(this.collection).update(dbPayload).eq(this.pk(), this.id);
        
        if (data._version !== undefined && !missingColumns.has(`${this.collection}._version`)) {
          // Explicit _version check for optimistic concurrency control
          updateQuery = updateQuery.eq('_version', data._version - 1).select();
        }
        
        const { error, data: resultData } = await updateQuery;
        
        // If we expect optimistic lock success but received no updated rows, someone else modified it!
        if (!error && (data._version !== undefined) && !missingColumns.has(`${this.collection}._version`) && (!resultData || resultData.length === 0)) {
           throw new Error('VERSION_CONFLICT');
        }
        
        if (error) throw error;
        break;
      } catch (err: any) {
        if (err.message && err.message.includes('invalid input syntax for type uuid')) {
          console.warn('Ignoring invalid UUID syntax error for ' + this.collection);
          return { docs: [], empty: true, forEach: () => {} };
        }
        if (err.message && ((err.message.includes("Could not find the") && err.message.includes("column")) || (err.message.includes("column") && err.message.includes("does not exist")))) {
          const col = extractMissingColumn(err.message);
          if (col) {
            if (!missingColumns.has(`${this.collection}.${col}`)) {
              console.warn(`Column ${col} missing in ${this.collection}, adding to blacklist and retrying...`);
              missingColumns.add(`${this.collection}.${col}`);
            } else {
              console.warn(`Column ${col} missing but was already blacklisted! Skipping data manipulation manually.`);
            }
            if (mergedData && typeof mergedData === 'object') {
              delete mergedData[col]; // Forcibly remove it from the data object to guarantee it is not serialized again
            }
            continue;
          }
        }
        throw err;
      }
    }
  }
  async delete() {
    if (isVirtual(this.collection)) {
        const slug = getVirtualSlug(this.collection, this.id);
        const legacySlug = `v:${this.collection}:${this.id}`;
        const { error } = await supabaseAdmin.from('custom_pages').delete().in('slug', [slug, legacySlug]);
        if (error) {
            console.error(`Error deleting virtual doc ${this.collection}/${this.id}:`, error);
            throw error;
        }
        return;
    }
    const { error } = await supabaseAdmin.from(this.collection).delete().eq(this.pk(), this.id);
    if (error) throw error;
  }
  async set(data: any, options: any = {}) {
    if (isVirtual(this.collection)) {
        const slug = getVirtualSlug(this.collection, this.id);
        const legacySlug = `v:${this.collection}:${this.id}`;
        try {
            const { data: matchingRow } = await supabaseAdmin.from('custom_pages').select('id, slug, content').in('slug', [slug, legacySlug]).limit(1);
            
            let finalData = { ...data, id: this.id };
            let activeSlug = slug;
            let expectedRaw: string | null = null;
            let rowId: string | null = null;
            
            if (matchingRow && matchingRow[0]) {
                activeSlug = matchingRow[0].slug;
                rowId = matchingRow[0].id;
                expectedRaw = matchingRow[0].content;
                if (options.merge) {
                    try {
                        const parsed = JSON.parse(matchingRow[0].content);
                        finalData = { ...parsed, ...data, id: this.id };
                    } catch(e) { console.error("Caught error:", e); }
                }
            }
            
            const payload = {
                slug: activeSlug,
                title: this.collection,
                content: JSON.stringify(finalData)
            };
            
            if (rowId) {
                const { data: updated, error: err } = await supabaseAdmin.from('custom_pages')
                    .update(payload)
                    .eq('id', rowId)
                    .eq('content', expectedRaw)
                    .select();
                if (err) throw err;
                if (!updated || updated.length === 0) {
                    throw new Error('VERSION_CONFLICT');
                }
            } else {
                const { error: err } = await supabaseAdmin.from('custom_pages').insert([payload]);
                if (err) {
                    if (err.code === '23505') throw new Error('VERSION_CONFLICT');
                    throw err;
                }
            }
        } catch (e: any) {
            console.error(`Error setting virtual doc ${this.collection}/${this.id}:`, e);
            throw e;
        }
        return;
    }
    const mergedData = { ...data };
    let retries = 0;
    while (retries < 5) {
      retries++;
      try {
        const pk = this.pk();
        if (options.merge) {
          const { data: existing, error: err } = await supabaseAdmin.from(this.collection).select(pk).eq(pk, this.id).single();
          if (existing) {
            const { error } = await supabaseAdmin.from(this.collection).update(toDB(mergedData, this.collection)).eq(pk, this.id);
            if (error) throw error;
          } else {
            const { error } = await supabaseAdmin.from(this.collection).insert([toDB({ [pk]: this.id, ...mergedData }, this.collection)]);
            if (error) throw error;
          }
        } else {
          const { error } = await supabaseAdmin.from(this.collection).upsert([toDB({ [pk]: this.id, ...mergedData }, this.collection)]);
          if (error) throw error;
        }
        break;
      } catch (err: any) {
        if (err.message && err.message.includes('invalid input syntax for type uuid')) {
          console.warn('Ignoring invalid UUID syntax error for ' + this.collection);
          return { docs: [], empty: true, forEach: () => {} };
        }
        if (err.message && (err.message.includes("Could not find the table") || (err.message.includes("relation") && err.message.includes("does not exist")))) {
          console.warn(`Table ${this.collection} missing during set, operation skipped.`);
          return;
        }
        if (err.message && ((err.message.includes("Could not find the") && err.message.includes("column")) || (err.message.includes("column") && err.message.includes("does not exist")))) {
          const col = extractMissingColumn(err.message);
          if (col && col !== this.pk()) {
            if (!missingColumns.has(`${this.collection}.${col}`)) {
              console.warn(`Column ${col} missing in ${this.collection}, adding to blacklist and retrying...`);
              missingColumns.add(`${this.collection}.${col}`);
            } else {
              console.warn(`Column ${col} missing but was already blacklisted! Skipping data manipulation manually.`);
            }
            if (mergedData && typeof mergedData === 'object') {
               delete mergedData[col];
            }
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
  _offset?: number;

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
  offset(n: number) {
    this._offset = n;
    return this;
  }
  _selectFields: string | null = null;

  select(...fields: string[]) {
    const mapped = fields.map(field => {
      if (forwardMap[field]) return forwardMap[field];
      return field.toLowerCase();
    });
    this._selectFields = mapped.join(',');
    return this;
  }
  async get() {
    if (!isSupabaseAdminConfigured) {
      return {
        docs: [],
        empty: true,
        forEach: (cb: any) => {}
      };
    }
    if (isVirtual(this.collection)) {
      const { data, error } = await supabaseAdmin.from('custom_pages').select('content, slug').eq('title', this.collection);
      if (error) throw error;
      
      const items: any[] = [];
      const rawMap = new Map<string, string>();
      for (const row of (data || [])) {
         try {
           if (row.content) {
              const item = JSON.parse(row.content);
              items.push(item);
              if (item.id) {
                 rawMap.set(item.id, row.content);
              }
           }
         } catch(e) { console.error("Caught error:", e); }
      }
      
      let filteredData = [...items];
      for (const w of this._where) {
        if (w.op === '==') filteredData = filteredData.filter((d: any) => {
            const key = Object.keys(d).find((k) => k.toLowerCase() === w.field.toLowerCase()) || w.field;
            return d[key] === w.value;
        });
        else if (w.op === '>') filteredData = filteredData.filter((d: any) => {
            const key = Object.keys(d).find((k) => k.toLowerCase() === w.field.toLowerCase()) || w.field;
            return d[key] > w.value;
        });
        else if (w.op === '<') filteredData = filteredData.filter((d: any) => {
            const key = Object.keys(d).find((k) => k.toLowerCase() === w.field.toLowerCase()) || w.field;
            return d[key] < w.value;
        });
      }
      for (const o of this._orderBy) {
        filteredData.sort((a: any, b: any) => {
            const keyA = Object.keys(a).find((k) => k.toLowerCase() === o.field.toLowerCase()) || o.field;
            const keyB = Object.keys(b).find((k) => k.toLowerCase() === o.field.toLowerCase()) || o.field;
            return o.dir === 'asc' ? (a[keyA] > b[keyB] ? 1 : -1) : (a[keyA] < b[keyB] ? 1 : -1);
        });
      }
      if (this._offset) {
        if (this._limit) filteredData = filteredData.slice(this._offset, this._offset + this._limit);
        else filteredData = filteredData.slice(this._offset);
      } else if (this._limit) {
        filteredData = filteredData.slice(0, this._limit);
      }
      return {
        docs: filteredData.map((d: any) => {
           const doc = new SupabaseDoc(this.collection, d.id);
           doc['_last_content_raw'] = rawMap.get(d.id);
           return {
              id: d.id,
              ref: doc,
              data: () => d
           };
        }),
        empty: filteredData.length === 0,
        forEach: (cb: any) => filteredData.forEach((d: any) => {
           const doc = new SupabaseDoc(this.collection, d.id);
           doc['_last_content_raw'] = rawMap.get(d.id);
           cb({ id: d.id, ref: doc, data: () => d });
        })
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
      if (this._offset) {
        // Supabase uses range(from, to). If offset is N and limit is L, it's range(N, N + L - 1)
        if (this._limit) {
           q = q.range(this._offset, this._offset + this._limit - 1);
        } else {
           // If limit not given, we just want to skip offset, maybe default to high limit
           q = q.range(this._offset, this._offset + 1000000);
        }
      }
      return await q;
    };

    let currentWhere = [...this._where];
    let currentOrderBy = [...this._orderBy];

    let retries = 0;
    while (retries < 5) {
      retries++;
      try {
        const _origSelect = this._selectFields;
        if (this._selectFields) {
           this._selectFields = this._selectFields.split(',').filter(f => !missingColumns.has(`${this.collection}.${f.trim()}`)).join(',');
        }
        
        const { data, error } = await executeQuery(currentWhere, currentOrderBy);
        if (_origSelect) this._selectFields = _origSelect;

        if (error) throw error;
        
        let finalData = data || [];
        if (this.collection === 'custom_pages') {
          finalData = finalData.filter((d: any) => !d.slug || !isVirtualSlug(d.slug));
        }
        
        return {
          docs: finalData.map((d: any) => {
            const mapped = fromDB(d);
            const docId = d.id || d.key || d.ip || d.username || 'unknown';
            return {
              id: docId,
              ref: new SupabaseDoc(this.collection, docId),
              data: () => mapped
            };
          }),
          empty: finalData.length === 0,
          forEach: function(cb: Function) {
            finalData.forEach((d: any) => {
              const mapped = fromDB(d);
              const docId = d.id || d.key || d.ip || d.username;
              cb({ id: docId, ref: new SupabaseDoc(this.collection, docId), data: () => mapped });
            });
          }
        };
      } catch (err: any) {
        if (err.message && err.message.includes('invalid input syntax for type uuid')) {
          console.warn('Ignoring invalid UUID syntax error for ' + this.collection);
          return { docs: [], empty: true, forEach: () => {} };
        }
        if (err.message && ((err.message.includes("Could not find the") && err.message.includes("column")) || (err.message.includes("column") && err.message.includes("does not exist")))) {
          const col = extractMissingColumn(err.message);
          let handled = false;
          if (col && this._selectFields && this._selectFields.includes(col)) {
             this._selectFields = this._selectFields.split(',').filter(f => f.trim() !== col).join(',');
             handled = true;
          }
          if (col) {
            if (!missingColumns.has(`${this.collection}.${col}`)) {
               console.warn(`Column ${col} missing in ${this.collection} during fetch, adding to blacklist and retrying...`);
               missingColumns.add(`${this.collection}.${col}`);
            } else {
               console.warn(`Column ${col} missing but was already blacklisted! Stripping out manually.`);
            }
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
    throw new Error('Max retries exceeded waiting for columns check in SupabaseQuery.get');
  }
}

class SupabaseCollection extends SupabaseQuery {
  doc(id?: string) {
    const genId = () => crypto.randomUUID();
    return new SupabaseDoc(this.collection, id || genId());
  }
  async add(data: any) {
    if (isVirtual(this.collection)) {
        const docId = data.id || crypto.randomUUID();
        const slug = getVirtualSlug(this.collection, docId);
        const finalData = { ...data, id: docId };
        
        const payload = {
            slug,
            title: this.collection,
            content: JSON.stringify(finalData)
        };
        const { error } = await supabaseAdmin.from('custom_pages').insert([payload]);
        if (error) {
            if (error.code === '23505') throw new Error('VERSION_CONFLICT');
            throw error;
        }
        return { id: docId };
    }
    const pk = this.collection === 'blocked_ips' ? 'ip' : (this.collection === 'settings' ? 'key' : 'id');
    const docId = data[pk] || data.id || crypto.randomUUID();
    const mergedData = { ...data, [pk]: docId };
    const performAdd = async (payload: any) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (payload.id && !uuidRegex.test(payload.id)) {
        delete payload.id;
      }
      const { data: inserted, error } = await supabaseAdmin.from(this.collection).insert([payload]).select().single();
      if (error) throw error;
      return { id: inserted?.id || docId };
    };

    try {
      return await performAdd(toDB(mergedData, this.collection));
    } catch (err: any) {
        if (err.message && err.message.includes('invalid input syntax for type uuid')) {
          console.warn('Ignoring invalid UUID syntax error for ' + this.collection);
          return { docs: [], empty: true, forEach: () => {} };
        }
      if (err.message && ((err.message.includes("Could not find the") && err.message.includes("column")) || (err.message.includes("column") && err.message.includes("does not exist")))) {
        const col = extractMissingColumn(err.message);
        if (col) {
          console.warn(`Column ${col} missing in ${this.collection}, adding to blacklist and retrying...`);
          missingColumns.add(`${this.collection}.${col}`);
          return await performAdd(toDB(mergedData, this.collection));
        }
      }
      throw err;
    }
  }
}

const db = {
  collection: (name: string) => new SupabaseCollection(name),
  runTransaction: async (updateFunction: (t: any) => Promise<any>) => {
    let attempts = 0;
    while (attempts < 5) {
      try {
        const reads = new Map();
        const writes: any[] = [];
        
        const t = {
          get: async (queryOrRef: any) => {
            const res = await queryOrRef.get();
            if (res.exists) {
              reads.set(queryOrRef.id, res.data()._version || 0);
            } else if (res.docs) {
              // It's a query
              res.docs.forEach((d: any) => {
                reads.set(d.id, d.data()._version || 0);
              });
            }
            return res;
          },
          update: (docRef: any, data: any) => {
            writes.push({ type: 'update', ref: docRef, data });
          },
          set: (docRef: any, data: any) => {
            writes.push({ type: 'set', ref: docRef, data });
          },
          delete: (docRef: any) => {
            writes.push({ type: 'delete', ref: docRef });
          }
        };
        
        const result = await updateFunction(t);
        
        // Execute writes (Synchronously locked on the logical application level ideally)
        await Promise.all(writes.map(async (w) => {
           if (w.type === 'update' || w.type === 'set') {
              const oldVersion = reads.get(w.ref.id) || 0;
              w.data._version = oldVersion + 1;
              if (w.type === 'update') await w.ref.update(w.data);
              else await w.ref.set(w.data);
           } else if (w.type === 'delete') {
              await w.ref.delete();
           }
        }));
        
        return result;
      } catch (err: any) {
        if (err.message && err.message.includes('invalid input syntax for type uuid')) {
          console.warn('Ignoring invalid UUID syntax error for transaction');
          return { docs: [], empty: true, forEach: () => {} };
        }
        if (err.message === 'VERSION_CONFLICT' || err.message === 'CONCURRENCY_ERROR') {
          attempts++;
          await new Promise(r => setTimeout(r, 100 * Math.pow(2, attempts)));
          if (attempts >= 5) throw new Error('Transaction failed after retries due to high concurrency. Please try again.');
          continue; // Retry
        }
        throw err;
      }
    }
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
