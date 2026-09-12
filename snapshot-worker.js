import {pack,unpack} from './snapshot-codec.js';
self.onmessage=({data:{id,value,level,repack}})=>{
  try{self.postMessage({id,value:pack(repack?unpack(value):value,level)})}
  catch(error){self.postMessage({id,error:String(error?.message||error)})}
};
