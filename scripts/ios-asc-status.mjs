import assert from 'node:assert/strict';
import {sign} from 'node:crypto';
import {readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

const release = () => JSON.parse(readFileSync(new URL('../ios-release.json', import.meta.url), 'utf8'));
export function makeToken(env = process.env, now = Math.floor(Date.now()/1000)) {
  for (const key of ['ASC_KEY_ID','ASC_ISSUER_ID','ASC_PRIVATE_KEY']) assert.ok(env[key]?.trim(), `Missing ${key}`);
  const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const input = `${b64({alg:'ES256',kid:env.ASC_KEY_ID.trim(),typ:'JWT'})}.${b64({iss:env.ASC_ISSUER_ID.trim(),iat:now,exp:now+600,aud:'appstoreconnect-v1'})}`;
  const signature = sign('sha256', Buffer.from(input), {key:env.ASC_PRIVATE_KEY.trim(),dsaEncoding:'ieee-p1363'});
  return `${input}.${signature.toString('base64url')}`;
}
export async function appleGet(path) {
  assert.ok(path.startsWith('/v1/'), 'Only App Store Connect v1 requests permitted');
  const response = await fetch(`https://api.appstoreconnect.apple.com${path}`, {
    headers:{Authorization:`Bearer ${makeToken()}`}, signal:AbortSignal.timeout(45000), redirect:'error'
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Apple API ${response.status}: ${(body.errors||[]).map(e=>e.code).join(', ') || 'request failed'}`);
  return body;
}
export async function findApp() {
  const apps = await appleGet('/v1/apps?filter[bundleId]=com.drawervillage.app&limit=2');
  assert.equal(apps.data?.length, 1, 'Exactly one Drawer Village Apple app record is required');
  return apps.data[0].id;
}
export async function findBuild(appId) {
  const {version,build} = release();
  const query = new URLSearchParams({'filter[app]':appId,'filter[version]':String(build),include:'preReleaseVersion,buildBetaDetail',limit:'100'});
  const result = await appleGet(`/v1/builds?${query}`);
  const record = result.data.find(item => result.included?.some(v=>v.type==='preReleaseVersions' && v.id===item.relationships?.preReleaseVersion?.data?.id && v.attributes.version===version));
  if (!record) return null;
  const detail = result.included?.find(item=>item.type==='buildBetaDetails' && item.id===record.relationships?.buildBetaDetail?.data?.id);
  return {id:record.id, version, build, processingState:record.attributes.processingState,
    usesNonExemptEncryption:record.attributes.usesNonExemptEncryption ?? null,
    audience:record.attributes.buildAudienceType ?? null,
    internalBuildState:detail?.attributes.internalBuildState ?? null};
}
export function saveStatus(name, data) {
  assert.match(name,/^[a-z-]+$/);
  const directory = new URL('../ios/build/testflight-reports/',import.meta.url);
  mkdirSync(directory,{recursive:true});
  writeFileSync(new URL(`${name}.json`,directory),JSON.stringify(data,null,2)+'\n');
}
export async function preflight() {
  const appId = await findApp();
  const existing = await findBuild(appId);
  assert.equal(existing,null,'Build number already exists in Apple; do not upload a duplicate');
  saveStatus('preflight',{appId,...release(),apiAccess:true,buildNumberUnused:true});
  console.log(`PASS Apple app access; ${release().version} (${release().build}) is unused.`);
  return appId;
}
if (process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv[2]==='preflight') await preflight();
    else {
      const appId=await findApp(), build=await findBuild(appId);
      saveStatus('apple-build',{appId,build});
      console.log(JSON.stringify({appId,build}));
    }
  } catch(error) { console.error(error.message); process.exitCode=1; }
}
