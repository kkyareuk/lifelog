import {readFile} from "node:fs/promises";
import assert from "node:assert/strict";

const rules=await readFile(new URL("../firestore.rules",import.meta.url),"utf8");
const authGuard=/request\.auth\s*!=\s*null\s*&&\s*request\.auth\.uid\s*==\s*userId/;

assert.match(rules,/match \/users\/\{userId\}\/sync\/\{syncDocument\}/);
assert.match(rules,/match \/users\/\{userId\}\/characters\/\{characterId\}/);
assert.match(rules,/match \/users\/\{userId\}\/characters\/\{characterId\}\/days\/\{dateId\}/);
assert.ok((rules.match(new RegExp(authGuard.source,"g"))||[]).length>=4,"모든 사용자 저장 경로에 UID 소유자 검사가 있어야 합니다.");
assert.doesNotMatch(rules,/match \/users\/\{userId\}\/\{document=\*\*\}/,"임의의 사용자 하위 문서 전체를 열어서는 안 됩니다.");

console.log("동기화 분할 문서 경로와 UID 소유자 제한을 확인했습니다.");
