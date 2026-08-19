import assert from "node:assert/strict";
import {access,readFile} from "node:fs/promises";
import {relative} from "node:path";
import {fileURLToPath} from "node:url";

const output=new URL("../www/",import.meta.url),outputPath=fileURLToPath(output);
const relativeImports=source=>{
  const found=[];
  const pattern=/(?:from\s*|import\s*\(\s*)["'](\.[^"']+)["']/g;
  let match;
  while((match=pattern.exec(source)))found.push(match[1]);
  return found;
};
const queue=["app.js","native-app.js"],visited=new Set();
while(queue.length){
  const name=queue.shift();
  if(visited.has(name))continue;
  visited.add(name);
  const moduleUrl=new URL(name,output),source=await readFile(moduleUrl,"utf8");
  for(const specifier of relativeImports(source)){
    const dependencyUrl=new URL(specifier,moduleUrl);dependencyUrl.search="";dependencyUrl.hash="";
    const dependencyName=relative(outputPath,fileURLToPath(dependencyUrl)).replaceAll("\\","/");
    assert.ok(!dependencyName.startsWith("../"),`${name}이 Android 자산 밖의 모듈을 참조합니다: ${specifier}`);
    await access(dependencyUrl);
    if(dependencyName.endsWith(".js"))queue.push(dependencyName);
  }
}
assert.ok(visited.has("sync-merge.js"),"백업·클라우드 병합 모듈이 Android 패키지에서 누락되었습니다");
console.log(`PASS Android 모듈 의존 파일 ${visited.size}개가 모두 포함되었습니다`);
