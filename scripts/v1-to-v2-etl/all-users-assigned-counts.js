const path = require('path');
const mongoose = require(path.join(__dirname, '..', '..', 'backend', 'node_modules', 'mongoose'));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017', { dbName: 'metaforge_recruiter_v2' });
  const db = mongoose.connection.db;

  const users = await db
    .collection('users')
    .find({ deletedAt: null })
    .project({ name: 1, email: 1, role: 1 })
    .sort({ role: 1, name: 1 })
    .toArray();

  const reqs = await db
    .collection('requirements')
    .find({ deletedAt: null, assignmentStatus: 'Assigned' })
    .project({ assignedRecruiterIds: 1, assignedLeadId: 1 })
    .toArray();

  const rows = users.map((u) => {
    const id = String(u._id);
    const asAssignee = reqs.filter((r) =>
      (r.assignedRecruiterIds || []).some((x) => String(x) === id),
    ).length;
    const asLead = reqs.filter((r) => r.assignedLeadId && String(r.assignedLeadId) === id).length;
    const own = reqs.filter((r) => {
      const ids = (r.assignedRecruiterIds || []).map((x) => String(x));
      const leadId = r.assignedLeadId ? String(r.assignedLeadId) : '';
      return ids.includes(id) || leadId === id;
    }).length;
    return {
      name: u.name,
      email: u.email,
      role: u.role,
      asAssignee,
      asLead,
      ownAssignedReqs: own,
    };
  });

  rows.sort((a, b) => b.ownAssignedReqs - a.ownAssignedReqs);
  console.log(JSON.stringify({ totalAssignedReqs: reqs.length, users: rows }, null, 2));
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
