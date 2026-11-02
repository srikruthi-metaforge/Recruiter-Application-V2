/**
 * Create MetaForge org + role permissions + 1 user per role.
 * Run: node migrations/create_role_users.js
 */
const fs = require('fs');
const path = require('path');

(() => {
  const envPath = path.join(__dirname, '..', 'backend', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]]) continue;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
})();

const mongoose = require(path.join(__dirname, '..', 'backend', 'node_modules', 'mongoose'));
const argon2 = require(path.join(__dirname, '..', 'backend', 'node_modules', 'argon2'));

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB_NAME || 'metaforge_recruiter_v2';

const ARGON2ID_CONFIG = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

const DEFAULT_ROLE_PERMISSIONS = {
  superadmin: {
    roleName: 'Super Admin',
    permissions: [
      'req_view_all', 'req_create', 'req_edit', 'req_assign', 'req_delete',
      'cand_search', 'cand_add', 'cand_export', 'cand_delete',
      'sub_create', 'sub_view_all', 'sub_reassign', 'sub_move_stage',
      'int_schedule', 'int_join_links', 'int_feedback', 'int_cancel',
      'rep_view_exec', 'rep_view_recruiter', 'rep_export_csv',
      'user_manage', 'role_manage', 'activity_logs',
      'analytics_view_company',
    ],
  },
  admin: {
    roleName: 'Admin',
    permissions: [
      'req_view_all', 'req_create', 'req_edit', 'req_assign',
      'cand_search', 'cand_add', 'cand_export',
      'sub_create', 'sub_view_all', 'sub_reassign', 'sub_move_stage',
      'int_schedule', 'int_join_links', 'int_feedback', 'int_cancel',
      'rep_view_exec', 'rep_view_recruiter', 'user_manage',
    ],
  },
  lead: {
    roleName: 'Team Lead',
    permissions: [
      'req_view_all', 'req_create', 'req_edit', 'req_assign',
      'cand_search', 'cand_add', 'cand_export',
      'sub_create', 'sub_view_all', 'sub_reassign', 'sub_move_stage',
      'int_schedule', 'int_join_links', 'int_feedback',
      'rep_view_recruiter',
    ],
  },
  recruiter: {
    roleName: 'Recruiter',
    permissions: [
      'req_create', 'req_edit', 'req_assign',
      'cand_search', 'cand_add',
      'sub_create', 'sub_move_stage',
      'int_schedule', 'int_join_links', 'int_feedback',
    ],
  },
  devteam: {
    roleName: 'Dev Team',
    permissions: [
      'req_view_all', 'req_create', 'req_edit', 'req_assign', 'req_delete',
      'cand_search', 'cand_add', 'cand_export', 'cand_delete',
      'sub_create', 'sub_view_all', 'sub_reassign', 'sub_move_stage',
      'int_schedule', 'int_join_links', 'int_feedback', 'int_cancel',
      'rep_view_exec', 'rep_view_recruiter', 'rep_export_csv',
      'user_manage', 'role_manage', 'activity_logs',
    ],
  },
  client: {
    roleName: 'Client',
    permissions: ['req_view_my', 'sub_view_client', 'int_feedback'],
  },
};

const USERS = [
  { role: 'superadmin', userId: 'USR-SA-001', name: 'Super Admin', email: 'superadmin@metaforge.local', password: 'SuperAdmin@2026' },
  { role: 'admin', userId: 'USR-AD-001', name: 'Admin User', email: 'admin@metaforge.local', password: 'Admin@2026' },
  { role: 'lead', userId: 'USR-LD-001', name: 'Team Lead', email: 'lead@metaforge.local', password: 'Lead@2026' },
  { role: 'recruiter', userId: 'USR-RC-001', name: 'Recruiter User', email: 'recruiter@metaforge.local', password: 'Recruiter@2026' },
  { role: 'devteam', userId: 'USR-DV-001', name: 'Dev Team', email: 'devteam@metaforge.local', password: 'DevTeam@2026' },
  { role: 'client', userId: 'USR-CL-001', name: 'Client User', email: 'client@metaforge.local', password: 'Client@2026' },
];

(async () => {
  await mongoose.connect(uri, { dbName });
  const db = mongoose.connection.db;

  let org = await db.collection('organizations').findOne({ slug: 'metaforge' });
  if (!org) {
    const inserted = await db.collection('organizations').insertOne({
      name: 'MetaForge',
      slug: 'metaforge',
      tier: 'Enterprise',
      active: true,
      schemaVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    org = await db.collection('organizations').findOne({ _id: inserted.insertedId });
  }
  const orgId = org._id;

  for (const [roleCode, val] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    await db.collection('roles_permissions').updateOne(
      { orgId, roleCode },
      {
        $set: {
          orgId,
          roleCode,
          roleName: val.roleName,
          permissions: val.permissions,
          schemaVersion: 1,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
  }

  const created = [];
  for (const u of USERS) {
    const passwordHash = await argon2.hash(u.password, { ...ARGON2ID_CONFIG, raw: false });
    const existing = await db.collection('users').findOne({
      orgId,
      email: u.email,
      deletedAt: null,
    });
    if (existing) {
      await db.collection('users').updateOne(
        { _id: existing._id },
        {
          $set: {
            name: u.name,
            userId: u.userId,
            passwordHash,
            role: u.role,
            active: true,
            deletedAt: null,
            updatedAt: new Date(),
          },
        },
      );
      created.push({ ...u, status: 'updated', _id: String(existing._id) });
    } else {
      const res = await db.collection('users').insertOne({
        orgId,
        userId: u.userId,
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        teamId: null,
        clientId: null,
        avatarUrl: null,
        phone: null,
        active: true,
        capabilities: {},
        lastLoginAt: null,
        deletedAt: null,
        schemaVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      created.push({ ...u, status: 'created', _id: String(res.insertedId) });
    }
  }

  console.log(
    JSON.stringify(
      {
        org: { _id: String(orgId), name: org.name, slug: org.slug },
        users: created.map((u) => ({
          role: u.role,
          email: u.email,
          password: u.password,
          name: u.name,
          userId: u.userId,
          status: u.status,
        })),
      },
      null,
      2,
    ),
  );

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
