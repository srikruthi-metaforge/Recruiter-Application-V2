const path = require('path');
const mongoose = require(path.join(__dirname, '..', '..', 'backend', 'node_modules', 'mongoose'));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017', { dbName: 'metaforge_recruiter_v2' });
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: 'pavani.j@metaforgeit.com' });
  if (!user) {
    console.log(JSON.stringify({ error: 'not found' }));
    await mongoose.disconnect();
    return;
  }

  const assignedReqs = await db
    .collection('requirements')
    .find({
      deletedAt: null,
      assignmentStatus: 'Assigned',
      assignedRecruiterIds: user._id,
    })
    .project({ _id: 1, reqCode: 1, title: 1 })
    .toArray();

  const assignedIds = assignedReqs.map((r) => r._id);

  const herSubs = await db
    .collection('submissions')
    .find({ deletedAt: null, recruiterId: user._id })
    .project({ requirementId: 1, stage: 1 })
    .toArray();

  const subReqIds = new Set(herSubs.map((s) => String(s.requirementId)));
  const assignedWithHerSubmission = assignedReqs.filter((r) => subReqIds.has(String(r._id))).length;
  const assignedWithNoHerSubmission = assignedReqs.length - assignedWithHerSubmission;

  // Submissions she made on reqs she is NOT listed as assignee on
  const subsOutsideAssignment = herSubs.filter(
    (s) => s.requirementId && !assignedIds.some((id) => String(id) === String(s.requirementId)),
  ).length;

  const distinctReqsSheSubmitted = subReqIds.size;

  console.log(
    JSON.stringify(
      {
        user: user.name,
        email: user.email,
        meaning:
          'Assigned = her user id is on requirement.assignedRecruiterIds (from V1 requirement_assignments). That is assignment, not proof she submitted/worked.',
        assignedRequirements: assignedReqs.length,
        distinctRequirementsSheSubmittedOn: distinctReqsSheSubmitted,
        assignedAndSheAlsoSubmitted: assignedWithHerSubmission,
        assignedButNoSubmissionByHer: assignedWithNoHerSubmission,
        herTotalSubmissions: herSubs.length,
        submissionsOnReqsNotInHerAssignmentList: subsOutsideAssignment,
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
