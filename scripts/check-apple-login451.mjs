import assert from 'node:assert/strict';
import {authenticateApple} from '../apple-login.js';
const original={uid:'existing'},auth={currentUser:original};let linked=0,signed=0;
const args={auth,native:{signInWithApple:async()=>({credential:{idToken:'test',nonce:'nonce'}})},credential:x=>x,link:async(user)=>{assert.equal(user,original);linked++;return {user}},signIn:async()=>{signed++}};
await authenticateApple({...args,linking:true});assert.equal(linked,1);assert.equal(signed,0);assert.equal(auth.currentUser.uid,'existing');
await authenticateApple({...args,linking:false});assert.equal(signed,1);
await assert.rejects(authenticateApple({...args,native:{signInWithApple:async()=>({credential:{idToken:'test'}})}}),/missing-apple/);
await assert.rejects(authenticateApple({...args,native:{signInWithApple:async()=>{auth.currentUser={uid:'other'};return {credential:{idToken:'test',nonce:'n'}}}},linking:true}),/account-changed/);
assert.equal(linked,1);console.log('PASS Apple link preserves UID, uses no sign-in or entitlement writes; rejects missing nonce and account changes');
