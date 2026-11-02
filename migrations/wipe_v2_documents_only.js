/**
 * Wipe documents only — keep collections + indexes (schema structure).
 * Does not drop the database or collections.
 * Does not modify application schemas/APIs.
 *
 * Run: node migrations/wipe_v2_documents_only.js
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

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB_NAME || 'metaforge_recruiter_v2';

(async () => {
  await mongoose.connect(uri, { dbName });
  const db = mongoose.connection.db;
  const cols = await db.listCollections().toArray();
  const results = [];

  for (const meta of cols.sort((a, b) => a.name.localeCompare(b.name))) {
    const name = meta.name;
    const before = await db.collection(name).estimatedDocumentCount();
    const res = await db.collection(name).deleteMany({});
    const after = await db.collection(name).estimatedDocumentCount();
    const indexCount = (await db.collection(name).indexes()).length;
    results.push({
      collection: name,
      deleted: res.deletedCount,
      before,
      after,
      indexesKept: indexCount,
    });
  }

  const stats = await db.stats();
  console.log(
    JSON.stringify(
      {
        database: db.databaseName,
        collectionsProcessed: results.length,
        results,
        remainingObjects: stats.objects,
        collectionsStillPresent: stats.collections,
        indexesStillPresent: stats.indexes,
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
