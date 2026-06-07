import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  isSafeSupabaseRowId,
  pickSanitizedFields,
  sanitizeText,
  sanitizeUrlInput,
} from '../src/lib/security.ts';

const repoRoot = process.cwd();
const serverSource = fs.readFileSync(path.join(repoRoot, 'server.ts'), 'utf8');
const adminUserManagementSource = fs.readFileSync(
  path.join(repoRoot, 'src/components/AdminUserManagement.tsx'),
  'utf8',
);

const invalidRowIds = [
  '',
  'a'.repeat(161),
  'product/../owner',
  '..',
  'abc\u0000def',
  'space id',
];

assert.equal(isSafeSupabaseRowId('product_ABC-123'), true, 'valid Supabase row ids should be accepted');
for (const id of invalidRowIds) {
  assert.equal(isSafeSupabaseRowId(id), false, `unsafe Supabase row id should be rejected: ${JSON.stringify(id)}`);
}

assert.equal(sanitizeText('  ok\u0000<script>alert(1)</script>  ', 20), 'okalert(1)');
assert.equal(sanitizeUrlInput('javascript:alert(1)'), '', 'javascript: URLs must be rejected');
assert.equal(sanitizeUrlInput('https://example.com/image.png'), 'https://example.com/image.png');

const sanitizedProduct = pickSanitizedFields(
  {
    name: 'x'.repeat(130),
    price: '-10',
    stock: '5',
    imageUrl: 'javascript:alert(1)',
    role: 'owner',
    admin: true,
  },
  ['name', 'price', 'stock', 'imageUrl'],
  ['imageUrl'],
);
assert.equal(sanitizedProduct.name.length, 120, 'product name should be bounded');
assert.equal(sanitizedProduct.price, 0, 'negative prices should clamp to min');
assert.equal(sanitizedProduct.stock, 5, 'numeric strings should normalize to numbers');
assert.equal(sanitizedProduct.imageUrl, '', 'unsafe image URLs should be stripped');
assert.equal('role' in sanitizedProduct, false, 'mass-assignment role field should be dropped');
assert.equal('admin' in sanitizedProduct, false, 'mass-assignment admin field should be dropped');

assert.match(
  serverSource,
  /app\.get\('\/api\/topups',\s*requireAuth,/,
  'GET /api/topups must require authentication',
);
assert.match(
  serverSource,
  /app\.post\('\/api\/admins',\s*requireOwner,/,
  'admin role management must be owner-only',
);
assert.match(
  serverSource,
  /const userWritableFields = \['avatar', 'displayName', 'bio', 'username', 'fullName'\]/,
  'profile writes must use a narrow user writable field allow-list',
);
assert.doesNotMatch(
  serverSource,
  /const adminWritableFields = \[[^\]]*'role'/,
  'profile endpoint must not allow role mutation',
);
assert.match(
  serverSource,
  /requireSafeSupabaseRowId\(res, req\.params\.id\)/,
  'product/category/page endpoints must validate Supabase row ids before DB access',
);

assert.match(adminUserManagementSource, /escapeHtml\(user\.username \|\| ''\)/, 'admin modal must escape username HTML');
assert.match(adminUserManagementSource, /axios\.post\('\/api\/admins'/, 'role changes must use owner-protected admin endpoint');

console.log('security hardening checks passed');
