// Daily bounded batches remove expired envelopes, never relationships or gifts.
async function deleteExpired(collection, cutoff) {
  let deleted = 0;
  while (true) {
    const page = await collection.where('createdAt', '<=', cutoff).limit(400).get();
    if (page.empty || !page.docs.length) return deleted;
    const batch = collection.firestore.batch();
    for (const doc of page.docs) batch.delete(doc.ref);
    await batch.commit();
    deleted += page.docs.length;
    if (page.docs.length < 400) return deleted;
  }
}
module.exports = {deleteExpired};
