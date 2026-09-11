# Network await inventory

Static inventory of tracked app-root and functions source. Await inside a loop is a candidate, not proof of sequential network traffic. map/worker pools may already run concurrently. Each row costs up to N calls only if the awaited operation performs a remote request; local awaits cost zero network requests. Generated runtime and scripts are excluded.

| File | Line | Enclosing loop line | Awaited operation | Request estimate / priority |
|---|---:|---:|---|---|
| app.js | 4939 | 4928 | relationshipExportImage(img?.getAttribute("src")\|\|"") | N iterations; inspect call target before ranking |
| app.js | 5113 | 5111 | fetch(endpoint,{mode:"cors"}) | N iterations; inspect call target before ranking |
| app.js | 5115 | 5111 | response.json() | N iterations; inspect call target before ranking |
| app.js | 6127 | 6124 | icons.get(source) | N iterations; inspect call target before ranking |
| apple-billing-client.js | 48 | 48 | settle(purchase,auth) | N iterations; inspect call target before ranking |
| apple-billing-client.js | 57 | 57 | settle(purchase,auth) | N iterations; inspect call target before ranking |
| apple-billing-client.js | 76 | 76 | settle(previous,auth) | N iterations; inspect call target before ranking |
| auth.js | 255 | 252 | digestState(character) | N iterations; inspect call target before ranking |
| auth.js | 256 | 252 | Promise.all(Object.entries(days).map(async([dateKey,day])=>{ record.days[safeDocumentId(dateKey)]={dateKey:String(dateKey),hash:await digestState(day)}; })) | N iterations; inspect call target before ranking |
| auth.js | 257 | 256 | digestState(day) | N iterations; inspect call target before ranking |
| auth.js | 301 | 296 | readDocuments(cloudDays(characterId,uid)) | N iterations; inspect call target before ranking |
| auth.js | 323 | 320 | Promise.all(Object.values(oldRecord.days\|\|{}).map(day=>deleteDoc(cloudDayDoc(existingId,day.dateKey,uid)))) | N iterations; inspect call target before ranking |
| auth.js | 324 | 320 | deleteDoc(cloudCharacterDoc(existingId,uid)) | N iterations; inspect call target before ranking |
| auth.js | 332 | 328 | getDocs(collection(existing.ref,"days")) | N iterations; inspect call target before ranking |
| auth.js | 333 | 328 | Promise.all(oldDays.docs.map(day=>deleteDoc(day.ref))) | N iterations; inspect call target before ranking |
| auth.js | 334 | 328 | deleteDoc(existing.ref) | N iterations; inspect call target before ranking |
| auth.js | 534 | 524 | canvasBlob(canvas,"image/webp",quality) | N iterations; inspect call target before ranking |
| auth.js | 671 | 671 | new Promise(resolve=>setTimeout(resolve,80)) | N iterations; inspect call target before ranking |
| auth.js | 876 | 876 | sharedTownRequest('readMailbox') | N iterations; inspect call target before ranking |
| auth.js | 1008 | 1006 | getDoc(doc(db,"groups",membership.groupId\|\|membership.id)) | N iterations; inspect call target before ranking |
| auth.js | 1039 | 1038 | getDoc(doc(db,"groupInvites",inviteCode)) | N iterations; inspect call target before ranking |
| auth.js | 1278 | 1278 | getDoc(member) | N iterations; inspect call target before ranking |
| auth.js | 1278 | 1278 | updateDoc(member,{displayName:name,photoURL}) | N iterations; inspect call target before ranking |
| bounded-work.js | 5 | 5 | work(items[index],index) | N iterations; inspect call target before ranking |
| functions/account-deletion.js | 5 | 5 | query.limit(100).get() | N iterations; inspect call target before ranking |
| functions/account-deletion.js | 5 | 5 | db.recursiveDelete(doc.ref) | N iterations; inspect call target before ranking |
| functions/account-deletion.js | 17 | 16 | group.ref.collection('members').get() | N iterations; inspect call target before ranking |
| functions/account-deletion.js | 18 | 18 | db.collection('users').doc(member.id).collection('groupMemberships').doc(group.id).delete() | N iterations; inspect call target before ranking |
| functions/account-deletion.js | 19 | 16 | eraseQuery(db.collection('groupInvites').where('groupId','==',group.id)) | N iterations; inspect call target before ranking |
| functions/account-deletion.js | 20 | 16 | db.recursiveDelete(group.ref) | N iterations; inspect call target before ranking |
| functions/account-deletion.js | 26 | 26 | eraseQuery(root.collection(kind).where(field,'==',uid)) | N iterations; inspect call target before ranking |
| functions/account-deletion.js | 28 | 23 | root.collection('members').doc(uid).delete() | N iterations; inspect call target before ranking |
| functions/account-deletion.js | 30 | 30 | eraseQuery(db.collection(kind).where(field,'==',uid)) | N iterations; inspect call target before ranking |
| functions/account-mailbox.js | 6 | 5 | db.collectionGroup(kind).where(field,'==',uid).where('createdAt','>',cutoff).orderBy('createdAt','desc').limit(500).get() | N iterations; inspect call target before ranking |
| functions/account-mailbox.js | 7 | 5 | Promise.all(snap.docs.map(async d=>{ const p=d.data(),root=d.ref.parent.parent;if(key==='outgoingProposals'&&p.kind==='create-resident'&&p.creationRoot!==d.id)return null;if(blocked.has(p.senderUid)\|\|blocked.has(p.recipi | N iterations; inspect call target before ranking |
| functions/account-mailbox.js | 9 | 7 | get(root.collection('members').doc(p.senderUid)) | N iterations; inspect call target before ranking |
| functions/account-mailbox.js | 10 | 7 | get(root.collection('members').doc(p.recipientUid)) | N iterations; inspect call target before ranking |
| functions/account-mailbox.js | 11 | 7 | get(root.collection('members').doc(p.responderUid)) | N iterations; inspect call target before ranking |
| functions/account-mailbox.js | 12 | 7 | get(root.collection('residents').doc(p.sourceId)) | N iterations; inspect call target before ranking |
| functions/account-slots.js | 11 | 11 | Promise.all([tx.get(groupRef),tx.get(groupRef.collection('residents').where('ownerUid','==',uid))]) | N iterations; inspect call target before ranking |
| functions/character-transfer.js | 21 | 21 | tx.get(ref) | N iterations; inspect call target before ranking |
| functions/delete-group.js | 21 | 21 | db.collection('users').doc(memberId).collection('groupMemberships').doc(gid).delete() | N iterations; inspect call target before ranking |
| functions/delete-group.js | 22 | 22 | db.collection('groupInvites').where('groupId','==',gid).limit(100).get() | N iterations; inspect call target before ranking |
| functions/delete-group.js | 22 | 22 | Promise.all(page.docs.map(d=>d.ref.delete())) | N iterations; inspect call target before ranking |
| functions/diamond-refunds.js | 7 | 6 | db.runTransaction(async tx=>{const [prior,receipt]=await Promise.all([tx.get(event),tx.get(record.ref)]);if(prior.exists)return;const saved=receipt.data(),root=db.collection('users').doc(saved.uid),[u,deleted]=await Prom | N iterations; inspect call target before ranking |
| functions/image-deletion.js | 28 | 28 | ref.listCollections() | N iterations; inspect call target before ranking |
| functions/image-deletion.js | 28 | 28 | collection.listDocuments() | N iterations; inspect call target before ranking |
| functions/image-deletion.js | 28 | 28 | tree(child,personal) | N iterations; inspect call target before ranking |
| functions/image-deletion.js | 33 | 33 | tree(db.collection('groups').doc(gid),false) | N iterations; inspect call target before ranking |
| functions/image-deletion.js | 34 | 34 | db.collection(kind).where('ownerUid','==',uid).get() | N iterations; inspect call target before ranking |
| functions/image-deletion.js | 34 | 34 | tree(d.ref,true) | N iterations; inspect call target before ranking |
| functions/index.js | 339 | 339 | require('./delete-group')({db})(item.data().ownerUid,{groupId:item.id,confirm:true}) | N iterations; inspect call target before ranking |
| functions/index.js | 341 | 341 | q.get() | N iterations; inspect call target before ranking |
| functions/index.js | 342 | 342 | deleteExpired(group.ref.collection(kind),cutoff) | N iterations; inspect call target before ranking |
| functions/index.js | 367 | 367 | publisher.purchases.voidedpurchases.list({packageName:PACKAGE_NAME,startTime:String(Date.now()-29*86400000),includeQuantityBasedPartialRefund:true,token,maxResults:1000}) | N iterations; inspect call target before ranking |
| functions/index.js | 367 | 367 | require('./diamond-refunds').playRefund(db,item) | N iterations; inspect call target before ranking |
| functions/mail-retention.js | 5 | 4 | collection.where('createdAt', '<=', cutoff).limit(400).get() | N iterations; inspect call target before ranking |
| functions/mail-retention.js | 9 | 4 | batch.commit() | N iterations; inspect call target before ranking |
| functions/shared-mail.js | 3 | 3 | tx.get(root.collection('residents').doc(id)) | N iterations; inspect call target before ranking |
| functions/shared-notifications.js | 12 | 10 | getMessaging().send({token:value.token,notification:{title:({ko:'서랍마을',en:'Drawer Village',ja:'引き出し村'})[value.language]\|\|'Drawer Village',body:({'member-returned':{ko:'캐릭터가 내 마을로 돌아왔어요. 우편함에서 확인해 주세요.',en:'Your character | N iterations; inspect call target before ranking |
| functions/shared-notifications.js | 13 | 10 | device.ref.delete() | N iterations; inspect call target before ranking |
| functions/shared-residency.js | 28 | 28 | Promise.all([root.get(),root.collection('members').doc(uid).get(),root.collection('residents').where('ownerUid','==',uid).get()]) | N iterations; inspect call target before ranking |
| functions/town-edit.js | 24 | 22 | service[operation.action](uid,{...operation.input,groupId:input.groupId,townId:input.townId,revision}) | N iterations; inspect call target before ranking |
| local-media.js | 122 | 120 | job() | N iterations; inspect call target before ranking |
| local-media.js | 236 | 236 | collect(child,target) | N iterations; inspect call target before ranking |
| mail-recipients.js | 16 | 16 | directory(g) | N iterations; inspect call target before ranking |
| native-app.js | 195 | 188 | verifyPurchase({...purchaseResult,products:[storeProductId]}) | N iterations; inspect call target before ranking |
| native-app.js | 196 | 188 | finishVerifiedPurchase(purchaseResult,productId) | N iterations; inspect call target before ranking |
| portable-media.js | 10 | 7 | fetch(v,{signal:AbortSignal.timeout(20000)}) | N iterations; inspect call target before ranking |
| portable-media.js | 10 | 7 | r.blob() | N iterations; inspect call target before ranking |
| portable-media.js | 10 | 7 | new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob)}) | N iterations; inspect call target before ranking |
| portable-media.js | 12 | 7 | walk(v,key) | N iterations; inspect call target before ranking |
| shared-ui.js | 98 | 98 | api().requestAdmission(id) | N iterations; inspect call target before ranking |

## Firestore client call sites

| File | Line | Call |
|---|---:|---|
| auth.js | 232 | getDoc(doc(db,'imageDeletionState',session.uid)) |
| auth.js | 327 | getDocs(cloudCharacters(uid)) |
| auth.js | 332 | getDocs(collection(existing.ref,"days")) |
| auth.js | 353 | getDocs(cloudDays(characterId,uid)) |
| auth.js | 437 | getDoc(reference) |
| auth.js | 690 | getDoc(cloudDoc(session.uid)) |
| auth.js | 754 | getDoc(cloudDoc(session.uid)) |
| auth.js | 754 | getDocFromServer(cloudDoc(session.uid)) |
| auth.js | 845 | getDoc(reference) |
| auth.js | 868 | onSnapshot(doc(db,'users',uid,'sync','mailbox-signal'),()=>{ clearTimeout(mailboxSignalTimer);mailboxSignalTimer=setTimeout(()=>{if(user?.uid===uid)void refreshMailbox(true).catch(error=>console.warn('Mailbox signal refr |
| auth.js | 953 | onSnapshot(reference,snapshot=>{ if(groupSubscriptionKey!==subscriptionKey)return; const value=mapSnapshot ?snapshot.docs.map(item=>({id:item.id,...item.data()})) :snapshot.exists()?{id:snapshot.id,...snapshot.data()}:nu |
| auth.js | 1003 | getDocs(collection(db,"users",session.uid,"groupMemberships")) |
| auth.js | 1008 | getDoc(doc(db,"groups",membership.groupId\|\|membership.id)) |
| auth.js | 1039 | getDoc(doc(db,"groupInvites",inviteCode)) |
| auth.js | 1060 | getDoc(doc(db,"groupInvites",inviteCode)) |
| auth.js | 1101 | getDoc(reference) |
| auth.js | 1109 | getDoc(reference) |
| auth.js | 1124 | getDoc(cloudDoc(session.uid)) |
| auth.js | 1217 | getDoc(reference) |
| auth.js | 1218 | getDoc(reference) |
| auth.js | 1278 | getDoc(member) |
| auth.js | 1344 | getDocFromServer(doc(db,"users",account)) |
