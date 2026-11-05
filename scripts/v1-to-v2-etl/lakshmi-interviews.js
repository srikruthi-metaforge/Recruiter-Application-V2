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

  // Direct recruiterId on interview
  const byRecruiterId = await db.collection('interviews').countDocuments({
    recruiterId: user._id,
    deletedAt: null,
  });

  // Via submission.recruiterId (dashboard often ties interview → submission ownership)
  const mySubIds = (
    await db
      .collection('submissions')
      .find({ recruiterId: user._id, deletedAt: null }, { projection: { _id: 1 } })
      .toArray()
  ).map((s) => s._id);

  const bySubmission = await db.collection('interviews').countDocuments({
    deletedAt: null,
    submissionId: { $in: mySubIds },
  });

  const viaSubs = await db
    .collection('interviews')
    .find({ deletedAt: null, submissionId: { $in: mySubIds } })
    .project({ status: 1, dateTime: 1, candidateId: 1, submissionId: 1, requirementId: 1 })
    .limit(20)
    .toArray();

  const samples = [];
  for (const iv of viaSubs.slice(0, 10)) {
    const cand = iv.candidateId
      ? await db.collection('candidates').findOne({ _id: iv.candidateId }, { projection: { name: 1, candidateId: 1 } })
      : null;
    samples.push({
      status: iv.status,
      dateTime: iv.dateTime,
      candidate: cand?.name || null,
      candidateId: cand?.candidateId || null,
    });
  }

  const statusBreak = await db
    .collection('interviews')
    .aggregate([
      { $match: { deletedAt: null, submissionId: { $in: mySubIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();

  console.log(
    JSON.stringify(
      {
        user: user.name,
        email: user.email,
        interviewsWithRecruiterId: byRecruiterId,
        interviewsViaHerSubmissions: bySubmission,
        statusBreakdown: statusBreak,
        sample: samples,
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
