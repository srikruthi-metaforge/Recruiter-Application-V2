const path = require('path');
const mongoose = require(path.join(__dirname, '..', '..', 'backend', 'node_modules', 'mongoose'));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017', { dbName: 'metaforge_recruiter_v2' });
  const db = mongoose.connection.db;

  const total = await db.collection('requirements').countDocuments({ deletedAt: null });
  const withAssignees = await db.collection('requirements').countDocuments({
    deletedAt: null,
    assignedRecruiterIds: { $exists: true, $type: 'array', $ne: [] },
  });
  const unassigned = await db.collection('requirements').countDocuments({
    deletedAt: null,
    $or: [
      { assignmentStatus: 'Unassigned' },
      { assignedRecruiterIds: { $size: 0 } },
      { assignedRecruiterIds: { $exists: false } },
      { assignedRecruiterIds: null },
    ],
  });
  const byStatus = await db
    .collection('requirements')
    .aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$assignmentStatus', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();
  const byReqStatus = await db
    .collection('requirements')
    .aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();

  // How many unique recruiters appear on assignments
  const assigneeAgg = await db
    .collection('requirements')
    .aggregate([
      { $match: { deletedAt: null, assignedRecruiterIds: { $type: 'array', $ne: [] } } },
      { $unwind: '$assignedRecruiterIds' },
      { $group: { _id: '$assignedRecruiterIds', reqCount: { $sum: 1 } } },
      { $sort: { reqCount: -1 } },
    ])
    .toArray();

  const users = await db.collection('users').find({}).project({ name: 1, email: 1, role: 1 }).toArray();
  const byId = new Map(users.map((u) => [String(u._id), u]));

  const topAssignees = assigneeAgg.slice(0, 15).map((r) => {
    const u = byId.get(String(r._id));
    return { name: u?.name || String(r._id), email: u?.email || null, role: u?.role || null, assignedReqCount: r.reqCount };
  });

  // Lakshmi specifically
  const lakshmi = users.find((u) => u.email === 'lakshmi.v@metaforgeit.com');
  const lakshmiCount = lakshmi
    ? await db.collection('requirements').countDocuments({
        deletedAt: null,
        assignedRecruiterIds: lakshmi._id,
      })
    : null;

  // If dashboard shows same 677 for everyone — likely counting ALL non-unassigned reqs in workspace
  const notUnassigned = await db.collection('requirements').countDocuments({
    deletedAt: null,
    assignmentStatus: { $ne: 'Unassigned' },
  });
  const assignedStatus = await db.collection('requirements').countDocuments({
    deletedAt: null,
    assignmentStatus: 'Assigned',
  });

  // Sample: do many reqs share the same huge assignee list?
  const sample = await db
    .collection('requirements')
    .find({ deletedAt: null, assignedRecruiterIds: { $type: 'array', $ne: [] } })
    .project({ reqCode: 1, title: 1, assignmentStatus: 1, assignedRecruiterIds: 1, assignedRecruiterNames: 1 })
    .limit(5)
    .toArray();

  const assigneeListSizes = await db
    .collection('requirements')
    .aggregate([
      { $match: { deletedAt: null } },
      {
        $project: {
          n: { $size: { $ifNull: ['$assignedRecruiterIds', []] } },
        },
      },
      { $group: { _id: '$n', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])
    .toArray();

  console.log(
    JSON.stringify(
      {
        totalRequirements: total,
        withAssigneesArray: withAssignees,
        unassignedish: unassigned,
        notUnassignedStatus: notUnassigned,
        assignmentStatusAssigned: assignedStatus,
        byAssignmentStatus: byStatus,
        byReqStatus,
        uniqueAssignees: assigneeAgg.length,
        topAssignees,
        lakshmiAssignedCount: lakshmiCount,
        assigneeListSizeDistribution: assigneeListSizes,
        samples: sample.map((r) => ({
          reqCode: r.reqCode,
          assignmentStatus: r.assignmentStatus,
          assigneeCount: (r.assignedRecruiterIds || []).length,
          names: r.assignedRecruiterNames || null,
        })),
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
