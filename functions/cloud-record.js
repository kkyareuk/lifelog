const {gunzipSync}=require('node:zlib');
const decode=value=>value?.recordEncoding==='gzip-v1'&&typeof value.gameStateGzip==='string'?JSON.parse(gunzipSync(Buffer.from(value.gameStateGzip,'base64')).toString('utf8')):value||{};
module.exports=decode;
