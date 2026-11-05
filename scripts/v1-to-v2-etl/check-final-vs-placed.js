const path = require('path');
const mongoose = require(path.join(__dirname, '..', '..', 'backend', 'node_modules', 'mongoose'));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017', { dbName: 'metaforge_recruiter_v2' });
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: 'lakshmi.v@metaforgeit.com' });

  const stages = await db
    .collection('submissions')
    .aggregate([
      { $match: { recruiterId: user._id, deletedAt: null } },
      { $group: { _id: '$stage', c: { $sum: 1 } } },
      { $sort: { c: -1 } },
    ])
    .toArray();

  const offered = await db
    .collection('submissions')
    .find({ recruiterId: user._id, deletedAt: null, stage: { $regex: /offer|placed|select|final/i } })
    .project({ stage: 1, candidateId: 1, submissionId: 1 })
    .toArray();

  const details = [];
  for (const s of offered) {
    const c = s.candidateId
      ? await db.collection('candidates').findOne({ _id: s.candidateId }, { projection: { name: 1, candidateId: 1 } })
      : null;
    details.push({
      submissionId: s.submissionId,
      stage: s.stage,
      candidate: c?.name,
      candidateId: c?.candidateId,
    });
  }

  const mySubIds = (
    await db.collection('submissions').find({ recruiterId: user._id, deletedAt: null }).project({ _id: 1 }).toArray()
  ).map((s) => s._id);

  const ivStatuses = await db
    .collection('interviews')
    .aggregate([
      { $match: { deletedAt: null, submissionId: { $in: mySubIds } } },
      { $group: { _id: '$status', c: { $sum: 1 } } },
      { $sort: { c: -1 } },
    ])
    .toArray();

  const rounds = await db
    .collection('interview_rounds')
    .aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$result', c: { $sum: 1 } } },
      { $sort: { c: -1 } },
    ])
    .toArray()
    .catch(() => []);

  // interviews with final-like status text
  const finalIsh = await db
    .collection('interviews')
    .find({
      deletedAt: null,
      submissionId: { $in: mySubIds },
      $or: [
        { status: { $regex: /final|select|offer|place|pass|hired/i } },
        { result: { $regex: /final|select|offer|place|pass|hired/i } },
        { feedback: { $regex: /final|select|offer|place/i } },
      ],
    })
    .project({ status: 1, result: 1, candidateId: 1, submissionId: 1 })
    .toArray();

  const finalDetails = [];
  for (const iv of finalIsh) {
    const c = iv.candidateId
      ? await db.collection('candidates').findOne({ _id: iv.candidateId }, { projection: { name: 1, candidateId: 1 } })
      : null;
    const sub = iv.submissionId
      ? await db.collection('submissions').findOne({ _id: iv.submissionId }, { projection: { stage: 1, submissionId: 1 } })
      : null;
    finalDetails.push({
      interviewStatus: iv.status,
      result: iv.result || null,
      candidate: c?.name,
      candidateId: c?.candidateId,
      submissionStage: sub?.stage,
      submissionId: sub?.submissionId,
    });
  }

  // sample interview doc keys
  const sampleIv = await db.collection('interviews').findOne({ submissionId: { $in: mySubIds } });

  console.log(
    JSON.stringify(
      {
        stages,
        offeredLikeSubs: details,
        interviewStatusBreakdown: ivStatuses,
        finalIshInterviews: finalDetails,
        sampleInterviewFields: sampleIv ? Object.keys(sampleIv) : [],
        sampleInterview: sampleIv
          ? {
              status: sampleIv.status,
              result: sampleIv.result,
              outcome: sampleIv.outcome,
              feedbackStatus: sampleIv.feedbackStatus,
              round: sampleIv.round,
            }
          : null,
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
