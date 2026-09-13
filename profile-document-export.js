export function profileExporter(cap=globalThis.window?.Capacitor){
  if(!cap?.isNativePlatform?.())return null;
  return cap.Plugins?.[cap.getPlatform?.()==='ios'?'IOSProfileExport':'ProfileExport']||null;
}
export async function saveNativeProfile(plugin,canvas,filename,format,platform){
  const data=canvas.toDataURL('image/png');
  if(platform!=='ios')return plugin[format==='pdf'?'savePdf':'savePng']({filename,data});
  const base64=data.slice(data.indexOf(',')+1);let token;
  try{
    for(let offset=0;offset<base64.length;offset+=49152){
      const result=await plugin.appendImage({token,offset,data:base64.slice(offset,offset+49152)});
      token=result.token;
      await new Promise(resolve=>setTimeout(resolve,0));
    }
    return await plugin[format==='pdf'?'savePdf':'savePng']({filename,token});
  }catch(error){if(token)try{await plugin.cancelImage({token})}catch{};throw error}
}
