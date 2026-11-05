const path = require('path');
const fs = require('fs');
const mongoose = require(path.join(__dirname, '..', '..', 'backend', 'node_modules', 'mongoose'));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017', { dbName: 'metaforge_recruiter_v2' });
  const db = mongoose.connection.db;
  const c = await db.collection('candidates').findOne({ candidateId: 'V1-21019' });
  console.log(
    JSON.stringify(
      {
        found: !!c,
        candidateId: c?.candidateId,
        name: c?.name,
        resumeFileId: c?.resumeFileId || null,
        resumeFileName: c?.resumeFileName || null,
        legacyResumeUrl: c?.legacy?.resumeUrl || null,
      },
      null,
      2,
    ),
  );
  if (c?.resumeFileId) {
    const f = await db.collection('file_metadata').findOne({ _id: c.resumeFileId });
    const disk = f?.storageKey
      ? path.join(__dirname, '..', '..', 'backend', 'storage', 'private', f.storageKey)
      : null;
    console.log(
      JSON.stringify(
        {
          fileMeta: f
            ? {
                fileId: f.fileId,
                originalName: f.originalName,
                storageKey: f.storageKey,
              }
            : null,
          diskExists: disk ? fs.existsSync(disk) : false,
          disk,
        },
        null,
        2,
      ),
    );
  } else if (c?.legacy?.resumeUrl) {
    const src = path.join(
      __dirname,
      '..',
      '..',
      'V1_postgre_backup',
      'staffing_db_full_2026-10-31_120514',
      'uploads',
      'resumes',
      path.basename(String(c.legacy.resumeUrl)),
    );
    console.log(JSON.stringify({ v1FileOnDisk: fs.existsSync(src), src }, null, 2));
  }

  const withId = await db.collection('candidates').countDocuments({ resumeFileId: { $ne: null } });
  const noId = await db.collection('candidates').countDocuments({ resumeFileId: null });
  const noIdHasUrl = await db.collection('candidates').countDocuments({
    resumeFileId: null,
    'legacy.resumeUrl': { $exists: true, $nin: [null, ''] },
  });
  console.log(JSON.stringify({ withId, noId, noIdHasUrl }, null, 2));
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
