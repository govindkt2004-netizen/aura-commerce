import { test } from 'node:test';
import assert from 'node:assert/strict';

import { db } from '../server/db.ts';

test('admin account creation supports secure password storage and role assignment', () => {
  const uniqueEmail = `ava.admin.${Date.now()}@aura.store`;
  const suffix = Number(String(Date.now()).slice(-9));
  const uniquePhone = `+91${String(6000000000 + (suffix % 3000000000)).slice(-10)}`;
  const user = db.createAdminUser({
    name: 'Ava Stone',
    email: uniqueEmail,
    phone: uniquePhone,
    password: 'AURA-Secure-2026!'
  });

  assert.equal(user.role, 'admin');
  assert.equal(user.phone, uniquePhone);
  assert.equal(db.verifyUserPassword(user.id, 'AURA-Secure-2026!'), true);
  assert.equal(db.verifyUserPassword(user.id, 'wrong-password'), false);
});
