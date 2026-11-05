const path = require('path');
const mongoose = require(path.join(__dirname, '..', '..', 'backend', 'node_modules', 'mongoose'));

/** Mimic workspace mapCandidate + frontend apiCandidateToUi / uiCandidateToRepo */
function mapCandidate(c) {
  const sourced =
    c.sourcedByRecruiterId && typeof c.sourcedByRecruiterId === 'object'
      ? c.sourcedByRecruiterId
      : null;
  return {
    id: c.candidateId || String(c._id),
    _id: String(c._id),
    name: c.name,
    resumeName: c.resumeFileName || '',
    resumeFileName: c.resumeFileName || '',
    resumeFileId: c.resumeFileId ? String(c.resumeFileId) : '',
    createdByName: sourced?.name || c.createdByName || '',
  };
}

function apiCandidateToUi(doc) {
  const mongoId =
    (typeof doc.id === 'string' && /^[a-f\d]{24}$/i.test(doc.id) ? doc.id : undefined) ||
    (typeof doc._id === 'string' && /^[a-f\d]{24}$/i.test(doc._id) ? doc._id : undefined);
  const businessId = String(doc.candidateId || '').replace(/^CAND-/i, '') || mongoId || String(doc.id || '');
  return {
    id: mongoId || businessId,
    _id: mongoId,
    candidateId: businessId,
    name: doc.name || '',
    resumeName: doc.resumeFileName || undefined,
    resumeFileId: doc.resumeFileId ? String(doc.resumeFileId) : undefined,
  };
}

function uiCandidateToRepo(candidate) {
  return {
    id: candidate._id || candidate.id,
    candidateId: candidate.id,
    name: candidate.name,
    resumeReference: candidate.resumeName,
    resumeFileId: candidate.resumeFileId,
  };
}

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017', { dbName: 'metaforge_recruiter_v2' });
  const db = mongoose.connection.db;

  const matches = await db
    .collection('candidates')
    .find({ $or: [{ candidateId: 'V1-21019' }, { name: /Bala Reddy/i }] })
    .project({
      candidateId: 1,
      name: 1,
      email: 1,
      resumeFileId: 1,
      resumeFileName: 1,
      legacy: 1,
      createdAt: 1,
    })
    .toArray();

  console.log('=== DB matches ===');
  console.log(JSON.stringify(matches, null, 2));

  for (const c of matches) {
    const sanitizeLike = {
      id: String(c._id),
      candidateId: c.candidateId,
      name: c.name,
      resumeFileId: c.resumeFileId ? String(c.resumeFileId) : null,
      resumeFileName: c.resumeFileName || null,
    };
    const fromApi = uiCandidateToRepo(apiCandidateToUi(sanitizeLike));
    const fromWorkspace = uiCandidateToRepo(mapCandidate(c));
    console.log(
      JSON.stringify(
        {
          candidateId: c.candidateId,
          fromApiPath: fromApi,
          fromWorkspacePath: fromWorkspace,
          idMismatch: fromApi.id !== fromWorkspace.id,
          apiId: fromApi.id,
          workspaceId: fromWorkspace.id,
        },
        null,
        2,
      ),
    );
  }

  // How many linked candidates would lose resume if workspace overwrites by business id vs mongo id
  const sample = await db
    .collection('candidates')
    .find({ resumeFileId: { $ne: null } })
    .project({ candidateId: 1, resumeFileName: 1 })
    .limit(3)
    .toArray();
  console.log('=== linked samples (workspace id = candidateId) ===');
  console.log(
    sample.map((c) => ({
      workspaceId: c.candidateId,
      apiId: String(c._id),
      resumeFileName: c.resumeFileName,
    })),
  );

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
