// Keep Android bridge messages bounded. iOS retains its existing native exporter.
export async function exportNativeJson(plugin, filename, data, platform=globalThis.Capacitor?.getPlatform?.()) {
  if (platform !== 'android') return plugin.saveJson({filename,data});
  let backupToken,offset=0;
  try {
    for(let start=0;start<data.length;) {
      let end=Math.min(start+32768,data.length);
      const last=data.charCodeAt(end-1);
      if(end<data.length&&last>=0xD800&&last<=0xDBFF)end--;
      const chunk=data.slice(start,end);
      const result=await plugin.appendJsonChunk({backupToken,offset,data:chunk});
      backupToken=result.backupToken;offset=result.offset;start=end;
      // Allow paint/touch work between bridge messages, including export feedback.
      await new Promise(resolve=>setTimeout(resolve,0));
    }
    return await plugin.saveJson({filename,backupToken});
  } catch(error) {
    if(backupToken)try{await plugin.cancelJsonExport({backupToken})}catch{}
    throw error;
  }
}
