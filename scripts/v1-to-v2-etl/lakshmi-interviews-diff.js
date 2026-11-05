const path = require('path');
const mongoose = require(path.join(__dirname, '..', '..', 'backend', 'node_modules', 'mongoose'));

function normIdentity(value) {
  return String(value || '').trim().toLowerCase();
}
function nameMatches(a, b) {
  const left = normIdentity(a);
  const right = normIdentity(b);
  if (!left || !right) return false;
  if (left === right) return true;
  if (left.includes(right) || right.includes(left)) return true;
  const leftTokens = left.split(/\s+/).filter((t) => t.length >= 3);
  const rightTokens = right.split(/\s+/).filter((t) => t.length >= 3);
  return leftTokens.some((t) => rightTokens.includes(t));
}
function ownsByRecruiter(owner, me) {
  const myId = String(me.id || '').trim();
  const ownerId = String(owner.id || '').trim();
  if (myId && ownerId && myId === ownerId) return true;
  const myEmail = normIdentity(me.email);
  const ownerEmail = normIdentity(owner.email);
  if (myEmail && ownerEmail && myEmail === ownerEmail) return true;
  return nameMatches(owner.name, me.name);
}

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017', { dbName: 'metaforge_recruiter_v2' });
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: 'lakshmi.v@metaforgeit.com' });
  const me = { id: String(user._id), email: user.email, name: user.name };

  const users = await db.collection('users').find({}).project({ name: 1, email: 1 }).toArray();
  const usersById = new Map(users.map((u) => [String(u._id), u]));

  const submissions = await db
    .collection('submissions')
    .find({ deletedAt: null })
    .project({ recruiterId: 1 })
    .toArray();
  const recruiterBySubmission = new Map(
    submissions.map((s) => [String(s._id), s.recruiterId ? String(s.recruiterId) : '']),
  );

  // Mimic workspace: all interviews (lead sees org-wide), then dashboard filters by ownership
  const interviews = await db
    .collection('interviews')
    .find({ deletedAt: null })
    .populate?.(); // n/a on native driver

  const raw = await db
    .collection('interviews')
    .find({ $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] })
    .toArray();

  const withDeletedNullOnly = await db.collection('interviews').find({ deletedAt: null }).toArray();
  const noDeletedFilter = await db.collection('interviews').find({}).toArray();

  function resolveRecruiterId(iv) {
    const sid = iv.submissionId?._id || iv.submissionId;
    return sid ? recruiterBySubmission.get(String(sid)) || '' : '';
  }

  const mapped = withDeletedNullOnly.map((iv) => {
    const recId = resolveRecruiterId(iv);
    const rec = usersById.get(recId);
    return {
      _id: String(iv._id),
      status: iv.status,
      recruiterId: recId,
      recruiter: rec?.name || '',
      recruiterEmail: rec?.email || '',
      submissionId: iv.submissionId ? String(iv.submissionId) : null,
      deletedAt: iv.deletedAt || null,
    };
  });

  const mine = mapped.filter((i) =>
    ownsByRecruiter({ id: i.recruiterId, email: i.recruiterEmail, name: i.recruiter }, me),
  );

  // Also count interviews with no submission link but name match somehow
  const byNameOnlyExtra = mapped.filter((i) => {
    const byId = i.recruiterId && i.recruiterId === me.id;
    const byOwn = ownsByRecruiter({ id: i.recruiterId, email: i.recruiterEmail, name: i.recruiter }, me);
    return byOwn && !byId;
  });

  // Include docs missing deletedAt field
  const allDocs = noDeletedFilter;
  const mappedAll = allDocs.map((iv) => {
    const recId = resolveRecruiterId(iv);
    const rec = usersById.get(recId);
    return {
      _id: String(iv._id),
      status: iv.status,
      recruiterId: recId,
      recruiter: rec?.name || '',
      recruiterEmail: rec?.email || '',
      deletedAt: iv.deletedAt ?? '(missing)',
    };
  });
  const mineAll = mappedAll.filter((i) =>
    ownsByRecruiter({ id: i.recruiterId, email: i.recruiterEmail, name: i.recruiter }, me),
  );

  // Fuzzy: any interview whose submission recruiter name matches "lakshmi" token
  const fuzzyName = mappedAll.filter((i) => nameMatches(i.recruiter, 'lakshmi.v Recruiter'));

  // Check if another user name shares "lakshmi" or "Recruiter" token causing extras
  const tokenHits = mapped.filter((i) => {
    if (!i.recruiter) return false;
    return nameMatches(i.recruiter, me.name) && String(i.recruiterId) !== me.id;
  });

  console.log(
    JSON.stringify(
      {
        me,
        counts: {
          deletedAtNull: mine.length,
          includingMissingDeletedAt: mineAll.length,
          totalInterviewsNull: withDeletedNullOnly.length,
          totalInterviewsAll: noDeletedFilter.length,
          fuzzyNameMatch: fuzzyName.length,
          ownedByNameNotId: byNameOnlyExtra.length,
          tokenCollisionOthers: tokenHits.length,
        },
        mineIds: mine.map((i) => i._id),
        mineAllExtra: mineAll.filter((a) => !mine.some((m) => m._id === a._id)),
        tokenCollisionSamples: tokenHits.slice(0, 5),
        statusOnMine: mine.reduce((acc, i) => {
          acc[i.status || '(none)'] = (acc[i.status || '(none)'] || 0) + 1;
          return acc;
        }, {}),
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
