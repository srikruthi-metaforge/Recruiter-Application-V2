const path = require('path');
const mongoose = require(path.join(__dirname, '..', '..', 'backend', 'node_modules', 'mongoose'));
const { ObjectId } = mongoose.Types;

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', {
    dbName: process.env.MONGODB_DB_NAME || 'metaforge_recruiter_v2',
  });
  const db = mongoose.connection.db;
  const fname = 'dharanendrach_gmail_com-1778064416324.pdf';
  const meta = await db.collection('file_metadata').findOne({ legacyPostgresId: `resume:${fname}` });
  let fixed = 0;
  if (meta) {
    const pending = await db
      .collection('candidates')
      .find({ resumeFileId: null, 'legacy.resumeUrl': fname })
      .toArray();
    for (const c of pending) {
      await db.collection('candidates').updateOne(
        { _id: c._id },
        { $set: { resumeFileId: meta._id, resumeFileName: fname, updatedAt: new Date() } },
      );
      await db.collection('candidate_documents').insertOne({
        _id: new ObjectId(),
        orgId: meta.orgId,
        candidateId: c._id,
        documentType: 'Resume',
        fileMetadataId: meta._id,
        isPrimaryResume: true,
        deletedAt: null,
        schemaVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      fixed++;
    }
  }
  const withFile = await db.collection('candidates').countDocuments({ resumeFileId: { $ne: null } });
  const files = await db.collection('file_metadata').countDocuments({});
  const docs = await db.collection('candidate_documents').countDocuments({});
  console.log(JSON.stringify({ fixed, withFile, files, docs }, null, 2));
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
