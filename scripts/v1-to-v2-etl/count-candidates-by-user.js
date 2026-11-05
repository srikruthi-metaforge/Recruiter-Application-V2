const path = require('path');
const mongoose = require(path.join(__dirname, '..', '..', 'backend', 'node_modules', 'mongoose'));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017', { dbName: 'metaforge_recruiter_v2' });
  const db = mongoose.connection.db;

  const total = await db.collection('candidates').countDocuments({ deletedAt: null });
  const users = await db.collection('users').find({}, { projection: { name: 1, email: 1, role: 1 } }).toArray();
  const byId = new Map(users.map((u) => [String(u._id), u]));

  const rows = await db
    .collection('candidates')
    .aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$sourcedByRecruiterId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();

  const bySourcedRecruiter = rows.map((r) => {
    const u = r._id ? byId.get(String(r._id)) : null;
    return {
      name: u?.name || '(no user linked)',
      email: u?.email || null,
      role: u?.role || null,
      count: r.count,
    };
  });

  console.log(JSON.stringify({ totalCandidates: total, bySourcedRecruiter }, null, 2));
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
