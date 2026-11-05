const path = require('path');
const mongoose = require(path.join(__dirname, '..', '..', 'backend', 'node_modules', 'mongoose'));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017', { dbName: 'metaforge_recruiter_v2' });
  const db = mongoose.connection.db;

  const withIdsNoLead = await db.collection('requirements').countDocuments({
    deletedAt: null,
    assignedRecruiterIds: { $exists: true, $type: 'array', $ne: [] },
    $or: [{ assignedLeadId: null }, { assignedLeadId: { $exists: false } }],
  });

  const assignedWithIdsNoLead = await db.collection('requirements').countDocuments({
    deletedAt: null,
    assignmentStatus: 'Assigned',
    assignedRecruiterIds: { $exists: true, $type: 'array', $ne: [] },
    $or: [{ assignedLeadId: null }, { assignedLeadId: { $exists: false } }],
  });

  const assignedWithIds = await db.collection('requirements').countDocuments({
    deletedAt: null,
    assignmentStatus: 'Assigned',
    assignedRecruiterIds: { $exists: true, $type: 'array', $ne: [] },
  });

  // Simulate lead KPI filter from RecruiterDashboard
  const allReqs = await db
    .collection('requirements')
    .find({ deletedAt: null })
    .project({
      assignmentStatus: 1,
      owner: 1,
      assignedRecruiterIds: 1,
      assignedLeadId: 1,
      assignedLeadName: 1,
    })
    .toArray();

  function leadKpiCount(lead) {
    const myUserId = String(lead._id);
    const meName = String(lead.name || '').trim();
    return allReqs.filter((r) => {
      const ids = Array.isArray(r.assignedRecruiterIds)
        ? r.assignedRecruiterIds.map((id) => String(id))
        : [];
      const isUnassigned =
        r.assignmentStatus === 'Unassigned' ||
        ((!r.owner || r.owner === 'Unassigned') && ids.length === 0);
      if (isUnassigned) return false;

      const leadId = String(r.assignedLeadId || '');
      if (myUserId && leadId && leadId === myUserId) return true;
      if (myUserId && ids.some((id) => id === myUserId)) return true;
      const leadName = String(r.assignedLeadName || '').trim().toLowerCase();
      const meLower = meName.toLowerCase();
      if (meLower && leadName && (leadName === meLower || leadName.includes(meLower) || meLower.includes(leadName))) {
        return true;
      }
      // THIS is the shared dump rule for leads
      if (ids.length > 0 && !leadId) return true;
      return false;
    }).length;
  }

  function leadKpiCountFixed(lead) {
    const myUserId = String(lead._id);
    return allReqs.filter((r) => {
      const ids = Array.isArray(r.assignedRecruiterIds)
        ? r.assignedRecruiterIds.map((id) => String(id))
        : [];
      if (r.assignmentStatus === 'Unassigned') return false;
      const leadId = String(r.assignedLeadId || '');
      if (leadId && leadId === myUserId) return true;
      if (ids.some((id) => id === myUserId)) return true;
      return false;
    }).length;
  }

  const leads = await db
    .collection('users')
    .find({ role: 'lead', deletedAt: null })
    .project({ name: 1, email: 1 })
    .toArray();

  const perLead = leads.map((lead) => ({
    name: lead.name,
    email: lead.email,
    currentDashboardLogic: leadKpiCount(lead),
    ifOnlyOwnAssignments: leadKpiCountFixed(lead),
  }));

  console.log(
    JSON.stringify(
      {
        withIdsNoLead,
        assignedWithIdsNoLead,
        assignedWithIds,
        whyAround677:
          'Lead role uses rule: if requirement has any assignees and no assignedLeadId, EVERY lead sees it',
        perLead,
      },
      null,
      2,
    ),
  );
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
