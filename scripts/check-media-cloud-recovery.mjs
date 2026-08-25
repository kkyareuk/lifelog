import assert from "node:assert/strict";
import {preserveDevicePhotos} from "../local-media.js";

const stale="local-media://missing-on-this-device";
const cloud="https://firebasestorage.googleapis.com/v0/b/drawer/o/media%2Fphoto.webp?alt=media";

const restored=preserveDevicePhotos(
  {characters:{a:{profileImage:stale,icon:"data:image/png;base64,AAAA"}}},
  {characters:{a:{profileImage:cloud,icon:"https://example.com/old-icon.webp"}}}
);
assert.equal(restored.characters.a.profileImage,cloud,"끊어진 기기 참조가 클라우드 사진을 덮으면 안 됨");
assert.equal(restored.characters.a.icon,"data:image/png;base64,AAAA","실제로 남아 있는 기기 원본은 유지해야 함");

const retryable=preserveDevicePhotos(
  {characters:{a:{profileImage:stale}}},
  {characters:{a:{profileImage:""}}}
);
assert.equal(retryable.characters.a.profileImage,stale,"클라우드에 사진이 없으면 기기 참조의 재시도 기회를 유지해야 함");

console.log("PASS media cloud recovery");
