const path = require('path');
const mongoose = require(path.join(__dirname, '..', '..', 'backend', 'node_modules', 'mongoose'));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017', { dbName: 'metaforge_recruiter_v2' });
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: 'lakshmi.v@metaforgeit.com' });
  if (!user) {
    console.log(JSON.stringify({ error: 'user not found' }));
    await mongoose.disconnect();
    return;
  }

  const stages = await db
    .collection('submissions')
    .aggregate([
      { $match: { recruiterId: user._id, deletedAt: null } },
      { $group: { _id: '$stage', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();

  const onboardingLike = await db
    .collection('submissions')
    .find({
      recruiterId: user._id,
      deletedAt: null,
      stage: { $regex: /offer|placed|onboard|joined|\bselected\b/i },
    })
    .project({
      submissionId: 1,
      stage: 1,
      status: 1,
      candidateId: 1,
      requirementId: 1,
      clientId: 1,
      submittedAt: 1,
      updatedAt: 1,
    })
    .toArray();

  const details = [];
  for (const s of onboardingLike) {
    const cand =
      s.candidateId &&
      (await db.collection('candidates').findOne(
        { _id: s.candidateId },
        { projection: { name: 1, email: 1, candidateId: 1, phone: 1 } },
      ));
    const req =
      s.requirementId &&
      (await db.collection('requirements').findOne(
        { _id: s.requirementId },
        { projection: { title: 1, reqCode: 1, clientName: 1 } },
      ));
    details.push({
      submissionId: s.submissionId || String(s._id),
      stage: s.stage,
      candidateName: cand?.name || null,
      candidateBusinessId: cand?.candidateId || null,
      candidateEmail: cand?.email || null,
      requirement: req?.title || null,
      reqCode: req?.reqCode || null,
      client: req?.clientName || null,
      submittedAt: s.submittedAt || null,
    });
  }

  console.log(
    JSON.stringify(
      {
        user: { name: user.name, email: user.email, id: String(user._id) },
        stageBreakdown: stages,
        onboardingCount: details.length,
        onboardingCandidates: details,
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
