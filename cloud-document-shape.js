// Firestore counts nested maps and arrays toward its document depth limit.
// Keep a margin for the root state field and metadata wrapper.
export function needsCompressedCloudState(value,depth=0){
 if(!value||typeof value!=="object")return false;
 if(depth>=18)return true;
 return Object.values(value).some(item=>needsCompressedCloudState(item,depth+1));
}
export function cloudDocumentLimitError(error){
 const message=String(error?.message||'').toLowerCase();
 return /maximum.*depth|nested.*too deep|maximum.*size|document.*too large|exceeds.*(?:1048576|1[ -]?mib|1[ -]?mb)/.test(message);
}
