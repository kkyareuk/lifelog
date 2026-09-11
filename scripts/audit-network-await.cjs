const ts=require('typescript'),fs=require('node:fs'),cp=require('node:child_process');
const files=cp.execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(f=>/\.(js|mjs|cjs)$/.test(f)&&(!f.includes('/')||f.startsWith('functions/'))&&!f.startsWith('functions/runtime/'));
const rows=[],calls=[];
for(const file of files){
 const source=fs.readFileSync(file,'utf8'),tree=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
 function visit(node,loops=[]){
  if(ts.isFunctionLike(node)&&!(ts.isCallExpression(node.parent)&&/\.(forEach|map)\s*$/.test(node.parent.expression.getText(tree))))loops=[];
  const loop=ts.isForStatement(node)||ts.isForOfStatement(node)||ts.isForInStatement(node)||ts.isWhileStatement(node)||ts.isDoStatement(node)||ts.isCallExpression(node)&&/\.(forEach|map)\s*$/.test(node.expression.getText(tree));
  const active=loop?[...loops,node]:loops;
  const line=tree.getLineAndCharacterOfPosition(node.getStart(tree)).line+1;
  if(ts.isAwaitExpression(node)&&active.length){const expr=node.expression.getText(tree).replace(/\s+/g,' ').slice(0,220);rows.push({file,line,loop:tree.getLineAndCharacterOfPosition(active.at(-1).getStart(tree)).line+1,expr})}
  if(ts.isCallExpression(node)&&/^(getDoc|getDocFromServer|getDocs|getDocsFromServer|onSnapshot)$/.test(node.expression.getText(tree)))calls.push({file,line,expr:node.getText(tree).replace(/\s+/g,' ').slice(0,220)});
  ts.forEachChild(node,child=>visit(child,active));
 }
 visit(tree);
}
const cell=s=>s.replaceAll('|','\\|');
let out='# Network await inventory\n\nStatic inventory of tracked app-root and functions source. Await inside a loop is a candidate, not proof of sequential network traffic. map/worker pools may already run concurrently. Each row costs up to N calls only if the awaited operation performs a remote request; local awaits cost zero network requests. Generated runtime and scripts are excluded.\n\n| File | Line | Enclosing loop line | Awaited operation | Request estimate / priority |\n|---|---:|---:|---|---|\n';
for(const r of rows)out+=`| ${r.file} | ${r.line} | ${r.loop} | ${cell(r.expr)} | N iterations; inspect call target before ranking |\n`;
out+='\n## Firestore client call sites\n\n| File | Line | Call |\n|---|---:|---|\n';
for(const r of calls)out+=`| ${r.file} | ${r.line} | ${cell(r.expr)} |\n`;
fs.writeFileSync('docs/network-await-inventory.md',out);console.log(`${rows.length} loop-await candidates, ${calls.length} client Firestore call sites`);
