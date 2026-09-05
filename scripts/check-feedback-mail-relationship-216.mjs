import assert from "node:assert/strict";
import fs from "node:fs";
import {createContactMailbox,mailEnvelope} from "../notification-mail.js";

const values=new Map();
const storage={
  scope:"owner-a",
  getItem(key){return values.get(`${this.scope}:${key}`)??null},
  setItem(key,value){values.set(`${this.scope}:${key}`,String(value))}
};
const mailbox=createContactMailbox(storage),now=Date.now();
const message=(id,offset=0)=>mailEnvelope({id,title:`Letter ${id}`,body:"Body",at:new Date(now+offset),extra:{characterId:"character-a",mode:"question"}},storage.scope);
mailbox.record([message(1,-1000),message(2,-500),message(3,60_000)]);
assert.deepEqual(mailbox.due({"character-a":{}}).map(letter=>letter.title),["Letter 2","Letter 1"]);
assert.equal(mailbox.remove(mailbox.due({"character-a":{}})[0].id),1);
assert.deepEqual(mailbox.due({"character-a":{}}).map(letter=>letter.title),["Letter 1"]);
mailbox.record([message(2,-500)]);
assert.deepEqual(mailbox.due({"character-a":{}}).map(letter=>letter.title),["Letter 1"],"deleted letters must not return when notifications are rescheduled");
assert.equal(mailbox.removeMany(mailbox.due({"character-a":{}}).map(letter=>letter.id)),1);
assert.equal(mailbox.due({"character-a":{}}).length,0);
storage.scope="owner-b";
mailbox.record([message(4,-100)]);
assert.equal(mailbox.due({"character-a":{}}).length,1,"mail deletion tombstones stay account-scoped");

const views=fs.readFileSync(new URL("../views.js",import.meta.url),"utf8");
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const state=fs.readFileSync(new URL("../state.js",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../app.css",import.meta.url),"utf8");
const gradle=fs.readFileSync(new URL("../android/app/build.gradle",import.meta.url),"utf8");
assert.match(views,/catalogSelectionSummary=\(kind,ids\)/);
assert.doesNotMatch(views,/bookListSummary\(c\[collection\]\?\.\[kind\]/,"catalog UUID arrays must not be rendered as labels");
assert.match(views,/data-delete-contact-mail/);
assert.match(views,/data-delete-all-contact-mail/);
assert.match(app,/contactMailbox\.remove\(id\)/);
assert.match(app,/contactMailbox\.removeMany\(ids\)/);
assert.match(css,/\.mail-card-actions/);
assert.match(app,/legalStatus:f\.legalStatus\.value/);
assert.match(app,/marriageRegistration:f\.type\.value==="부부"\?f\.marriageRegistration\.value:""/);
assert.doesNotMatch(state,/relation\.type==="부부"\?"법적으로 관계가 등록됨"/);
assert.match(state,/normalizeMarriageRegistration/);
assert.ok(Number(gradle.match(/versionCode\s+(\d+)/)?.[1]||0)>=216);
assert.ok(Number(gradle.match(/versionName\s+"1\.0\.(\d+)"/)?.[1]||0)>=201);
console.log("PASS 216+: catalog names, account-scoped mail deletion, and spouse registration data");
